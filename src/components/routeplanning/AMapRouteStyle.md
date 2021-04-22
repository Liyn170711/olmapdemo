### 功能实现思路 AMapRouteStyle.vue —— 使用封装openlayers4组件结合高德地图API实现路径规划高德轨迹样式效果
### 功能实现思路 AMapRouteStyle2.vue —— openlayers4结合高德地图API实现路径规划高德轨迹样式效果（在AMapRouteStyle基础上事件监听使用once优化只监听一次的处理逻辑）
1. 功能简要说明：已知轨迹实现带箭头的轨迹效果
2. 实现关键点：
    ① 需要显示的箭头数量；
        # 箭头显示的步长（单位：像素，即：每隔多少个像素显示一个箭头）
        ARROW_PIX_STEP = 40;
        # 路径长度
        routeLength = routeGeom.getLength();
        # 地图分辨率：1像素单位(单位：m)所代表的的实际距离（单位：m）;
        mapResolution = map.getView().getResolution();
        # 箭头显示的步长（单位：米，即：每隔多少米显示一个箭头）
        geoStep = ARROW_PIX_STEP * mapResolution;
        # 箭头数量
        arrowNum = routeLength * 1.0 / geoStep
    ② 需要显示的箭头位置；
        # 在获取箭头位置时，一个重要的API是线条LineString的getCoordinateAt，利用它我们在轨迹线上获取箭头点的位置。
        linestring.getCoordinateAt(fraction, opt_dest) 
        fraction: 部分所求点到起点长度占线长度的比值，如0就是LineString的起点，1就是LineString的终点，0.5就是LineString的中点。
        for(let i=1; i<arrowNum; i++){
            let arraw_coor = geometry.getCoordinateAt(i * 1.0 / arrowNum);
            console.log(arraw_coor); // 输出每个箭头的坐标
        }
    ③ 需要显示的箭头方向；
    * 一条完整的轨迹由多个连续的segment组成;
    * 通过getCoordinateAt方法计算得到的箭头点，一定是在轨迹线上的某个点;
    * 每个箭头点的方向是由箭头点落在的segment的方向决定的;
    箭头方向即落在segment箭头点的方向；为解决循环计算的问题，提高查找效率引入rbush库（一个基于javascriptr-tree的高性能二维点和矩形空间索引，详情自行Google）利用btree进行查找，这里需要注意的是查询结果需要过滤箭头点与segment相交的结果，相交计算可以通过给箭头点设置较小的容差从而达到更精确的效果；
3. 优化：
    ① 根据地图分辨率变化（地图缩放）进行优化；
        上述1、2只能实现在指定地图分辨率下显示箭头未能根据地图缩放进行显示当前地图分辨率下需要显示的箭头数量、位置和方向，实现此需求需要监听地图缩放级别变化重新计算箭头数量、位置和方向，移除之前绘制的箭头，重新进行绘制；
        地图事件：map-change:resolution 地图分辨率变化，鼠标滚轮放大缩小可以触发多次造成箭头多次重绘；
                 map-moveend 地图移动结束，地图分辨率变化可以触发一次此事件（此外地图拖拽也会触发此事件），监听此事件重绘箭头时注意项：
                    a. 地图移动结束事件是否是地图分辨率变化造成的；
                    b. 地图分辨率变化时路径是否在当前地图可视边界范围内；
                 


