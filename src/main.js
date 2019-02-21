import Vue from 'vue';
import {
  Vuetify,
  VApp,
  VGrid,
  VNavigationDrawer,
  VToolbar,
  VDialog,
  VSnackbar,
  VCard,
  VTooltip,
  VProgressLinear,
  VTextField,
  VBtn,
  VIcon,
  VAlert,
  VDataTable,
  VChip,
  VList,
  VCombobox,
  transitions
} from 'vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import watchAll from './plugins/watch-all';

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  components: {
    VApp,
    VGrid,
    VNavigationDrawer,
    VToolbar,
    VDialog,
    VSnackbar,
    VCard,
    VTooltip,
    VProgressLinear,
    VTextField,
    VBtn,
    VIcon,
    VAlert,
    VDataTable,
    VChip,
    VList,
    VCombobox,
    transitions
  }
});

Vue.use(watchAll);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
