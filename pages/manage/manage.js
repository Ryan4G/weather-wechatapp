Page({
  onReady: function () {
    this.animation = wx.createAnimation();
  },
  onLoad: function(){
    this.getCache();
  },
  data: {
    showAdd: false,
    showMove: false,
    toolRotate: 0,
    citys: [
      {
        location: '广州',
        origin: '广东',
        weather: '多云',
        tempC: 28,
        humidity: 40,
        wind_dir: '北风',
        wind_sc: '2级',
        code: 103
      },
      {
        location: '广州',
        origin: '广东',
        weather: '多云',
        tempC: 28,
        humidity: 40,
        wind_dir: '北风',
        wind_sc: '2级',
        code: 103
      },
      {
        location: '广州',
        origin: '广东',
        weather: '多云',
        tempC: 28,
        humidity: 40,
        wind_dir: '北风',
        wind_sc: '2级',
        code: 103
      },
      {
        location: '广州',
        origin: '广东',
        weather: '多云',
        tempC: 28,
        humidity: 40,
        wind_dir: '北风',
        wind_sc: '2级',
        code: 103
      }
    ]
  },
  rotate: function () {
    let degree = (this.data.toolRotate === 0) ? 45 : 0;
    this.animation.rotate(degree).step();

    this.setData({
      animation: this.animation.export(),
      toolRotate: degree,
      showAdd: !this.data.showAdd,
      showMove: !this.data.showMove
    });
  },
  getCache: function(){
    let that = this;

    wx.getStorage({
      key: 'weatherInfos',
      success: function (res) {
        let infos = res.data;

        console.log('get weatherinfos.', infos);
        let citys = [];
        for (let info of infos){
          citys.push({
            location: info.city,
            origin: info.origin,
            weather: info.weather,
            tempC: info.tempC,
            humidity: info.humidity,
            wind_dir: info.wind_dir,
            wind_sc: info.wind_sc,
            code: info.code
          });
        }

        that.setData({
          citys: citys
        });

      },
    });
  }
})
