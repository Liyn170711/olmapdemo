import Vue from 'vue'
import Router from 'vue-router'
import DrawTrack from '@/components/DrawTrack'
import DrawTrack2 from '@/components/DrawTrack2'
import TestOLMap from '@/components/TestOLMap'
import RoutePlanning from '@/components/routeplanning/RoutePlanning'
import AMapRouteStyle from '@/components/routeplanning/AMapRouteStyle'
import AMapRouteStyle2 from '@/components/routeplanning/AMapRouteStyle2'
import IsImgExist from '@/prac/IsImgExist'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: "/AMapRouteStyle"
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
      path: '/testolmap',
      name: 'TestOLMap',
      component: TestOLMap
    },
    {
      path: '/routePlanning',
      name: 'RoutePlanning',
      component: RoutePlanning
    },
    {
      path: '/aMapRouteStyle',
      name: 'AMapRouteStyle',
      component: AMapRouteStyle
    },
    {
      path: '/aMapRouteStyle2',
      name: 'AMapRouteStyle2',
      component: AMapRouteStyle2
    },
    {
      path: '/isImgExist',
      name: 'IsImgExist',
      component: IsImgExist
    }
  ]
})
