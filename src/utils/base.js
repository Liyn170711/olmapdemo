// 基础工具方法

/**
 * 判断图片是否存在
 * @param {*} url 图片地址
 * des: 图片太大时，检验不准确
 */
function isImgExist(url) {
  let isExist = false
  let imageObj = new Image()
  if (url) {
    imageObj.src = url
    if (imageObj.fileSize > 0 || (imageObj.width >0 && imageObj.height > 0)) {
      isExist = true
    }
  }
  return isExist
}

export default {
  isImgExist
}