 <!-- openlayers4结合高德地图API实现的路径规划——高德地图轨迹样式
    关键步骤：
    1. 需要显示的箭头数量;
    2. 需要显示箭头的位置；
    3.需要显示箭头的方向；
  -->
<template>
  <div>
    <div id="map" style='position: absolute width: 100% height: 100%'></div>
    <div class='toolbar'>
      <i class="iconfont icon-jiantou" style="display: none;"></i><!-- 轨迹箭头隐藏，勿删！！！ --><br/>
      <span class="lable-name">{{startCoords}}</span><button @click="handleSelectPoint('startCoords')">选取起点</button><br/>
      <span class="lable-name">{{endCoords}}</span><button @click="handleSelectPoint('endCoords')">选取终点</button><br/>
      <button @click='routePlanning()'>Route Planning</button>
    </div>
  </div>
</template>

<script>
import ol from 'openlayers'
import RBush from 'rbush';
import RouteStyle from './style'
const ARROW_PIX_STEP = 40 // 箭头显示的步长（单位：像素，即：每隔多少个像素显示一个箭头）
let geoStep // 箭头显示的步长（单位：米，即：每隔多少米显示一个箭头）
let vectorSource // 路径显示矢量数据源
let routeGeometry // 路径（单线）包含轨迹的所有坐标
let routeLength // 路径长度
let arrowNum // 箭头数量
export default {
  name: 'AMapRouteStyle',
  data() {
    return {
        map: null,
        startCoords: [],
        endCoords: []
    }
  },
  watch: {
  },
  mounted() {
    this.initMap() // 初始化地图
  },
  methods: {
    initMap() {
      let baseLayer = new ol.layer.Tile({
          source: new ol.source.XYZ({  
              url:'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'//7,8
          }),  
          projection: 'EPSG:3857' 
      })
      let view = new ol.View({
        // 地图视图
        center: [12957302.414606724, 4852760.584444312], // 中心点经纬度坐标
        maxZoom: 19, // 最大缩放等级
        zoom: 13, // 默认缩放等级
        projection: 'EPSG:3857'
      })
      this.map = new ol.Map({
        target: "map", // 地图渲染的DOM对象
        layers: [
          baseLayer // 初始设置地图图层
        ],
        view: view
      })
      let mapResolution = view.getResolution()
      // console.log('获取到当前地图的分辨率：', mapResolution)
      geoStep = ARROW_PIX_STEP * mapResolution // 当前地图分辨率每隔 geoStep 米 显示一个箭头
      // console.log('当前地图分辨率每隔', geoStep, ' m 显示一个箭头')
      view.on('change:resolution', this.handleMapResolutionChange) // 监听地图分辨率变化
    },
    /**  
     * 处理选点
     * @time 2021-4-22 10:26:17
     */
    handleSelectPoint(pointCoord) {
      this.map.once('singleclick', (event) => {
        console.log('鼠标点击的点坐标：', event.coordinate)
        this[pointCoord] = event.coordinate
      })
    },
    /** 
     * 处理地图分辨率变化
     * 2021-4-20 13:47:16
     */
    handleMapResolutionChange(param) {
      console.log('处理地图分辨率变化', param)
      let mapResolution = this.map.getView().getResolution()
      // console.log('获取到当前地图的分辨率：', mapResolution)
      geoStep = ARROW_PIX_STEP * mapResolution // 当前地图分辨率每隔 geoStep 米 显示一个箭头
      // console.log('当前地图分辨率每隔', geoStep, ' m 显示一个箭头')
      vectorSource && this.deleteRouteArrowFeature() // 删除路径箭头要素
      this.map.once('moveend', this.handleMoveEnd) // 监听地图移动事件
    },
    /** 
     * 处理地图移动结束
     * 2021-4-20 15:23:00
     */
    handleMoveEnd() {
      console.log('处理地图移动结束')
      if (vectorSource && routeGeometry) {
        let isRouteIntersectMapExtent = routeGeometry.intersectsExtent(this.map.getView().calculateExtent(this.map.getSize())) // 路径是否在地图范围内
        if (isRouteIntersectMapExtent) {
          this.addRouteArrowFeature() // 添加路径箭头要素
        }
      }
    },
    // 路径规划
    async routePlanning() {
      vectorSource && vectorSource.clear() // 清除路径矢量要素
      let respData = await this.requestRouteData()
      let routeData = respData.route
      // console.log('获取到的路径规划数据：', routeData)
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
      let routeCoords = [] // 轨迹坐标
      for (const step of steps) {
        let tmcs = step.tmcs
        for (const tmc of tmcs) {
          let {polyline, status} = tmc
          let points = polyline.split(';')
          let coords = []
          for (const point of points) {
            let coord= ol.proj.transform(point.split(',').map(item => Number(item)), 'EPSG:4326', 'EPSG:3857')
            coords.push(coord)
            routeCoords.push(coord)
          }
          let polylineGeom = new ol.geom.LineString(coords)
          let polylineFeature = new ol.Feature(polylineGeom)
          polylineFeature.status = status
          features.push(polylineFeature)
        }
      }
      // 构造最优路径矢量数据源
      vectorSource = new ol.source.Vector({
          features: features
      })
      // 构造最优路径图层
      let routeLayer = new ol.layer.Vector({
        source: vectorSource,
        style: RouteStyle.routeStyle
      })
      this.map.addLayer(routeLayer)
      routeGeometry = new ol.geom.LineString(routeCoords) // 路径（单线）包含轨迹的所有坐标
      routeLength = lineStringGeom.getLength()
      console.log('获取到轨迹路线的长度：', routeLength, ' m')
      arrowNum = parseInt(routeLength * 1.0 / geoStep)
      console.log('当前地图分辨率需要显示的箭头数量：', arrowNum, ' 个')
      this.addRouteArrowFeature() // 添加路径箭头要素
      this.map.getView().fit(routeGeometry.getExtent()) // 地图定位到路径所在位置
    },
     /** 
     * 添加路径箭头要素
     * @date 2021-4-20 13:57:42
     */
    addRouteArrowFeature() {
      let routeFeature = new ol.Feature(routeGeometry)
      routeFeature.setId('routerArrowFeature')
      let routeArrowStyles = this.getRouteArrowStyleWithRotation(routeGeometry) // 计算需要显示的箭头数量
      routeFeature.setStyle(routeArrowStyles)
      vectorSource.addFeature(routeFeature)
    },
     /** 
     * 刷新路径箭头要素
     * @date 2021-4-20 14:02:21
     */
    reFreshRouteArrowFeature() {
      let routeFeature = vectorSource.getFeatureById('routerArrowFeature')
      if (routeFeature) {
        vectorSource.removeFeature(routeFeature)
        this.addRouteArrowFeature() // 添加路径箭头要素
      }
    },
     /** 
     * 删除路径箭头要素
     * @date 2021-4-20 14:02:21
     */
    deleteRouteArrowFeature() {
      let routeFeature = vectorSource.getFeatureById('routerArrowFeature')
      if (routeFeature) {
        vectorSource.removeFeature(routeFeature)
      }
    },
    /** 
     * 获取箭头样式（不带旋转）
     * @date 2021-4-20 12:03:02
     */
    getRouteArrowStyle(lineStringGeom) {
      let styles = []
      for(let i = 1; i< arrowNum; i++){
            let arraw_coor= lineStringGeom.getCoordinateAt( i * 1.0 / arrowNum)
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(arraw_coor),
                text: new ol.style.Text({
                  font: 'bold 8px iconfont',
                  text: window.getComputedStyle(document.querySelector('.icon-jiantou'), ':before').getPropertyValue('content').replace(/"/g, ''), // 获取伪类样式的内容
                  fill: new ol.style.Fill({ color: '#ffffff' }),
                  textBaseline: 'middle',
                })
            }))
        }
        return styles
    },
    /** 
     * 获取箭头样式（带有旋转）
     * @date 2021-4-20 15:59:52
     */
    getRouteArrowStyleWithRotation(lineStringGeom) {
      let styles = []
      let tree = new RBush()
      lineStringGeom.forEachSegment((start, end) => {
        let dx = end[0] - start[0]
        let dy = end[1] - start[1]
        //计算每个segment的方向，即箭头旋转方向
        let rotation = Math.atan2(dy, dx)
        let geom = new ol.geom.LineString([start,end])
        let extent = geom.getExtent()
        let item = {
          minX: extent[0],
          minY: extent[1],
          maxX: extent[2],
          maxY: extent[3],
          geom: geom,
          rotation:rotation
        }
        tree.insert(item)
      })
      let routeLength = lineStringGeom.getLength()
      console.log('获取到轨迹路线的长度：', routeLength, ' m')
      let arrowNum = parseInt(routeLength * 1.0 / geoStep)
      console.log('当前地图分辨率需要显示的箭头数量：', arrowNum, ' 个')
      for(let i = 1; i < arrowNum; i++){
        let arraw_coor = lineStringGeom.getCoordinateAt(i * 1.0 / arrowNum)
        let tol = 10;//查询设置的点的容差，测试地图单位是米。如果是4326坐标系单位为度的话，改成0.0001.
        let arraw_coor_buffer = [arraw_coor[0]-tol, arraw_coor[1]-tol, arraw_coor[0]+tol, arraw_coor[1]+tol]
        //进行btree查询
        let treeSearch = tree.search({
          minX: arraw_coor_buffer[0],
          minY: arraw_coor_buffer[1],
          maxX: arraw_coor_buffer[2],
          maxY: arraw_coor_buffer[3]
        })
        let arrow_rotation
        //只查询一个，那么肯定是它了，直接返回
        if(treeSearch.length==1)
          arrow_rotation=treeSearch[0].rotation
        else if(treeSearch.length>1){
            let results = treeSearch.filter(function(item){
              //-----------箭头点与segment相交，返回结果。该方法实测不是很准，可能是计算中间结果
              //保存到小数精度导致查询有点问题
              // if(item.geom.intersectsCoordinate(arraw_coor))
              //   return true
              //--------换一种方案，设置一个稍小的容差，消除精度问题
              let _tol = 1 //消除精度误差的容差
              if(item.geom.intersectsExtent([arraw_coor[0]-_tol, arraw_coor[1]-_tol, arraw_coor[0]+_tol, arraw_coor[1]+_tol]))
                return true
            })
            if(results.length > 0) {
              arrow_rotation = results[0].rotation
            }
        }
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(arraw_coor),
            // text: RouteStyle.arrowText(arrow_rotation),
            image: RouteStyle.arrowIcon(arrow_rotation)
        }))
      }
      return styles
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
