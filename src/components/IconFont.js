function getCurrentIcon(fontSize, fillColor, strokeColor) {
  var canvas = document.createElement('canvas');
  canvas.width = fontSize*1.5;
  canvas.height = fontSize;
  //  获取画布
  var context = canvas.getContext('2d');
  context.font = fontSize + 'px iconfont';
  context.textAlign="left";
  context.textBaseline="top";
  var content = window.getComputedStyle(document.querySelector('.icon-you'), ':before').getPropertyValue('content'); // 获取伪元素样式里的属性
  content = content.split('"')[1]
  if(fillColor && fillColor!==""){
    context.fillStyle = fillColor;
    context.fillText(content, 0, 0);
  }
  if(strokeColor && strokeColor!==""){
    context.strokeStyle = strokeColor;
    context.strokeText(content, 0, 0);
  }
  return canvas.toDataURL('image/png');
}

export default {
  getCurrentIcon
}