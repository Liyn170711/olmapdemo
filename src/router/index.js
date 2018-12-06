import Vue from 'vue'
import Router from 'vue-router'
import DrawTrack from '@/components/DrawTrack'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: "/drawtrack"
    },
    {
      path: '/drawtrack',
      name: 'DrawTrack',
      component: DrawTrack
    }
  ]
})
