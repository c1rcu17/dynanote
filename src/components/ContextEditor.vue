<template lang="pug">
v-dialog(v-model="show" fullscreen transition="dialog-bottom-transition")
  v-card.fill-height
    v-toolbar(app)
      v-toolbar-title Context
      v-spacer
      v-tooltip(bottom z-index="99999")
        v-btn(@click='close' slot="activator" icon)
          v-icon close
        span Close
    v-content.fill-height
      AceEditor(
        @input="$emit('update:context', $event)"
        :value="context"
        :theme="theme"
        language="yaml"
        :options="contextOoptions"
      )
</template>

<script>
import AceEditor from './AceEditor.vue';

export default {
  components: {
    AceEditor
  },
  props: {
    context: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      show: false,
      contextOoptions: {
        ...this.options,
        displayIndentGuides: false
      }
    };
  },
  methods: {
    close() {
      this.$emit('closing');
      this.show = false;
    }
  }
};
</script>
