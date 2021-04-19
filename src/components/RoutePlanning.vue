 <!-- openlayers4结合高德地图API实现的路径规划效果 -->
<template>
  <div>
    <!-- gcj02 -->
    <!-- <bs-map style='position: absolute width: 100% height: 100%' projection='EPSG:4326' :center='[116.397428, 39.90923]' :zoom='13' :maxZoom='19' ref='mapAppContainer' @ready='loadMapReady' @singleclick='handleMapClick'> -->
    <!-- gcj02 墨卡托 -->
    <bs-map style='position: absolute width: 100% height: 100%' projection='EPSG:3857' :center='[12957302.414606724, 4852760.584444312]' :zoom='13' :maxZoom='19' ref='mapAppContainer' @ready='loadMapReady' @singleclick='handleMapClick'>
      <bs-gaodelayer></bs-gaodelayer>
      <!-- <bs-baidulayer></bs-baidulayer> -->
      <!-- <bs-googlelayer></bs-googlelayer> -->
    </bs-map>
    <div class='toolbar'>
      <span class="lable-name">{{startCoords}}</span><button @click="pointerStatus='start'">选取起点</button><br/>
      <span class="lable-name">{{endCoords}}</span><button @click="pointerStatus='end'">选取终点</button><br/>
      <button @click='routePlanning()'>Route Planning</button>
    </div>
  </div>
</template>

