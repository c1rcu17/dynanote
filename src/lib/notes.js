import { loadGapi } from './gapi';

const MAX_TAGS = 5;
const DATA_FOLDER_NAME = 'Dynanote';
let DATA_FOLDER_ID = null; // 'appDataFolder' - Use private Application Data folder

const parseNote = (input) => {
  const { id, appProperties } = input;
  const { title, encrypted } = appProperties;

  const tags = [];

  for (let i = 0; i < MAX_TAGS; i += 1) {
    const key = `t${i}`;

    if (!Object.hasOwnProperty.call(appProperties, key)) {
      break;
    }

    tags.push(appProperties[key]);
  }

  return {
    id,
    title,
    tags,
    encrypted: encrypted !== 'false',
    text: null,
    context: null,
    isNew: false,
    isSaved: true
  };
};

const generateTagMap = (tags) => {
  const tagMap = {};

  // Docs: Entries with null values are cleared in update and copy requests
  for (let i = 0; i < MAX_TAGS; i += 1) {
    tagMap[`t${i}`] = tags[i] || null;
  }

  return tagMap;
};

const getSpace = () => (DATA_FOLDER_ID === 'appDataFolder' ? 'appDataFolder' : 'drive');

const gapiMultipart = async ({
  method, path, parameters, metadata, media, mediaMimeType
}) => {
  const gapi = await loadGapi();
  const boundary = `-------gapi.${Date.now()}`;
  const delimiter = `--${boundary}`;
  const endDelimiter = `--${boundary}--`;

  const body = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    '',
    delimiter,
    `Content-Type: ${mediaMimeType}`,
    '',
    media,
    '',
    endDelimiter
  ].join('\r\n');

  return gapi.client.request({
    path,
    method,
    params: {
      ...parameters,
      uploadType: 'multipart'
    },
    headers: {
      'Content-Type': `multipart/mixed; boundary="${boundary}"`
    },
    body
  });
};

const assertDataFolder = async () => {
  if (DATA_FOLDER_ID === null) {
    const folderMimeType = 'application/vnd.google-apps.folder';
    const gapi = await loadGapi();

    let response = await gapi.client.drive.files.list({
      q: `name='${DATA_FOLDER_NAME}' and mimeType='${folderMimeType}' and trashed = false`,
      fields: 'files(id)'
    });

    const { files } = response.result;

    if (files.length) {
      DATA_FOLDER_ID = files[0].id;
    } else {
      response = await gapi.client.drive.files.create({
        name: DATA_FOLDER_NAME,
        mimeType: folderMimeType,
        fields: 'id'
      });

      DATA_FOLDER_ID = response.result.id;
    }
  }
};

const generateNoteId = async () => {
  const gapi = await loadGapi();

  const response = await gapi.client.drive.files.generateIds({
    count: 1,
    spaces: getSpace()
  });

  return response.result.ids[0];
};

const createNote = async ({
  id, title, tags, encrypted, text, context
}) => {
  await assertDataFolder();

  const response = await gapiMultipart({
    method: 'POST',
    path: '/upload/drive/v3/files',
    parameters: { fields: 'id, appProperties' },
    metadata: {
      id,
      name: `${Date.now()}.json`,
      appProperties: {
        title,
        ...generateTagMap(tags),
        encrypted
      },
      parents: [DATA_FOLDER_ID],
      mimeType: 'application/json'
    },
    media: JSON.stringify({
      text,
      context
    }),
    mediaMimeType: 'application/json'
  });

  return parseNote(response.result);
};

const updateNote = async ({
  id, title, tags, encrypted, text, context
}) => {
  const response = await gapiMultipart({
    method: 'PATCH',
    path: `/upload/drive/v3/files/${id}`,
    parameters: { fields: 'id, appProperties' },
    metadata: {
      appProperties: {
        title,
        ...generateTagMap(tags),
        encrypted
      },
      mimeType: 'application/json'
    },
    media: JSON.stringify({
      text,
      context
    }),
    mediaMimeType: 'application/json'
  });
  return parseNote(response.result);
};

const getNotesListRecursive = async (gapi, pageToken) => {
  const response = await gapi.client.drive.files.list({
    q: `'${DATA_FOLDER_ID}' in parents and mimeType='application/json' and trashed = false`,
    spaces: getSpace(),
    fields: 'nextPageToken, files(id, appProperties)',
    ...(pageToken !== undefined ? { pageToken } : {}),
    pageSize: 1000
  });

  const { files, nextPageToken } = response.result;
  const notes = files.map(parseNote);

  if (!nextPageToken) {
    return notes;
  }

  const next = await getNotesListRecursive(gapi, nextPageToken);

  return notes.concat(next);
};

const getNotesList = async () => {
  await assertDataFolder();

  const gapi = await loadGapi();

  return getNotesListRecursive(gapi);
};

const getNote = async (id) => {
  const gapi = await loadGapi();

  const [metadata, media] = await Promise.all([
    gapi.client.drive.files.get({
      fileId: id,
      fields: 'id, appProperties'
    }),
    gapi.client.drive.files.get({
      fileId: id,
      alt: 'media'
    })
  ]);

  const note = {
    ...parseNote(metadata.result),
    ...media.result
  };

  return note;
};

const trashNote = async (id) => {
  const gapi = await loadGapi();

  await gapi.client.drive.files.update({
    fileId: id,
    trashed: true
  });
};

export {
  MAX_TAGS,
  generateNoteId,
  createNote,
  updateNote,
  getNotesList,
  getNote,
  trashNote
};
