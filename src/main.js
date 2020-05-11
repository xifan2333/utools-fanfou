import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import message from './components/message'
Vue.use(message);
// import VuetifyMessage from 'vuetify-message';
// Vue.use(VuetifyMessage,{
//   timeout: 1000,
//   property: '$message',
//   value:true
// })
Vue.config.productionTip = false
Vue.prototype.$user = window.user
Vue.prototype.$utools = window.utools


new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
