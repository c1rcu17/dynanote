<template lang="pug">
#edit.fill-height
  v-navigation-drawer(v-model="noteDrawer" app clipped right width="400")
    v-list(two-line)
      v-list-tile
        v-text-field(v-model="activeNote.title", label="Name", required)
      v-list-tile
        v-combobox(
          v-model="activeNote.tags"
          :items="$store.getters.allTags"
          label="Tags"
          dense
          multiple
          small-chips
          deletable-chips
          hide-selected
        )
      v-list-tile(v-if="false" href="javascript:;")
        v-list-tile-action
          v-checkbox(v-model="activeNote.encrypted")
        v-list-tile-content(@click="activeNote.encrypted = !activeNote.encrypted")
          v-list-tile-title Encrypted
      v-list-tile(v-if="activeNote.encrypted")
        v-text-field(
          v-model="password"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          @click:append="showPassword = !showPassword"
        )
  v-toolbar(app clipped-right)
    v-tooltip(bottom)
      v-btn(:to="{ name: 'home' }" slot="activator" icon exact)
        v-icon home
      span Home
    v-toolbar-title {{ activeNote.title }}
    v-spacer
    v-tooltip(bottom)
      v-btn(@click="preview" slot="activator" icon)
        v-icon visibility
      span View
    v-tooltip(bottom)
      v-btn(@click="$refs.contextEditor.show = true" slot="activator" icon)
        v-icon settings_ethernet
      span Context
    v-tooltip(bottom)
      v-btn(
        @click="saveNote"
        :disabled="activeNote.isSaved"
        slot="activator"
        icon
      )
        v-icon save
      span Save
    v-tooltip(bottom)
      v-toolbar-side-icon(@click="noteDrawer = !noteDrawer" slot="activator")
      span Options
  v-content.fill-height
    AceEditor(
      v-model="activeNote.text"
      :theme="editorTheme"
      language="markdown"
      :options="noteOptions"
    )
  ContextEditor(
    :context.sync="activeNote.context"
    :theme="editorTheme"
    :options="editorCommonOptions"
    ref="contextEditor"
  )
</template>

<script>
import { mapState } from 'vuex';
import AceEditor from '../components/AceEditor.vue';
import ContextEditor from '../components/ContextEditor.vue';
import { MAX_TAGS } from '../lib/notes';

export default {
  components: {
    AceEditor,
    ContextEditor
  },
  data() {
    return {
      noteDrawer: false,
      password: '',
      showPassword: false
    };
  },
  computed: {
    ...mapState([
      'editorTheme',
      'editorCommonOptions',
      'activeNote'
    ]),
    noteOptions() {
      return {
        ...this.editorCommonOptions,
        showFoldWidgets: true,
        showLineNumbers: true,
        showGutter: true
      };
    },
    noteId() {
      return this.$router.currentRoute.params.id;
    }
  },
  async created() {
    this.$store.commit('setDarkTheme');

    await this.$store.dispatch('loadNote', { id: this.noteId });

    this.$watchAll([
      'activeNote.title',
      'activeNote.tags',
      'activeNote.encrypted',
      'activeNote.text',
      'activeNote.context'
    ], (nv, _, field) => {
      if (field === 'activeNote.tags' && nv.length > MAX_TAGS) {
        this.activeNote.tags.pop();
        return;
      }

      if (this.activeNote.isSaved) {
        this.$store.commit('updateActiveNote', { changes: { isSaved: false } });
      }
    });
  },
  methods: {
    preview() {
      this.$router.push({ name: 'view', params: { id: this.noteId } });
    },
    async saveNote() {
      await this.$store.dispatch('saveNote');
    }
  }
};
</script>
