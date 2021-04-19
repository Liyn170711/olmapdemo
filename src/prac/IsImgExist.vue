<!-- 测试图片是否可访问 -->
<template>
  <div class="content">
    <div class="img-box">
      <img :src="imgUrl" alt="测试图片">
    </div>
  </div>
</template>

<script>
import BaseUtil from '../utils/base'
export default {
  name: "IsImgExist",
  data() {
    return {
      testUrl: '/static/images/map/map1.jpg', // 测试图片地址
      defaultUrl: '/static/images/headPohto.png' // 默认图片地址
    };
  },
  computed: {
    imgUrl () {
      let isImgExist = BaseUtil.isImgExist(this.testUrl)
      let url = isImgExist ?  this.testUrl : this.defaultUrl
      return url
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content {
  width: 120px;
  height: 90px;
  background: rgba(153, 153, 153, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}
.content  .img-box {
  height: 90px;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-box img{
  display: inline-block;
  cursor: pointer;
  width: auto;
  height: auto;
  max-width: 120px;
  max-height: 90px;
}
</style>