<script>
import ol from 'openlayers'
export default {
  name: 'TestOLMap',
  data() {
    return {
        map: null,
        startCoords: [],
        endCoords: [],
        pointerStatus: '' // 鼠标状态，'start'选取起点 'end' 选取终点 ，''不是选取状态
    }
  },
  mounted() {

  },
  methods: {
    loadMapReady(param) {
      this.map = param.map
      // let center = ol.proj.transform(
      //   [116.397428, 39.90923],
      //   'EPSG:4326',
      //   'EPSG:3857'
      // )
      // console.log('center:', center)
    },
    handleMapClick(param) {
      console.log(param.lon, param.lat)
      if (this.pointerStatus === 'start') {
        this.startCoords = [param.lon, param.lat]
        this.pointerStatus = ''
      } else if (this.pointerStatus === 'end') {
        this.endCoords = [param.lon, param.lat]
        this.pointerStatus = ''
      }
    },
    // 路径规划
    async routePlanning() {
      let respData = await this.requestRouteData()
      let routeData = respData.route
      console.log('获取到的路径规划数据：', routeData)
      let {origin, destination, paths} = routeData
      let originCoord = ol.proj.transform(origin.split(',').map(item => Number(item)), 'EPSG:4326', 'EPSG:3857')
      let destinationCoord = ol.proj.transform(destination.split(',').map(item => Number(item)), 'EPSG:4326', 'EPSG:3857')
      let originFeature = new ol.Feature(new ol.geom.Point(originCoord))
      originFeature.name = '起'
      let destinationFeature = new ol.Feature(new ol.geom.Point(destinationCoord))
      destinationFeature.name = '终'
      // 构造最优路径需要展示的要素
      let features = [originFeature, destinationFeature]
      let steps = paths[0].steps // 此处只展示最优路径
      let routeGeometry = new ol.geom.MultiLineString() // 路径（多线，包含多个线段，用于地图定位到路径所在位置
      for (const step of steps) {
        let tmcs = step.tmcs
        for (const tmc of tmcs) {
          let {polyline, status} = tmc
          let points = polyline.split(';')
          let coords = []
          for (const point of points) {
            let coord= ol.proj.transform(point.split(',').map(item => Number(item)), 'EPSG:4326', 'EPSG:3857')
            coords.push(coord)
          }
          let polylineGeom = new ol.geom.LineString(coords)
          let polylineFeature = new ol.Feature(polylineGeom)
          routeGeometry.appendLineString(polylineGeom)
          polylineFeature.status = status
          features.push(polylineFeature)
        }
      }
      // 构造最优路径矢量数据源
      let vectorSource = new ol.source.Vector({
          features: features
      })
      // 构造最优路径图层
      let routeLayer = new ol.layer.Vector({
        source: vectorSource,
        style: this.routeStyle
      })
      this.map.addLayer(routeLayer)
      this.map.getView().fit(routeGeometry.getExtent()) // 地图定位到路径所在位置
    },
    // 请求路径
    requestRouteData() {
      return new Promise((resolve, reject) => {
        // let url = 'https://restapi.amap.com/v3/direction/driving?origin=116.379028,39.865042&destination=116.427281,39.903719&extensions=&s=rsv3&strategy=0&ferry=0&key=c9151976e65cdc5004b24b61ce7504d2&callback=jsonp_153836_&platform=JS&logversion=2.0&appname=https%3A%2F%2Flbs.amap.com%2Fdemo%2Fjavascript-api%2Fexample%2Fdriving-route%2Fplan-route-according-to-lnglat&csid=9286C409-3381-4847-BBEE-EF2B902043DD&sdkversion=1.4.15'
        let url = 'https://restapi.amap.com/v3/direction/driving?origin=116.30658030509949,39.97258543968201&destination=116.32529139518739,39.973915815353394&extensions=&s=rsv3&strategy=0&ferry=0&key=c9151976e65cdc5004b24b61ce7504d2&callback=jsonp_153836_&platform=JS&logversion=2.0&appname=https%3A%2F%2Flbs.amap.com%2Fdemo%2Fjavascript-api%2Fexample%2Fdriving-route%2Fplan-route-according-to-lnglat&csid=9286C409-3381-4847-BBEE-EF2B902043DD&sdkversion=1.4.15'
        if (this.startCoords.toString() && this.endCoords.toString()) {
          let origin = ol.proj.transform(this.startCoords, 'EPSG:3857', 'EPSG:4326')
          let destination = ol.proj.transform(this.endCoords,'EPSG:3857', 'EPSG:4326')
          url = `https://restapi.amap.com/v3/direction/driving?origin=${origin.toString()}&destination=${destination.toString()}&extensions=&s=rsv3&strategy=0&ferry=0&key=c9151976e65cdc5004b24b61ce7504d2&callback=jsonp_153836_&platform=JS&logversion=2.0&appname=https%3A%2F%2Flbs.amap.com%2Fdemo%2Fjavascript-api%2Fexample%2Fdriving-route%2Fplan-route-according-to-lnglat&csid=9286C409-3381-4847-BBEE-EF2B902043DD&sdkversion=1.4.15`
        }
        this.$ajax('get', url).then(response => {
          let respJson = JSON.parse(response.substring(response.indexOf('(')+1,response.lastIndexOf(')')))
          resolve(respJson)
        }).catch(error => {
          reject('获取路径规划数据失败', error, url_bian)
        })
      })
    },
    routeStyle(feature) {
      let {name, status} = feature
      name = name ? name.substring (0,1): ''
      let pointBgColor = '' // 点背景色
      if (name === '起') {
        pointBgColor = 'green'
      } else if (name === '终') {
        pointBgColor = 'red'
      }
      let polylineColor = '#8f8f8f' // 线颜色
      if(status === '畅通') {
        polylineColor='#00b514'
      } else if(status === '缓行'){
        polylineColor='#ff7324'
      } 
      else if(status === '拥堵') {
        polylineColor='#e20000'
      }
      return new ol.style.Style({
        image: new ol.style.Circle({ // 定义点（起点、终点）的样式
            radius: 15,
            fill: new ol.style.Fill({
                color: pointBgColor
            })
        }),
        stroke: new ol.style.Stroke({ // 定义线的样式
            color: polylineColor,
            width: 5,
        }),
        text: new ol.style.Text({ // 定义文本的样式
          text: name,
          font:'bold 15px 微软雅黑',
          fill: new ol.style.Fill({
              color: 'white'
          }),
          textAlign:'center',
          textBaseline:'middle'
      })
      })
    },
    // ajax请求方法·
    $ajax(type, url, sucCalback) {
      return new Promise((resolve, reject) => {
        let xmlhttp = new window.XMLHttpRequest()
        xmlhttp.open(type, url, true)
        xmlhttp.send(null)
        xmlhttp.onreadystatechange = function(res) {
          if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            resolve(res.currentTarget.responseText)
          }
        }
    })
}

  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.toolbar {
  position: absolute;
  top: 15px;
  width: 15px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  width: 250px;
}
.lable-name {
  font-size: 12px;
  line-height: 25px;
  color: #fff;
  width: 40px;
}
</style>
