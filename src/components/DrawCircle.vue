<template>
  <div>
    <div id="map" style="position: absolute; width: 100%; height: 100%;"></div>
    <div class="toolbar">
      <button @click="drawCircle()">Draw Circle</button>
      <button @click="cleartrack()">Clear</button>
    </div>
  </div>
</template>

<script>
import ol from "openlayers";

export default {
  name: "DrawCircle",
  data() {
    return {
      map: null,
      trackSource: null,
      coords: [], // 轨迹坐标数组
      animationButtonLabel: "Start Animation",
      animateEnable: false,
      animating: false,
      speed: 2, // 速度
      now: null, // 当前时间
      geoMarker: null
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
        [116.3854147, 39.9306804],
        "EPSG:4326",
        "EPSG:3857"
      );
      this.trackSource = new ol.source.Vector({ wrapX: false }); // 矢量图层数据源
      let trackLayer = new ol.layer.Vector({
        // 构造矢量绘制图层
        source: this.trackSource
      });
      this.map = new ol.Map({
        target: "map", // 地图渲染的DOM对象
        layers: [
          baseLayer, // 初始设置地图图层
          trackLayer
        ],
        view: new ol.View({
          // 地图视图
          center: center, // 中心点经纬度坐标
          maxZoom: 19, // 最大缩放等级
          zoom: 14 // 默认缩放等级
        })
      });
    },
    drawCircle() {
      // 绘制线
      let drawer = new ol.interaction.Draw({
        // source: this.trackSource,
        type: "Circle"
      });
      drawer.on("drawend", event => {
        var center = event.feature.getGeometry().getFirstCoordinate()
        // var end = event.feature.getGeometry().getLastCoordinate()
        // console.log('event.feature.radius：', event.feature.getGeometry().getRadius())
        var radius = event.feature.getGeometry().getRadius()
        // var radius = new ol.geom.LineString([center, end]).getLength()
        var geometry = ol.geom.Polygon.fromCircle(new ol.geom.Circle(center, radius), 64)
        var coordinates  = geometry.getCoordinates() // 圆转换为多边形的坐标
      });
      this.map.addInteraction(drawer);
    },
    cleartrack() {
      // 清除轨迹
      this.trackSource.clear(); // 清空绘制数据源
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toolbar {
  position: absolute;
  top: 15px;
  width: 15px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  width: 250px;
}
</style>
