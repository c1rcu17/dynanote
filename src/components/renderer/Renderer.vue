<template>
  <iframe
    :srcdoc="html"
    style="border-style: none"
    height="100%"
    width="100%"/>
</template>

<script>
import render from './render';

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    context: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      html: ''
    };
  },
  methods: {
    async render() {
      this.html = await render(this.title, this.text, this.context);
    }
  }
};
</script>
