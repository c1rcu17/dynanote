<template lang="pug">
#view.fill-height
  v-toolbar(app)
    v-tooltip(bottom)
      v-btn(:to="{ name: 'home' }" slot="activator" icon exact)
        v-icon home
      span Home
    v-toolbar-title Dynanote
    v-spacer
    v-tooltip(bottom)
      v-btn(:to="{ name: 'edit', params: { id: noteId }}" slot="activator" icon)
        v-icon edit
      span Edit
    v-tooltip(bottom)
      v-btn(@click="$refs.contextEditor.show = true" slot="activator" icon)
        v-icon settings_ethernet
      span Context
  v-content.fill-height
    Renderer(
      :title="activeNote.title"
      :text="activeNote.text"
      :context="context"
      ref="renderer"
    )
  ContextEditor(
    @closing="contextEditorClosing"
    :context.sync="context"
    :theme="editorTheme"
    :options="editorCommonOptions"
    ref="contextEditor"
  )
</template>

<script>
import { mapState } from 'vuex';
import ContextEditor from '../components/ContextEditor.vue';
import Renderer from '../components/renderer/Renderer.vue';

export default {
  components: {
    ContextEditor,
    Renderer
  },
  data() {
    return {
      context: ''
    };
  },
  computed: {
    ...mapState([
      'editorTheme',
      'editorCommonOptions',
      'activeNote'
    ]),
    noteId() {
      return this.$router.currentRoute.params.id;
    }
  },
  async created() {
    this.$store.commit('setLightTheme');
    await this.$store.dispatch('loadNote', { id: this.noteId });
    this.context = this.activeNote.context;
    this.$nextTick(async () => {
      await this.$refs.renderer.render();
    });
  },
  methods: {
    async contextEditorClosing() {
      await this.$refs.renderer.render();
    }
  }
};
</script>
