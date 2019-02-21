<template lang="pug">
v-snackbar(
  v-model="show"
  :timeout="5000"
  color="error"
  auto-height
  bottom
  vertical
)
  | {{ currentError }}
  v-btn(@click="show = false" flat) Close
</template>

<script>
export default {
  props: {
    errors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: false,
      currentError: ''
    };
  },
  watch: {
    show(nv) {
      if (!nv) {
        this.$nextTick(() => {
          this.nextError();
        });
      }
    },
    errors(nv) {
      if (!this.show) {
        this.nextError();
      } else if (nv[nv.length - 1] === this.currentError) {
        nv.pop();
      }
    }
  },
  methods: {
    nextError() {
      if (this.errors.length > 0) {
        this.show = true;
        this.currentError = this.errors.shift();
      }
    }
  }
};
</script>
