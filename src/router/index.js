import Vue from 'vue'
import Router from 'vue-router'
import DrawTrack from '@/components/DrawTrack'
import DrawTrack2 from '@/components/DrawTrack2'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: "/drawtrack2"
    },
    {
      path: '/drawtrack',
      name: 'DrawTrack',
      component: DrawTrack
    },
    {
      path: '/drawtrack2',
      name: 'DrawTrack2',
      component: DrawTrack2
    }
  ]
})
