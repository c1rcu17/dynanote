<template lang="pug">
#view.fill-height
  v-toolbar(app)
    v-toolbar-title Dynanote
  v-content.fill-height
    v-container(fluid)
      v-layout(row wrap)
        v-flex(xs12 mt-5 text-xs-center)
          h1 404
        v-flex(xs12 sm6 offset-sm3 mt-3 text-xs-center)
          blockquote.blockquote.px-0 There is nothing here. Head&nbsp
            a(@click="$router.go(-1)") back
</template>

<script>
export default {
  async created() {
    this.$store.commit('setLightTheme');
  }
};
</script>
