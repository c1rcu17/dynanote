<template lang="pug">
#view.fill-height
  v-toolbar(app)
    v-toolbar-title Dynanote
  v-content.fill-height
    v-container(fluid)
      v-layout(row wrap)
        v-flex(xs12 mt-5 text-xs-center)
          h1 Welcome to Dynanote
        v-flex(xs12 sm6 offset-sm3 mt-3 text-xs-center)
          blockquote.blockquote.px-0
            | Take powerful notes with markdown and handlebars
            br
            | and save them to your Google Drive
        v-flex(xs12 sm6 offset-sm3 mt-5 text-xs-center)
          img(
            @click="signInCb"
            src="../assets/google_signin_light_normal.png"
            style="height: 4em; cursor: pointer"
          )
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState([
      'signInCb'
    ])
  },
  async created() {
    this.$store.commit('setLightTheme');
  }
};
</script>
