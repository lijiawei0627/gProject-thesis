import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'common/stylus/index.styl'

// 整个body中的按钮点击都不会再有300ms的延时
fastclick.attach(document.body)
Vue.use(ElementUI)
// 图片懒加载
Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})
Vue.prototype.$axios = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
  store
})
