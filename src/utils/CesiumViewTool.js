import Cesium from 'cesium/Cesium'
const Hnadler = {
    /**
     * 根据左上角、右下角的世界坐标计算视图范围
     * @param {*} ellipsoid 三维视图椭球体
     * @param {*} car3_lt 左上角世界坐标（Cartesian3）
     * @param {*} car3_rb 右下角世界坐标（Cartesian3）
     * @return Object {
     *      minLon: 最小经度值（单位：度数）,
     *      minLat: 最小纬度值（单位：度数）,
     *      maxLon 最大经度值（单位：度数）,
     *      maxLat: 最大纬度值（单位：度数）
     *  }
     */
    transLTBRToExtent (ellipsoid, car3_lt, car3_rb, extent0) {
        var extent = extent0 ? extent0: {};
        var carto_lt = ellipsoid.cartesianToCartographic(car3_lt); // 左上角经纬度弧度坐标（Cartographic）
        var carto_rb = ellipsoid.cartesianToCartographic(car3_rb); // 右下角经纬度弧度坐标（Cartographic）
        extent.minLon = Cesium.Math.toDegrees(carto_lt.longitude); // 最小经度值（单位：度数）
        extent.maxLat = Cesium.Math.toDegrees(carto_lt.latitude); // 最大经度值（单位：度数）
        extent.maxLon = Cesium.Math.toDegrees(carto_rb.longitude); // 最大经度值（单位：度数）
        extent.minLat = Cesium.Math.toDegrees(carto_rb.latitude); // 最小纬度值（单位：度数）
        return extent;
    }
}

export default {
    /**
     * 获取视图场景范围
     * @param {*} viewer 
     * @return Object {
     *      minLon: 最小经度值（单位：度数）,
     *      minLat: 最小纬度值（单位：度数）,
     *      maxLon 最大经度值（单位：度数）,
     *      maxLat: 最大纬度值（单位：度数）,
     *      altitude: 高度（单位米）    
     *  }
     */
    getViewExtent (viewer) {
        var extent = {}; // 构造范围对象
        var scene = viewer.scene; // 视图的场景
        var ellipsoid = scene.globe.ellipsoid; // 视图的椭球体
        var canvas = scene.canvas; // 场景的画布
        var car2_lt = new Cesium.Cartesian2(0, 0); // canvas左上角，左上角屏幕坐标（Cartesian2）
        var car2_rb = new Cesium.Cartesian2(canvas.width, canvas.height); // canvas右下角，右下角屏幕坐标（Cartesian2） 
        var car3_lt = viewer.camera.pickEllipsoid(car2_lt, ellipsoid); // 左上角世界坐标（Cartesian3）
        var car3_rb = viewer.camera.pickEllipsoid(car2_rb, ellipsoid); // 右下角世界坐标（Cartesian3）
        // 根据坐上角、右下角与椭球体的关系，确定经纬度范围
        if (car3_lt && car3_rb) { // 当canvas左上角和右下角都在椭球体上时
            extent = Hnadler.transLTBRToExtent(ellipsoid, car3_lt, car3_rb, extent);
        } else if (!car3_lt && car3_rb) { // 当canvas左上角不在但右下角在椭球体上，左上角屏幕坐标由小递增判断是否在椭球体上
            var yIndex = 0; // 起始x
            var xIndex = 0; // 起始y
            do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
                yIndex <= canvas.height ? yIndex += 10 : canvas.height;
                xIndex <= canvas.width ? xIndex += 10 : canvas.width;
                car3_lt = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIndex, yIndex), ellipsoid);
            } while (!car3_lt);
            extent = Hnadler.transLTBRToExtent(ellipsoid, car3_lt, car3_rb, extent); // 根据左上角、右下角的世界坐标计算视图范围
        }else if (car3_lt && !car3_rb) { // 当canvas左上角在但右下角不在椭球体上，右下角坐标递减判断是否在椭球体上
            var yIndex = canvas.height; // 起始x
            var xIndex = canvas.width; // 起始y
            do {
                // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
                yIndex >= 10 ? yIndex -= 10 : 10;
                xIndex >= 10 ? xIndex -= 10 : 10;
                car3_rb = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(yIndex, yIndex), ellipsoid);
            } while (!car3_rb);
            extent = Hnadler.transLTBRToExtent(ellipsoid, car3_lt, car3_rb, extent); // 根据左上角、右下角的世界坐标计算视图范围
        } else if (!car3_lt && !car3_rb) { // 当canvas左上角、右下角都不在椭球体上，左上角坐标递增、右下角坐标递减，判断是否在椭球体上
            var yIndex = 0; // 起始x设为左上角x
            var xIndex = 0; // 起始y设为左上角y
            do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
                yIndex <= canvas.height ? yIndex += 10 : canvas.height;
                xIndex <= canvas.width ? xIndex += 10 : canvas.width;
                car3_lt = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIndex, yIndex), ellipsoid);
            } while (!car3_lt);
            yIndex = canvas.height; // 起始x设为右下角x
            xIndex = canvas.width; // 起始x设为右下角x
            do { // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
                yIndex >= 10 ? yIndex -= 10 : 10;
                xIndex >= 10 ? xIndex -= 10 : 10;
                car3_rb = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(yIndex, yIndex), ellipsoid);
            } while (!car3_rb);
            extent = Hnadler.transLTBRToExtent(ellipsoid, car3_lt, car3_rb, extent); // 根据左上角、右下角的世界坐标计算视图范围
        }
        // 获取高度
        extent.height = Math.ceil(viewer.camera.positionCartographic.height);
        return extent;
    },
    /**
     * 获取视图中心点坐标
     * @param {*} viewer 
     * @return Object {
     *      longitude: 经度,
     *      latitude: 纬度,
     *      altitude: 高度（单位米）
     *  }
     */
    getViewerCenter (viewer) {
        var screenCenterCo = new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2); // 构造中心点（Cartesian2）屏幕坐标
        var centerCartesian3Co = viewer.camera.pickEllipsoid(screenCenterCo); // 将中心点屏幕坐标（Cartesian2）转换为世界坐标（Cartesian3）
        if (centerCartesian3Co) { // 中心点世界坐标（Cartesian3）存在时
            var centerCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerCartesian3Co); // 将中心点世界坐标（Cartesian3）转换为经纬度弧度坐标（Cartographic）
            var longitude = Cesium.Math.toDegrees(centerCarto.longitude); // 经度，弧度值转换为度数（或者 centerCarto.longitude * 180 / Math.PI ）
            var latitude = Cesium.Math.toDegrees(centerCarto.latitude); // 纬度，弧度值转换为度数（或者 centerCarto.latitude * 180 / Math.PI ）
            var altitude = viewer.camera.positionCartographic.height; // 高度（单位：米）
            var centerCo = { // 构造中心点经纬度坐标对象
                longitude: longitude, // 经度 （单位：度数）
                latitude: latitude, // 纬度 （单位：度数）
                altitude: altitude // 高度（单位：米）
            }
            return centerCo;
        }else { 
            return null; 
        }
    }    
}