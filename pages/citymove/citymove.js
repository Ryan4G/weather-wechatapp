Page({
  onLoad(e) {
    let that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          px2rpxFictor: Number(750 / res.windowWidth),
        });
      }
    });

    console.log('onload enter. px to rpx fictor:', this.data.px2rpxFictor);

    this.getCache();
  },
  data: {
    enableMove: false,
    px2rpxFictor: 2,
    moveBlockSize: {
      blockMargin: 20,
      blockHeight: 128,
      startY: 0,
      currentY: 0,
      currentID: 0
    },
    weatherInfos:[],
    citys: [
      {
        location: '广州',
        origin: '广东',
        blockY: 20,
        originY: 20,
        order: 0
      },
      {
        location: '北京',
        origin: '北京',
        blockY: 168,
        originY: 168,
        order: 1
      },
      {
        location: '深圳',
        origin: '广东',
        blockY: 316,
        originY: 316,
        order: 2
      },
      {
        location: '深圳',
        origin: '广东',
        blockY: 316,
        originY: 316,
        order: 3
      },
      {
        location: '深圳',
        origin: '广东',
        blockY: 316,
        originY: 316,
        order: 4
      },
      {
        location: '深圳',
        origin: '广东',
        blockY: 316,
        originY: 316,
        order: 4
      }
    ]
  },
  getCache(){
    let that = this;
    let citys = that.data.citys;

    console.log('enter weatherinfos.');

    wx.getStorage({
      key: 'weatherInfos',
      success(res) {
        let infos = res.data;

        console.log('getCache success.', infos);

        citys.splice(0, citys.length);
        
        let city_origin = "";
        for (let info of infos) {
          // 如果地级城市和县级城市是同一个，则取区域，否则区域+地级城市
          city_origin = (info.city === info.city_parent) 
            ? info.origin : (info.origin + "·" + info.city_parent); 

          citys.push({
            location: info.city,
            origin: city_origin,
            blockY: 20,
            originY: 20,
            order: 0
          });
        }

        that.setData({
          weatherInfos: infos
        });
      },
      complete(){
        console.log('getCache complete.');

        that.setBlockArray(citys);
      }
    });
  },
  setBlockArray(citys){
    let that = this;
    let block = that.data.moveBlockSize;
    // 按order排序
    citys.sort((a ,b) => {
      return a.order - b.order;
    });

    for (let i = 0; i < citys.length; i++){
      citys[i].blockY = (block.blockMargin + i * (block.blockMargin + block.blockHeight));
      citys[i].originY = citys[i].blockY;
      citys[i].order = i;
    }

    console.log("setarraty...", citys);

    that.setData({
      citys: citys
    });
  },
  cityMoveStart(event){

    console.log('cityMoveStart enter.', event);

    let id = this.data.moveBlockSize.currentID;
    //let city = this.data.citys[id];
    let currY = event.touches[0].pageY;
    
    console.log('citystart ....', currY);

    this.setData({
      "moveBlockSize.startY": currY,
      "moveBlockSize.currentY": currY
    });
  },
  cityMoving(event) {
    if (!this.data.enableMove) {
      return;
    }

    //console.log('cityMoving enter.', event);
    let block = this.data.moveBlockSize;
    let id = block.currentID;
    let citys = this.data.citys;
    let startY = block.startY;
    let currY = event.touches[0].pageY;
    let fictor = this.data.px2rpxFictor;
    let moveYpx = currY - startY;
    let moveDistance = block.blockMargin + block.blockHeight / 2;

    let order = citys[id].order;

    citys[id].blockY = (moveYpx * fictor) + citys[id].originY;

    //console.log('cityMoving ....', currY, currY - this.data.moveBlockSize.startY, citys[id].blockY);

    for (let j = 0; j < citys.length; j++) {
      if (moveYpx > 0 && order < citys.length - 1) {
        // 向下移动，获取下一个模块位置
        if (citys[j].order === order + 1) {
          moveDistance = citys[j].originY - citys[id].originY - block.blockHeight / 2;
          if (Math.abs(moveYpx * fictor) > moveDistance) {
            citys[j].order = order;
            citys[id].order = order + 1;
            citys[j].blockY = citys[j].originY = (block.blockMargin + citys[j].order * (block.blockMargin + block.blockHeight));

            citys[id].originY = citys[id].blockY;
            // 更新交换节点的起始Y值
            startY = currY;
            console.log('cityMoving ....', citys);
          }
          //let tempY = citys[j].originY;
          break;
        }
      }
      else if (moveYpx < 0 && order > 0) {
        // 向上移动，获取上一个模块位置
        if (citys[j].order === order - 1) {
          moveDistance = citys[id].originY - citys[j].originY - block.blockHeight / 2;
          if (Math.abs(moveYpx * fictor) > moveDistance) {
            citys[j].order = order;
            citys[id].order = order - 1;
            citys[j].blockY = citys[j].originY = (block.blockMargin + citys[j].order * (block.blockMargin + block.blockHeight));

            citys[id].originY = citys[id].blockY;
            // 更新交换节点的起始Y值
            startY = currY;
          }
          //let tempY = citys[j].originY;
          break;
        }
      }
      else{
        // 第一个或最后一个模块
        break;
      }
    }

    this.setData({
      "moveBlockSize.currentY": currY,
      "moveBlockSize.startY": startY,
      citys: citys
    });
  }, 
  cityMoveEnd(event) {
    if (!this.data.enableMove) {
      return;
    }

    console.log('cityMoveEnd enter.', event);

    let citys = this.data.citys;
    let block = this.data.moveBlockSize;
    let id = block.currentID;

    citys[id].blockY = citys[id].originY = (block.blockMargin + citys[id].order * (block.blockMargin + block.blockHeight));

    this.setData({
      enableMove: false,
      citys: citys
    });
  },
  cityLongpress(event) {
    let id = event.currentTarget.dataset.id;
    console.log('cityLongpress enter.', event);

    this.setData({
      enableMove: true,
      "moveBlockSize.currentID": id
    });
  },
  cityDelete(event) {

    console.log('cityDelete enter.', event);

    let citys = this.data.citys;
    let deleteIndex = event.currentTarget.dataset.id;
    citys.splice(deleteIndex, 1);

    console.log('city deleted.', citys);

    this.setBlockArray(citys);
  },
  saveOrder(){
    let that = this;

    wx.showModal({
      title: '调整确认',
      content: '请确认是否保留本次调整内容？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');

          let citySet = [];
          let rawCitys = that.data.citys;
          let weatherInfos = that.data.weatherInfos;

          rawCitys.sort((a, b) => {
            return a.order - b.order;
          });

          // 选择全部城市
          for (let city of rawCitys){
            if (!citySet.includes(city.location)){
              citySet.push(city.location);
            }
          }

          // 删除已移除的城市
          for (let i = weatherInfos.length - 1; i >= 0; i--){
            if (!citySet.includes(weatherInfos[i].city)) {
              weatherInfos.splice(i, 1);
            }
          }

          // 对城市数据排序
          let orderWeatherInfos = new Array(citySet.length);
          for (let j = 0, cityOrder = 0; j < citySet.length; j++){
            cityOrder = citySet.indexOf(weatherInfos[j].city);
            if (cityOrder >= 0 && cityOrder < citySet.length){
              orderWeatherInfos[cityOrder] = weatherInfos[j];
            }
          }

          // 设置城市列表
          wx.setStorage({
            key: "totalCitys",
            data: citySet
          });

          // 设置当前城市序号
          wx.setStorage({
            key: "currentCity",
            data: 0
          });

          // 设置排序后的城市天气数据
          wx.setStorage({
            key: "weatherInfos",
            data: orderWeatherInfos
          });

          console.log("setinfos...", rawCitys, citySet, orderWeatherInfos);
          
          wx.reLaunch({
            url: "../../pages/index/index",
          });

        } else if (res.cancel) {
          // 取消则回退上级页面
          wx.navigateBack({
            delta: 1
          })
        }
      }
    });
  }
})
