/* eslint no-param-reassign: ["error", { "props": false }] */
import Vue from 'vue';
import Vuex from 'vuex';
import {
  generateNoteId,
  createNote,
  updateNote,
  getNotesList,
  getNote,
  trashNote
} from './lib/notes';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isSignedIn: false,
    signInCb: () => {},
    signOutCb: () => {},
    useDarkTheme: false,
    errors: [],
    editorTheme: 'tomorrow_night',
    editorCommonOptions: {
      fontFamily: 'Inconsolata, monospace',
      fontSize: '16pt'
    },
    loadingText: null,
    notes: [],
    activeNote: {}
  },
  getters: {
    isSignedIn: state => state.isSignedIn,
    allTags: (state) => {
      const tags = new Set([]);
      state.notes.forEach((n) => {
        n.tags.forEach((t) => {
          tags.add(t);
        });
      });
      return [...tags];
    }
  },
  mutations: {
    signInEvent(state, { isSignedIn, signInCb, signOutCb }) {
      Object.assign(state, { isSignedIn, signInCb, signOutCb });
    },
    setDarkTheme(state) {
      state.useDarkTheme = true;
      state.editorTheme = 'tomorrow_night';
    },
    setLightTheme(state) {
      state.useDarkTheme = false;
      state.editorTheme = 'textmate';
    },
    addError(state, { message }) {
      state.errors.push(message);
    },
    loading(state, { text }) {
      state.loadingText = `${text}...`;
    },
    finishLoading(state) {
      state.loadingText = null;
    },
    setNotes(state, { notes } = {}) {
      state.notes = notes;
    },
    addNote(state, { note } = {}) {
      state.notes.push(note);
    },
    setActiveNote(state, { id } = {}) {
      state.activeNote = state.notes.find(n => n.id === id) || {};
    },
    updateActiveNote(state, { changes } = {}) {
      Object.assign(state.activeNote, changes);
    },
    removeNote(state, { note } = {}) {
      const index = state.notes.indexOf(note);

      if (index !== -1) {
        state.notes.splice(index, 1);
      }
    }
  },
  actions: {
    async fetchNotes({ commit, state }, { force = false } = {}) {
      if (force || !state.notes.length) {
        commit('loading', { text: 'Loading your wonderful notes' });
        const notes = (await getNotesList());
        commit('setNotes', { notes });
        commit('finishLoading');
      }
    },
    async createNote({ commit }) {
      commit('loading', { text: 'Creating a promising new note' });
      const id = await generateNoteId();
      const note = {
        id,
        title: 'Unnamed Note',
        tags: [],
        encrypted: false,
        text: '# {{ noteName }}\n',
        context: 'noteName: Unnamed Note\n',
        isNew: true,
        isSaved: false
      };
      commit('addNote', { note });
      commit('finishLoading');
      return id;
    },
    async loadNote({ commit, dispatch, state }, { id } = {}) {
      await dispatch('fetchNotes');
      commit('loading', { text: 'Opening this admirable note' });
      commit('setActiveNote', { id });
      if (state.activeNote.text === null) {
        commit('updateActiveNote', { changes: await getNote(id) });
      }
      commit('finishLoading');
    },
    async saveNote({ commit, state }) {
      commit('loading', { text: 'Saving the ridiculously good changes' });
      if (state.activeNote.isNew) {
        await createNote(state.activeNote);
      } else {
        await updateNote(state.activeNote);
      }
      commit('updateActiveNote', {
        changes: {
          isNew: false,
          isSaved: true
        }
      });
      commit('finishLoading');
    },
    async deleteNote({ commit }, { note }) {
      commit('loading', { text: 'Deleting this shameful note' });
      if (!note.isNew) {
        await trashNote(note.id);
      }
      commit('removeNote', { note });
      commit('finishLoading');
    }
  }
});

export default store;
