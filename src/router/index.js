import Vue from 'vue'
import Router from 'vue-router'
import HelloMap from '@/components/HelloMap'
import DrawTrack from '@/components/DrawTrack'
import DrawTrack2 from '@/components/DrawTrack2'
import ScaleLine from '@/components/control/ScaleLine'
import OverviewMap from '@/components/control/OverviewMap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: "/overviewMap"
    },
    {
      path: '/helloMap',
      name: 'HelloMap',
      component: HelloMap
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
    },
    {
      path: '/scaleLine',
      name: 'ScaleLine',
      component: ScaleLine
    },
    {
      path: '/overviewMap',
      name: 'OverviewMap',
      component: OverviewMap
    }
  ]
})
