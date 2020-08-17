import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import message from './components/message'
Vue.use(message);

Vue.config.productionTip = false
Vue.prototype.$user = window.user
Vue.prototype.$utools = window.utools


new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
