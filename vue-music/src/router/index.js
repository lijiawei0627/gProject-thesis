import Vue from 'vue'
import Router from 'vue-router'

const Recommend = () => import('components/recommend/recommend.vue')
const Singer = () => import('components/singer/singer.vue')
const Rank = () => import('components/rank/rank.vue')
const Search = () => import('components/search/search.vue')
const SingerDetail = () => import('components/singer-detail/singer-detail')
const Disc = () => import('components/disc/disc')
const TopList = () => import('components/top-list/top-list')
const UserCenter = () => import('components/user-center/user-center')
const UserLogin = () => import('components/user-login/user-login1')

Vue.use(Router)
// 解决重复点击路由会报错的问题
const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const router = new Router({
  routes: [
    {path: '/', redirect: '/recommend'},
    { path: '/recommend',
      component: Recommend,
      children: [
        {path: ':id', component: Disc}
      ]
    },
    { path: '/singer',
      component: Singer,
      children: [
        {path: ':id', component: SingerDetail}
      ]
    },
    { path: '/rank',
      component: Rank,
      children: [
        {path: ':id', component: TopList}
      ]
    },
    { path: '/search',
      component: Search,
      children: [
        {path: ':id', component: SingerDetail}
      ]
    },
    {
      path: '/user',
      component: UserCenter,
      beforeEnter: (to, from, next) => {
        // 用户权限设定
        const isLogin = localStorage.isLogin
        isLogin ? next() : next('/login')
      }
    },
    {path: '/login', component: UserLogin}
  ]
})

export default router
