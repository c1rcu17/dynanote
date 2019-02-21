import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import View from './views/View.vue';
import Edit from './views/Edit.vue';
import NotFound from './views/NotFound.vue';
import store from './store';
import gapiAuthMiddleware from './lib/gapi-auth-middleware';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/view/:id',
      name: 'view',
      component: View,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: Edit,
      meta: { requiresAuth: true }
    },
    {
      path: '/404',
      component: NotFound
    },
    {
      path: '*',
      redirect: '/404'
    }
  ]
});

router.beforeEach(gapiAuthMiddleware(router, store, '/', '/login'));

export default router;
