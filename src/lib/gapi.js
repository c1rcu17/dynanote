let LOAD_GAPI_PROMISE = null;

const loadGapi = () => {
  if (!LOAD_GAPI_PROMISE) {
    LOAD_GAPI_PROMISE = new Promise(((resolve, reject) => {
      if (window.gapi !== undefined) {
        resolve(window.gapi);
        return;
      }

      const errorMsg = 'Could not load Google API Client';
      const head = document.head || document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      let timeoutId = null;

      const cancel = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        script.onload = null;
        script.onerror = null;
      };

      timeoutId = setTimeout(() => {
        cancel();
        reject(new Error(errorMsg));
      }, 10000);

      Object.assign(script, {
        type: 'text/javascript',
        async: true,
        src: 'https://apis.google.com/js/api.js',
        onload: () => {
          cancel();
          resolve(window.gapi);
        },
        onerror: () => {
          cancel();
          reject(new Error(errorMsg));
        }
      });

      head.appendChild(script);
    }));
  }

  return LOAD_GAPI_PROMISE;
};

const loadGapiLibraries = (gapi, libraries = []) => new Promise(((resolve, reject) => {
  const errorMsg = 'Google API Client Libraries failed to load';

  gapi.load(libraries.join(':'), {
    callback() {
      resolve(gapi);
    },
    onerror() {
      reject(new Error(errorMsg));
    },
    timeout: 10000,
    ontimeout() {
      reject(new Error(errorMsg));
    }
  });
}));

const loadGapiClient = async ({
  apiKey = '', clientId = '', discoveryDocs = [], scope = []
} = {}) => {
  const gapi = await loadGapi();
  await loadGapiLibraries(gapi, ['client', 'auth2']);
  await gapi.client.init({
    apiKey, clientId, discoveryDocs, scope: scope.join(' ')
  });
  return gapi;
};

export { loadGapi, loadGapiLibraries, loadGapiClient };
