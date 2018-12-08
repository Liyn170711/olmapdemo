<template>
    <div class="popup">
        <div class="contentContainer">
            <div class="contentTop">
                <img :src="pointInfo.imgUrl">
                <div class="similarity">
                    <span>{{ pointInfo.similarity }}</span>
                </div>
            </div>
            <div class="contentBottom">
                <div class="des">{{ pointInfo.des }}</div>
                <span>{{ pointInfo.count + '次' }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import ol from "openlayers";
export default {
  name: 'Popup',
  data () {
      return {
          popuper: null,
          pointInfo: {
             imgUrl: '/static/images/0-1.png',
             similarity: '80%',
             des: '丁香园与西顶路交叉口东南角',
             count: 4
          }
      }
  },
  props: { // 父组件传入的数据
    map: { // 弹出框数据
        type: Object
    },
    coord: {
      type: Array
    },
    id: {
      type: String
    }
  },
  watch: {
    coord (val) {
      this.popuper.setPosition(val)
    }
  },
  mounted () { // 组件挂载完成处理函数
    let offsetX = this.$el.clientWidth/2.0
    let offsetY = this.$el.clientHeight + 22
    this.popuper = new ol.Overlay(({
        element: this.$el,
        positioning: 'top-left',
        offset: [-offsetX, -offsetY]
    }))
    this.map.addOverlay( this.popuper)
    if (this.coord && this.coord.length > 0) {
        this.popuper.setPosition(this.coord)
    }
  },
  methods: {
    
  }
}
</script>

<style scoped>
/* 气泡容器样式 */
.popup {
    position: absolute;
    background: #FFFFFF;
    border: 1px solid #D0021B;
    padding: 0;
    border-radius: 5px;
    width: auto;
    height: auto;
}
/* 气泡容器渲染前后的公用样式 */
.popup:after, .popup:before {
	top: 100%;
	left: 50%;
	border: solid transparent;
	content: " ";
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
}
/* 气泡容器渲染后的样式 */
.popup:after {
	border-color: rgba(255, 255, 255, 0);
	border-top-color: #FFFFFF;
	border-width: 11px;
	margin-left: -11px;
}
/* 气泡容器渲染前的样式 */
.popup:before {
	border-color: rgba(255, 255, 255, 0);
	border-top-color: #D0021B;
	border-width: 12px;
	margin-left: -12px;
}
.contentContainer {
    margin: 2px;
    font-family: PingFangSC-Medium;
    font-size: 12px;
}
.contentTop {
    width: 120px;
    height: 90px;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
.contentTop img{
    height: 90px;
}
.contentTop .similarity{
    position: absolute;
    top: 0;
    right: 0;
    height: 20px;
    width: 30px;
    text-align: center;
    background: rgba(255,255,255,0.9);
    border-radius: 3px;
}
.contentTop .similarity span{
    line-height: 20px;
    color: #08BA53;
}
.contentBottom {
    position: relative;
    width: 120px;
    height: 34px;
}
.contentBottom .des {
    margin: 0 4px;
    text-align: left;
    color: rgba(70,49,49,0.80);
    overflow:hidden;
    text-overflow:ellipsis;
    display:-webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
.contentBottom span {
    position: absolute;
    bottom: 2px;
    right: 16px;
    color: rgba(8,186,83,0.80);
}
</style>
