<template lang="pug">
v-dialog(v-model="show" :max-width="width" persistent)
  v-card
    v-card-title.headline {{ title }}
    v-card-text
      slot
    v-card-actions
      v-spacer
      v-btn(@click="setAnswer(false)" color="red darken-1" flat) {{ noBt }}
      v-btn(@click="setAnswer(true)" color="green darken-1" flat) {{ yesBt }}
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 290
    },
    title: {
      type: String,
      required: true
    },
    yesBt: {
      type: String,
      default: 'Yes'
    },
    noBt: {
      type: String,
      default: 'No'
    }
  },
  data() {
    return {
      show: false,
      promise: null,
      resolve: null
    };
  },
  methods: {
    open() {
      if (!this.show) {
        this.promise = new Promise((resolve) => {
          this.resolve = resolve;
        });
      }

      this.show = true;

      return this.promise;
    },
    setAnswer(value) {
      if (this.show) {
        const { resolve } = this;
        this.promise = null;
        this.resolve = null;
        resolve(value);
      }

      this.show = false;
    }
  }
};
</script>
