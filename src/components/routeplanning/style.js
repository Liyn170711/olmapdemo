import ol from 'openlayers'

/**
 * 路径规划的相关样式
 */
// 箭头圆点样式
const arrowCircle = new ol.style.Circle({
  radius: 7,
  fill: new ol.style.Fill({
      color: '#ffcc33'
  })
})
// 箭头伪类样式（通过字体图标实现需要在dom加载完成后使用）
// let arrowText = (rotation) => {
//   return new ol.style.Text({
//     font: 'bold 8px iconfont',
//     text: window.getComputedStyle(document.querySelector('.icon-jiantou'), ':before').getPropertyValue('content').replace(/"/g, ''), // 获取伪类样式的内容
//     fill: new ol.style.Fill({ color: '#ffffff' }),
//     textBaseline: 'middle',
//     rotation: -rotation
//   })
// }
// 箭头图标样式
let arrowIcon = (rotation) =>{
  return new ol.style.Icon({
    src: '../../../static/images/path_arrow.png',
    imageSize: [117, 81],
    scale: 0.06,
    rotateWithView: true,
    rotation: -rotation
  })
  // ------------另一种写法
  // var myImage = new Image(117, 117);
  // myImage.src = '../../../static/images/path_arrow.png';
  // return new ol.style.Icon({
  //   img: myImage,
  //   imgSize: [117, 117],
  //   scale: 0.06,
  //   rotateWithView: true,
  //   rotation: -rotation
  // })
}
// 路线样式
let routeStyle = (feature) => {
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
        width: 8,
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
}

export default {
  arrowCircle,
  // arrowText,
  arrowIcon,
  routeStyle
}


