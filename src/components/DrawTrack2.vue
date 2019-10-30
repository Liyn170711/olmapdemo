<template>
  <div>
    <div id="map" style="position: absolute; width: 100%; height: 100%;"></div>
    <div class="toolbar">
      <button @click="drawLine()">Draw Line</button>
      <button @click="clearTrack()">Clear</button>
      <div>
        <label for="speed">
          speed:&nbsp;
          <input id="speed" type="range" min="0" max="20" step="1" v-model="speed">
        </label>
        <button :disabled="!animateEnable" @click="startAnimation()">{{ animationButtonLabel }}</button>
      </div>
    </div>
    <Popup ref="testPopup" v-for="(coord, index) in coords" :key="index" :coord="coord" :map="map" :id="'Popup_'+index"></Popup>
  </div>
</template>

<script>
import ol from "openlayers";
import Popup from './common/Popup'

export default {
  components: { Popup },
  name: "DrawTrack",
  data() {
    return {
      map: null,
      trackSource: null,
      coords: [], // 轨迹坐标数组
      animationButtonLabel: "Start Animation",
      animateEnable: false,
      animating: false,
      speed: 1, // 速度
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
        source: this.trackSource,
        style: this.trackVectorStyle
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
    drawLine() {
      // 绘制线
      let drawer = new ol.interaction.Draw({
        // source: this.trackSource,
        type: "LineString"
      });
      drawer.on("drawend", event => {
        // 监听绘制完成
        this.map.removeInteraction(drawer); // 移除绘制工具
        let geometry = event.feature.getGeometry();
        let routeFeature = new ol.Feature({
          type: "route",
          geometry: geometry
        });
        this.trackSource.addFeature(routeFeature); // 添加路线要素
        this.coords = geometry.getCoordinates();
        this.addIcons(); // 添加图标
        this.map.getView().fit(geometry);
        this.animateEnable = true
      });
      this.map.addInteraction(drawer);
    },
    clearTrack() {
      // 去掉之前的overlay
      for (const popup of this.$refs.testPopup) {
        this.map.removeOverlay(popup.popuper)
      }
      // 清除轨迹
      this.trackSource.clear(); // 清空绘制数据源
      this.animateEnable = false
      this.coords =[]
    },
    trackVectorStyle(feature) {
      // 轨迹图层的样式
      let styles = []; // 样式数组
      let type = feature.get("type");
      switch (type) {
        case "route":
          return this.routeStyle(feature); // 路线样式
        case "icon":
          return this.iconStyle(feature); // 节点图标样式
        case "geoMarker":
          return this.geoMarkerStyle(feature); // 定位图标样式
      }
    },
    routeStyle(feature) {
      // 路线样式.
      let geometry = feature.get("geometry"); // 获取要素的几何图形
      let styles = []; // 样式数组
      styles.push(
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: "#D0021B",
            width: 5
          }),
          zIndex: 1001
        })
      );
      // 添加线的方向样式
      geometry.forEachSegment(function(start, end) {
        // 遍历几何图形的每个点
        let dx = end[0] - start[0]; // x方向上的变化量
        let dy = end[1] - start[1]; // y方向上的变化量
        let rotation = Math.atan2(dy, dx); // 旋转角度
        let segment = new ol.geom.LineString([start, end]); // 线段
        let pos = segment.getCoordinateAt(0.7); // 计算箭头所在位置坐标
        styles.push(
          new ol.style.Style({
            geometry: new ol.geom.Point(pos), // 剪头的位置
            image: new ol.style.Icon({
              src: "/static/images/arrow.png", // 箭头图片（箭头指向右方）
              rotation: -rotation
            }),
            zIndex: 1002
          })
        );
      });
      return styles;
    },
    iconStyle(feature) {
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7.5,
          fill: new ol.style.Fill({ color: "#057AFC" }),
          stroke: new ol.style.Stroke({
            color: "#FFFFFF",
            width: 2
          })
        }),
        zIndex: 1003
      });
      return style;
    },
    geoMarkerStyle(feature) {
      // 定位图标样式
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7.5,
          fill: new ol.style.Fill({ color: "#057AFC" }),
          stroke: new ol.style.Stroke({
            color: "#D0021B",
            width: 2
          })
        }),
        zIndex: 1999
      });
      return style;
    },
    addIcons() {
      // 添加图标
      this.geoMarker = new ol.Feature({
        type: "geoMarker",
        geometry: new ol.geom.Point(this.coords[0])
      });
      this.trackSource.addFeature(this.geoMarker);
      for (let i = 0; i < this.coords.length; i++) {
        let pointFeature = new ol.Feature({
          type: "icon",
          geometry: new ol.geom.Point(this.coords[i])
        });
        this.trackSource.addFeature(pointFeature)
      }
    },
    startAnimation() { // 执行动画播放
        if (this.animating) { // 播放动画时
            this.stopAnimation(false) // 停止动画播放
        } else { // 执行动画播放
            this.animating = true //
            this.now = new Date().getTime() // 获取当前时间
            this.animationButtonLabel = 'Cancel Animation' // 修改动画控制按钮的label
            this.map.on("postcompose", this.moveGeoMarker) // 监听地图渲染
            this.map.render(); // 地图继续渲染
        }
    },
    stopAnimation(ended) {
        // 结束动画
        this.animating = false
        this.animationButtonLabel = 'Start Animation'
        this.geoMarker.getGeometry().setCoordinates(this.coords[0]); // 设置定位图标的位置
        this.map.un('postcompose', this.moveGeoMarker) // 移除地图渲染的监听
    },
    moveGeoMarker(event) { // 移动定位图标
        let vectorContext = event.vectorContext
        let frameState = event.frameState
        if (this.animating) {
            let elapsedTime = frameState.time - this.now
            let indexNumber = this.speed * elapsedTime / 1000 // 线路节点索引,浮点值
            let index = Math.floor(indexNumber) // 线路节点索引,整数值
            if (index >= this.coords.length - 1) {
              this.stopAnimation(true)
                return
            }
            let fraction = indexNumber - index // 线段部分
            console.log('线路节点索引：', indexNumber, '线段部分：', fraction)
            let segment = new ol.geom.LineString([this.coords[index], this.coords[index+1]]); // 线段
            let coord = segment.getCoordinateAt(fraction); // 计算位置坐标
            this.geoMarker.getGeometry().setCoordinates(coord); // 设置定位图标的位置
        }
        this.map.render(); // 地图继续渲染
    }
  },
  /**
   * 移动定位图标根据路线长度
   * @param {*} event 事件
   */
  moveGeoMarkerByLength(event) { // 移动定位图标
    let frameState = event.frameState
    if (this.animating) {
      let trackGeometry = this.trackSource.getFeatureById('route').get('geometry')
      let length = trackGeometry.getLength()
      console.log('轨迹线总长：', length)
      let elapsedTime = frameState.time - this.now
      // let indexNumber = elapsedTime / STEPTIME // 线路节点索引,浮点值
      let indexNumber = elapsedTime / 1000 // 线路节点索引,浮点值
      let index = Math.floor(indexNumber) // 线路节点索引,整数值
      // let fraction = index * SPEED / length
      let fraction = index * 100 / length
      console.log('轨迹动画模拟进度：', fraction)
      if (fraction > 1 && !this.isCircle) {
        this.stopAnimation()
        return
      }
      this.geoMarker.getGeometry().setCoordinates(trackGeometry.getCoordinateAt(fraction)) // 设置定位图标的位置
    }
    this.map.render() // 地图继续渲染
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
