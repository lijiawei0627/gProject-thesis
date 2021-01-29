import Vue from 'vue'
import Vuex from 'vuex'
// 之后使用里面的方法可以直接以 actions.方法名 / getters.方法名 的形式获取，不需要用花括号{}
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 当通过mutations对state进行修改时，会在控制台打印出一条日志，显示之前的state状态和修改后的状态
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 调试工具，只在开发的时候启用
// 在严格模式下会检测对state中数据的修改是否来源于mutations，否则会警告
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
