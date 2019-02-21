import { loadGapiClient } from './gapi';
import config from '../config/config.json';

const credentials = {
  ...config.google,
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: ['https://www.googleapis.com/auth/drive.file']
};

let GAPI = null;
let beforeLoginPath = null;

const getBeforeLoginPath = () => {
  const result = beforeLoginPath;
  beforeLoginPath = null;
  return result;
};

const flashBeforeLoginPath = (path) => {
  beforeLoginPath = path;
};

const gapiAuthMiddleware = (router, store, homeRoute, loginRoute) => async (to, _, next) => {
  const firstSignInEvent = (isSignedIn) => {
    store.commit('signInEvent', {
      isSignedIn,
      signInCb: () => GAPI.auth2.getAuthInstance().signIn(),
      signOutCb: () => GAPI.auth2.getAuthInstance().signOut()
    });
  };

  const signInEvent = (isSignedIn) => {
    firstSignInEvent(isSignedIn);

    const goTo = getBeforeLoginPath();

    if (goTo !== null) {
      router.replace(goTo);
    } else {
      router.go();
    }
  };

  if (GAPI === null) {
    GAPI = await loadGapiClient(credentials);
    // Listen for sign-in state changes.
    GAPI.auth2.getAuthInstance().isSignedIn.listen(signInEvent);
    // Handle the initial sign-in state.
    firstSignInEvent(GAPI.auth2.getAuthInstance().isSignedIn.get());
  }


  if (store.getters.isSignedIn) {
    if ([loginRoute].includes(to.path)) {
      // block login routes
      return next(homeRoute);
    }

    // allow others
    return next();
  }

  // if not authenticated
  if (to.meta.requiresAuth) {
    flashBeforeLoginPath(to.fullPath);
    return next(loginRoute);
  }

  return next();
};

export default gapiAuthMiddleware;
