const plugin = {
  install(Vue) {
    Object.defineProperties(Vue.prototype, {
      $watchAll: {
        get() {
          return (props, callback, options) => {
            props.forEach((prop) => {
              this.$watch(prop, (...args) => callback.bind(this)(...args, prop), options);
            });
          };
        }
      }
    });
  }
};

export default plugin;
