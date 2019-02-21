<template>
  <div/>
</template>

<script>
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-emmet';

// import 'ace-builds/webpack-resolver'; // autoloader
// eslint-disable-next-line import/no-webpack-loader-syntax
// import javascriptWorker from 'file-loader!ace-builds/src-min-noconflict/worker-javascript';

// ace.config.setModuleUrl('ace/mode/javascript_worker', javascriptWorker);

export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      editor: null,
      cached: ''
    };
  },
  watch: {
    value(nv) {
      if (this.editor) {
        this.setValue(nv);
      }
    },
    theme(nv) {
      if (this.editor) {
        this.setTheme(nv);
      }
    },
    language(nv) {
      if (this.editor) {
        this.setLanguage(nv);
      }
    },
    options: {
      deep: true,
      handler(nv) {
        if (this.editor) {
          this.setOptions(nv);
        }
      }
    }
  },
  mounted() {
    this.editor = ace.edit(this.$el);
    this.setValue(this.value);
    this.setTheme(this.theme);
    this.setLanguage(this.language);

    // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
    this.setOptions({
      highlightActiveLine: false,
      highlightSelectedWord: true,
      cursorStyle: 'slim',
      useSoftTabs: true,
      navigateWithinSoftTabs: true,
      highlightGutterLine: false,
      showInvisibles: false,
      showPrintMargin: false,
      showFoldWidgets: false,
      showLineNumbers: false,
      showGutter: false,
      displayIndentGuides: true,
      newLineMode: 'unix',
      tabSize: 2,
      enableMultiselect: true,
      enableEmmet: true,
      enableBasicAutocompletion: true,
      ...this.options
    });

    this.editor.on('change', (e) => {
      this.$emit('input', this.cached = this.editor.getValue(), e);
    });
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    }
  },
  methods: {
    setValue(value) {
      if (value !== this.cached) {
        this.editor.setValue(this.cached = value === null ? '' : value, -1);
      }
    },
    setTheme(theme) {
      this.editor.setTheme(theme.length ? `ace/theme/${theme}` : '');
    },
    setLanguage(language) {
      this.editor.getSession().setMode(language.length ? `ace/mode/${language}` : '');
    },
    setOptions(options) {
      this.editor.setOptions(options);
    }
  }
};
</script>
