var styleFunction = function(feature,res){
    //轨迹线图形
   var trackLine= feature.getGeometry();
   var styles = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#2E8B57',
          width: 10
        })
      })
    ];
    //对segments建立btree索引
    let tree= rbush();//路段数
    trackLine.forEachSegment(function(start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        //计算每个segment的方向，即箭头旋转方向
        let rotation = Math.atan2(dy, dx);
        let geom=new ol.geom.LineString([start,end]);
        let extent=geom.getExtent();
        var item = {
          minX: extent[0],
          minY: extent[1],
          maxX: extent[2],
          maxY: extent[3],
          geom: geom,
          rotation:rotation
        };
        tree.insert(item);
    });
    //轨迹地理长度
    let length=trackLine.getLength();
    //像素间隔步长
    let stpes=40;//像素步长间隔
    //将像素步长转实际地理距离步长
    let geo_steps=stpes*res;
    //箭头总数
    let arrowsNum=parseInt(length/geo_steps);
    for(let i=1;i<arrowsNum;i++){
        let arraw_coor=trackLine.getCoordinateAt(i*1.0/arrowsNum);
        let tol=10;//查询设置的点的容差，测试地图单位是米。如果是4326坐标系单位为度的话，改成0.0001.
        let arraw_coor_buffer=[arraw_coor[0]-tol,arraw_coor[1]-tol,arraw_coor[0]+tol,arraw_coor[1]+tol];
        //进行btree查询
        var treeSearch = tree.search({
          minX: arraw_coor_buffer[0],
          minY: arraw_coor_buffer[1],
          maxX: arraw_coor_buffer[2],
          maxY: arraw_coor_buffer[3]
        });
        let arrow_rotation;
        //只查询一个，那么肯定是它了，直接返回
        if(treeSearch.length==1)
          arrow_rotation=treeSearch[0].rotation;
        else if(treeSearch.length>1){
            let results=treeSearch.filter(function(item){
              //箭头点与segment相交，返回结果。该方法实测不是很准，可能是计算中间结果
              //保存到小数精度导致查询有点问题
              // if(item.geom.intersectsCoordinate(arraw_coor))
              //   return true;

              //换一种方案，设置一个稍小的容差，消除精度问题
              let _tol=1;//消除精度误差的容差
              if(item.geom.intersectsExtent([arraw_coor[0]-_tol,arraw_coor[1]-_tol,arraw_coor[0]+_tol,arraw_coor[1]+_tol]))
                return true;
            })
            if(results.length>0)
              arrow_rotation=results[0].rotation;
        }
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(arraw_coor),
            image: new ol.style.Icon({
              src: '../static/content/images/arrowright.png',
              anchor: [0.75, 0.5],
              rotateWithView: true,
              rotation: -arrow_rotation
            })
        }));
    }
    return styles;
  }