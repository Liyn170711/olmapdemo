<template>
  <div>
    <!-- wgs84 无偏移 -->
    <!-- <bs-map style="position: absolute; width: 100%; height: 100%;" projection="EPSG:4326" :center="[116.30453377962112, 39.96874585747719]" :zoom="19" :maxZoom="19" ref="mapAppContainer" @ready="loadMapReady" @singleclick="handleMapClick"> -->
    <!-- wgs84 墨卡托 无偏移 -->
    <!-- <bs-map style="position: absolute; width: 100%; height: 100%;" projection="EPSG:3857" :center="[12946961.477296509, 4861401.551571071]" :zoom="19" :maxZoom="19" ref="mapAppContainer" @ready="loadMapReady" @singleclick="handleMapClick"> -->
    <!-- gcj02 -->
    <!-- <bs-map style="position: absolute; width: 100%; height: 100%;" projection="EPSG:4326" :center="[116.310624, 39.970016]" :zoom="19" :maxZoom="19" ref="mapAppContainer" @ready="loadMapReady" @singleclick="handleMapClick"> -->
    <!-- gcj02 墨卡托 -->
    <bs-map style="position: absolute; width: 100%; height: 100%;" projection="EPSG:3857" :center="[12947639.4400292, 4861586.087789696]" :zoom="13" :maxZoom="19" ref="mapAppContainer" @ready="loadMapReady" @singleclick="handleMapClick">
      <!-- <bs-gaodelayer></bs-gaodelayer> -->
      <!-- <bs-baidulayer></bs-baidulayer> -->
      <!-- <bs-googlelayer></bs-googlelayer> -->
    </bs-map>
    <div class="toolbar">
      <button @click="testAddMarkers()">Add Markers</button>
    </div>
  </div>
</template>

<script>
import ol from "openlayers";
import TransformCoord from '@/utils/transformcoord'
import AddMarkers from '@/utils/addMarkers'
export default {
  name: "TestOLMap",
  data() {
    return {
        map: null
    };
  },
  mounted() {

  },
  methods: {
    loadMapReady(param) {
      this.map = param.map
      let center = ol.proj.transform(
        TransformCoord.wgs84togcj02(116.30453377962112, 39.96874585747719),
        'EPSG:4326',
        'EPSG:3857'
      )
      console.log('center:', center)
      // this.loadOSMTileLayer(param) 
      this.loadGaodeTileLayer(param) 
    },
    testAddMarkers() {
      // this.addMarkers([[116.30453377962112, 39.96874585747719], [116.3051587343216, 39.968799501657486]], "WGS84")
      // this.addMarkers([
      //   ol.proj.transform([116.30453377962112, 39.96874585747719],'EPSG:4326','EPSG:3857'), 
      //   ol.proj.transform([116.3051587343216, 39.968799501657486],'EPSG:4326','EPSG:3857')], 
      //   "WGS84MC")
      // ------------------------------使用封装的转换方法，有偏移----------------------------------
      // this.addMarkers([TransformCoord.wgs84togcj02(116.30453377962112, 39.96874585747719), TransformCoord.wgs84togcj02(116.3051587343216, 39.968799501657486)], "GCJ02")
      // this.addMarkers([
      //   ol.proj.transform(TransformCoord.wgs84togcj02(116.30453377962112, 39.96874585747719),'EPSG:4326','EPSG:3857'), 
      //   ol.proj.transform(TransformCoord.wgs84togcj02(116.3051587343216, 39.968799501657486),'EPSG:4326','EPSG:3857')], 
      //   "GCJ02MC")
      // ------------------------------使用高德开发平台api提供的转换方法，偏移与自定义组件一样----------------------------------
      // AddMarkers.addGCJ02MarkersByGaodeApi([[116.30453377962112, 39.96874585747719], [116.3051587343216, 39.968799501657486]], this.map)
      // AddMarkers.addGCJ02MCMarkersByGaodeApi([[116.30453377962112, 39.96874585747719], [116.3051587343216, 39.968799501657486]], this.map)
    },
    handleMapClick(param) {
      console.log(param.lon, param.lat)
    },
    loadOSMTileLayer(param) {
      let baseLayer = new param.ol.layer.Tile({ source: new param.ol.source.OSM() }); // 瓦片底图
      this.map.addLayer(baseLayer)
    },
    loadGaodeTileLayer(param) {
      let baseLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({  
                url:'http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'//7,8
            }),  
            projection: 'EPSG:3857' 
        })
      this.map.addLayer(baseLayer)
    },
    addMarkers(coords, type) {
      console.log(coords)
      let markerSource = new ol.source.Vector({ wrapX: false })
      let markerLayer = new ol.layer.Vector({
        source: markerSource,
        style: this.markerVectorStyle
      })
      this.map.addLayer(markerLayer)
      for (let i = 0; i < coords.length; i++) {
        let pointFeature = new ol.Feature({
          type: type,
          label: type + '_' + i,
          geometry: new ol.geom.Point(coords[i]),
        })
        markerSource.addFeature(pointFeature)
      }
    },
    markerVectorStyle(feature) {
      let type = feature.get("type");
      let label = feature.get("label");
      let param = {imgSrc: '/static/images/marker/marker.png', label}
      switch (type) {
        case "WGS84":
          param.imgSrc = '/static/images/marker/marker.png'
          param.color = 'rgba(255, 0, 255, 0.8)'
          return this.markerStyle(param); // 节点图标样式
        case "WGS84MC":
          param.imgSrc = '/static/images/marker/marker-icon.png'
          param.color = 'rgba(0, 0, 255, 0.8)'
          return this.markerStyle(param); // 节点图标样式
        case "GCJ02":
          param.imgSrc = '/static/images/marker/marker-gold.png'
          param.color = 'rgba(255, 0, 0, 0.8)'
          return this.markerStyle(param); // 路线样式
        case "GCJ02MC":
          param.imgSrc = '/static/images/marker/markerbig_select.png'
          param.color = 'rgba(255, 0, 0, 0.8)'
          return this.markerStyle(param); // 路线样式
      }
    },
    markerStyle(param) {
      const {imgSrc, label, color} = param
      let style = new ol.style.Style({
        image:  new ol.style.Icon({
          src: imgSrc,
          scale: 1
        }),
        text: new ol.style.Text({
          font: '12px courier',
          text: label,
          offsetY: 24,
          stroke: new ol.style.Stroke({
            color: color
          }),
        }),
        zIndex: 1999
      });
      return style
    }
  }
}
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
