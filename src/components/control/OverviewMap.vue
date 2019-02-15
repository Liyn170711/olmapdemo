<!-- 地图控件---openlayers自带鹰眼控件 -->
<template>
  <div>
    <div id='map' class='map'></div>
  </div>
</template>

<script>
import 'openlayers/css/ol.css';
import ol from 'openlayers';

export default {
  name: 'HelloWorld',
  data() {
    return {
      map: null
    };
  },
  mounted() {
    this.initMap(); // 初始化地图
  },
  methods: {
    initMap() {
      // 初始化地图
      let baseLayer = new ol.layer.Tile({ source: new ol.source.OSM() }); // 瓦片底图
      let center = ol.proj.transform(
        [108.9423179626465, 34.26097621544791], // 西安：[108.9423179626465, 34.26097621544791]， 北京：[116.3854147, 39.9306804]
        'EPSG:4326', // 源坐标系
        'EPSG:3857' // 目的坐标系
      ) // 点坐标转换
      let overviewMapControl = new ol.control.OverviewMap({
        layers: [
            baseLayer
        ]
      })
      this.map = new ol.Map({
        target: 'map', // 地图渲染的DOM对象
        layers: [
          baseLayer // 初始设置地图图层
        ],
        view: new ol.View({ // 地图视图，默认坐标系是3857
          center: center, // 中心点坐标（地图坐标系下的）
          maxZoom: 19, // 最大缩放等级
          zoom: 14 // 默认缩放等级
        }),
        controls: ol.control.defaults().extend([overviewMapControl])
      })
      // this.addOverviewMap()
      this.regMapListeners()
    },
    regMapListeners() { // 注册地图事件监听
      // 监听鼠标单击事件
      this.map.on('click', event => {
        // console.log('监听到地图点击事件：', event)
      })
    },
    addOverviewMap() { // 添加鹰眼控件
      let overviewMapControl = new ol.control.OverviewMap({
        className: 'ol-overviewmap ol-custom-overviewmap', //鹰眼控件样式
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    'url': 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
                })
            })
        ]
      })
      this.map.addControl(overviewMapControl)
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.map {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
