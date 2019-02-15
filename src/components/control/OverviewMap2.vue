<!-- 地图控件---自定义鹰眼缩略图 -->
<template>
  <div>
    <div id='map' class='map'></div>
    <div class="custom-overview">
      <div id="overview" class="custom-overview-map"></div>
    </div>
  </div>
</template>

<script>
import 'openlayers/css/ol.css';
import ol from 'openlayers';

export default {
  name: 'HelloWorld',
  data() {
    return {
      map: null, // 地图
      overview: null // 缩略图
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
        controls: []
      })
      this.overview = 
      this.regMapListeners()
    },
    regMapListeners() { // 注册地图事件监听
      // 监听鼠标单击事件
      this.map.on('click', event => {
        // console.log('监听到地图点击事件：', event)
      })
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
.custom-overview {
  position: absolute;
  bottom: 0px;
  right: 0px;
  z-index: 200;
  width: 296px;
  height:296px;
  background-color: #fff;
  border: 1px solid #555;
  border-radius: 3px;
}
.custom-overviewmap {
  background-color: #fff;width: 290px;height:290px;margin: 3px 3px 3px 3px;border:1px solid #7b98bc
}
</style>
