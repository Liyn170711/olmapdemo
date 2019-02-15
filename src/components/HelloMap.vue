<!-- openlayers 二维地图测试  -->
<template>
  <div>
    <div id="map" style="position: absolute; width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
import ol from 'openlayers'

export default {
  name: 'HelloWorld',
  data () {
    return {
    }
  },
  mounted () {
    // 瓦片底图
    var baseLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    // 矢量数据图层
    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ // 数据源
            format: new ol.format.GeoJSON(),
            url: "/wfsapi?service=wfs&version=1.1.0&request=GetFeature&typeNames=nyc_roads:nyc_roads&outputFormat=application/json&srsname=EPSG:4326"
        }),
        style: new ol.style.Style({ // 样式
            stroke: new ol.style.Stroke({color: "blue", width: 1}) // 边框
        })
    });
    // 瓦片数据图层
    var tileLayer = new ol.layer.Tile({ // 构造瓦片图层
        source: new ol.source.TileWMS({ // 构造wms瓦片服务数据源
            url:'http://127.0.0.1:8080/geoserver/nyc_roads/wms', // 服务地址    
            params:{     // 
                'LAYERS': 'nyc_roads:nyc_roads',// 图层（此处可以是单个图层名称，也可以是图层组名称，或多个图层名称）
                'TILED': false     
            },    
            serverType: 'geoserver'    //服务器类型
        })
    });
    // 构造地图
    var map = new ol.Map({
        target: "map", // 地图渲染的DOM对象
        layers: [   baseLayer // 初始设置地图图层
                    // tileLayer,
                    // vectorLayer
                ],
        view: new ol.View({ // 地图视图
            center: [-73.99710639567148, 40.742270050255556], // 中心点经纬度坐标
            maxZoom: 19, // 最大缩放等级
            zoom: 14, // 默认缩放等级
            projection: 'EPSG:4326' // 坐标系
        })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
