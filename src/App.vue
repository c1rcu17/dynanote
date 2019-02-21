<template lang="pug">
#app
  v-app(:dark="useDarkTheme")
    transition(name="slide-fade" mode="out-in")
      router-view
    v-dialog(:value='loadingText !== null', hide-overlay, persistent, width='300')
      v-card
        v-card-text
          | {{ loadingText }}
          v-progress-linear.mb-0(indeterminate)
    ErrorsSnackbar(:errors="errors")
</template>

<script>
import { mapState } from 'vuex';
import ErrorsSnackbar from './components/ErrorsSnackbar.vue';

export default {
  components: {
    ErrorsSnackbar
  },
  computed: mapState([
    'useDarkTheme',
    'loadingText',
    'errors'
  ])
};
</script>

<style lang="stylus">
@import '~roboto-fontface/css/roboto/roboto-fontface.css';
@import '~material-design-icons-iconfont/dist/material-design-icons.css';
@import '~typeface-inconsolata/index.css';
@import '~vuetify/src/stylus/main';

html {
  overflow-y: hidden;
}

.ace_editor {
  height: 100%;
}

.slide-fade-enter-active {
  transition: all .2s ease;
}

.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter {
  transform: translateY(10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
