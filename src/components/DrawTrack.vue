<template>
  <div>
    <div id="map" style="position: absolute; width: 100%; height: 100%;"></div>
    <div class="toolbar">
      <button @click="drawLine()">Draw Line</button>
      <button @click="cleartrack()">Clear</button>
      <div>
        <label for="speed">
          speed:&nbsp;
          <input id="speed" type="range" min="0" max="20" step="1" v-model="speed">
        </label>
        <button :disabled="!animateEnable" @click="startAnimation()">{{ animationButtonLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import ol from "openlayers";

export default {
  name: "HelloWorld",
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
    cleartrack() {
      // 清除轨迹
      this.trackSource.clear(); // 清空绘制数据源
      this.animateEnable = false
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
            color: "#ff0000",
            width: 4
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
        let pos = [(start[0] + end[0]) / 2.0, (start[1] + end[1]) / 2.0]; // 计算
        styles.push(
          new ol.style.Style({
            geometry: new ol.geom.Point(pos), // 剪头的位置
            image: new ol.style.Icon({
              src: "/static/images/arrow.png", // 箭头图片（箭头指向右方）
              // anchor: [0.75, 0.5],
              // rotateWithView: false,
              rotation: -rotation
            }),
            zIndex: 1002
          })
        );
      });
      return styles;
    },
    iconStyle(feature) {
      let label = feature.get("attributes").label;
      let style = new ol.style.Style({
        image: new ol.style.Icon({
          // 节点头像图片
          src: "/static/images/headPohto.png", // 头像图片
          scale: 0.25,
          anchor: [0.5, 1.05]
        }),
        text: new ol.style.Text({
          offsetX: 0,
          offsetY: 20, // 单位pixels，默认为0
          text: label,
          scale: 1.5,
          overflow: true,
          fill: new ol.style.Fill({ color: "rgba(0,128,0,0.6)" }),
          backgroundFill: new ol.style.Fill({ color: "rgba(0,0,0,0.25)" })
        }),
        zIndex: 1003
      });
      return style;
    },
    geoMarkerStyle(feature) {
      // 定位图标样式
      let style = new ol.style.Style({
        image:  new ol.style.Icon({
          // 节点头像图片
          src: "/static/images/locate.png", // 头像图片
          scale: 1
        }),
        // new ol.style.Circle({
        //   radius: 7,
        //   fill: new ol.style.Fill({ color: "black" }),
        //   stroke: new ol.style.Stroke({
        //     color: "white",
        //     width: 2
        //   })
        // }),
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
        let label = "出现次数：" + (i + 1);
        let id = "routeIndex_" + (i + 1);
        let pointFeature = new ol.Feature({
          type: "icon",
          geometry: new ol.geom.Point(this.coords[i]),
          attributes: {
            id: id,
            label: label
          }
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
        let coord = ended ? this.coords[this.coords.length - 1] : this.coords[0]
        this.geoMarker.getGeometry().setCoordinates(coord); // 设置定位图标的位置
        this.map.un('postcompose', this.moveGeoMarker) // 移除地图渲染的监听
    },
    moveGeoMarker(event) { // 移动定位图标
        let vectorContext = event.vectorContext
        let frameState = event.frameState
        if (this.animating) {
            let elapsedTime = frameState.time - this.now
            let index = Math.round(this.speed * elapsedTime / 1000)
            if (index >= this.coords.length) {
                this.stopAnimation(true)
                return
            }
            let coord = this.coords[index]
            this.geoMarker.getGeometry().setCoordinates(coord); // 设置定位图标的位置
        }
        this.map.render(); // 地图继续渲染
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
