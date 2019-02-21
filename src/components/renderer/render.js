import 'whatwg-fetch';
import memoize from 'lodash/memoize';
import yaml from 'js-yaml';
import Handlebars from 'handlebars/dist/handlebars';
import jsonata from 'jsonata';
import MarkdownIt from 'markdown-it';
import hljs from './highlight';

const silent = () => {};

const fetchSkeleton = async () => {
  try {
    const result = await fetch('/note-skel.html');
    return result.text();
  } catch (err) {
    return '<note>';
  }
};

const skeleton = fetchSkeleton();

const assignJsonata = memoize(jsonata);

class JsonataError {
  constructor(message, sourceError) {
    this.name = 'JsonataError';
    this.message = message;
    this.src = sourceError;
  }
}

const assignHelper = (...args) => {
  if (args.length !== 3) {
    throw new Error('helper \'assign\' needs 2 parameters');
  }

  const [key, expression, options] = args;
  const { root } = options.data;

  try {
    root[key] = assignJsonata(expression).evaluate(root);
  } catch (err) {
    throw new JsonataError(`${err.code} - ${err.message}`, err);
  }
};

Handlebars.registerHelper('assign', assignHelper);

const md = MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (_) {
        silent();
      }
    }

    return '';
  }
});

const renderOk = async (title, html) => (await skeleton).replace('<note>', `<h1>${title}</h1><br>${html}`);

const renderError = async (type, errorMessage) =>
  (await skeleton).replace(
    '<note>',
    '<h1 style="color: #B71C1C">Error rendering note</h3>' +
      `<h3>${type}</h3>` +
      `<pre><code>${errorMessage}</code></pre>`
  );

const render = async (title, text, context) => {
  let hbsContext;
  let hbsTemplate;
  let content;

  try {
    hbsContext = yaml.safeLoad(context);
  } catch (err) {
    return renderError('Yaml context parsing', err.message);
  }

  try {
    hbsTemplate = Handlebars.compile(text, {
      knownHelpers: {
        assign: true
      },
      knownHelpersOnly: true,
      strict: true
    });
  } catch (err) {
    console.error(err);
    return renderError('Handlebars compilation', 'Check the dev console');
  }

  try {
    content = hbsTemplate(hbsContext);
  } catch (err) {
    if (err instanceof JsonataError) {
      return renderError('Jsonata processing', err.message);
    }
    return renderError('Handlebars rendering', err.message);
  }

  try {
    content = md.render(content);
  } catch (err) {
    console.error(err);
    return renderError('Markdown rendering', 'Check the dev console');
  }

  return renderOk(title, content);
};

export default render;
