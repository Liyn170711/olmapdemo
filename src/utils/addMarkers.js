import ol from "openlayers";
/**
* 添加GCJ02坐标标注
* @param lnglats
* @param map
*/
function addGCJ02MarkersByGaodeApi(lnglats, map) {
  AMap.convertFrom(lnglats, 'gps', (status, result) => {
    if (result.info === 'ok') {
      let points = result.locations; // Array.<LngLat>
      let pointArr = []
      for (const point of points) {
        pointArr.push([point.lng, point.lat])
      }
      addMarkers(pointArr, "GCJ02", map)
    }
  })
}
/**
* 添加GCJ02坐标标注
* @param lnglats
* @param map
*/
function addGCJ02MCMarkersByGaodeApi(lnglats, map) {
  AMap.convertFrom(lnglats, 'gps', (status, result) => {
    if (result.info === 'ok') {
      let points = result.locations; // Array.<LngLat>
      let pointArr = []
      for (const point of points) {
        pointArr.push(ol.proj.transform([point.lng, point.lat],'EPSG:4326','EPSG:3857'))
      }
      addMarkers(pointArr, "GCJ02", map)
    }
  })
}

function addMarkers(coords, type, map) {
  console.log(coords)
  let markerSource = new ol.source.Vector({ wrapX: false })
  let markerLayer = new ol.layer.Vector({
    source: markerSource,
    style: markerVectorStyle
  })
  map.addLayer(markerLayer)
  for (let i = 0; i < coords.length; i++) {
    let pointFeature = new ol.Feature({
      type: type,
      label: type + '_' + i,
      geometry: new ol.geom.Point(coords[i]),
    })
    markerSource.addFeature(pointFeature)
  }
}

function markerVectorStyle(feature) {
  let type = feature.get("type");
  let label = feature.get("label");
  let param = {imgSrc: '/static/images/marker/marker.png', label}
  switch (type) {
    case "WGS84":
      param.imgSrc = '/static/images/marker/marker.png'
      param.color = 'rgba(255, 0, 255, 0.8)'
      return markerStyle(param); // 节点图标样式
    case "WGS84MC":
      param.imgSrc = '/static/images/marker/marker-icon.png'
      param.color = 'rgba(0, 0, 255, 0.8)'
      return markerStyle(param); // 节点图标样式
    case "GCJ02":
      param.imgSrc = '/static/images/marker/marker-gold.png'
      param.color = 'rgba(255, 0, 0, 0.8)'
      return markerStyle(param); // 路线样式
    case "GCJ02MC":
      param.imgSrc = '/static/images/marker/markerbig_select.png'
      param.color = 'rgba(255, 0, 0, 0.8)'
      return markerStyle(param); // 路线样式
  }
}

function markerStyle(param) {
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



export default {
  addMarkers,
  addGCJ02MarkersByGaodeApi,
  addGCJ02MCMarkersByGaodeApi
}
