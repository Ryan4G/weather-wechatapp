Page({
  onLoad: function(){
    this.getTopCity();

    let totalCitys = wx.getStorageSync("totalCitys");
    if (totalCitys){
      console.log('cityadd...', totalCitys);
      this.setData({
        totalCitys: totalCitys
      });
    }
  },
  data: {
    beginSearch: false,
    totalCitys: [],
    hotcitys: [
      '北京', '上海', '广州', '深圳',
      '珠海', '佛山', '南京', '苏州',
      '厦门', '长沙', '成都', '重庆',
      '福州', '杭州', '武汉', '青岛'
    ],
    searchcitys: [
      {
        city: '广州',
        city_parent: '广州',
        origin: '广东',
      },
      {
        city: '韶关',
        city_parent: '韶关',
        origin: '广东',
      },
      {
        city: '北京',
        city_parent: '北京',
        origin: '北京',
      }
    ]
  },
  getTopCity(){
    let that = this;
    let reqTopURL = "https://search.heweather.com/top?";

    let data = {
      group: "cn",
      key: "4932eabad8954d5facbae0924d037de3",
      number: 20
    };

    wx.request({
      url: reqTopURL,
      data: data,
      success: function (res) {
        let citys = res.data.HeWeather6[0].basic;
        //console.log(citys);

        let topCitys = [];
        for(let i = 0; i < citys.length; i++){
          topCitys.push(citys[i].location);
        }

        that.setData({
          hotcitys: topCitys
        });
      },
      complete: function () {

      }
    });
  },
  onSearchCity(event){
    let that = this;
    let searchData = event.detail.value;
    let beginSearch = false;

    let reqCityURL = "https://search.heweather.com/find?";

    let data = {
      location: searchData,
      key: "4932eabad8954d5facbae0924d037de3",
      group: "cn"
    };

    console.log(event);

    if (searchData && searchData.length > 0){
      beginSearch = true;

      wx.request({
        url: reqCityURL,
        data: data,
        success: function (res) {
          let citys = res.data.HeWeather6[0].basic;
          //console.log(citys);

          let matchCitys = [];
          if (citys){

            let city_origin = "";
            for (let city of citys) {
              // 如果地级城市和区域是同一个，说明是直辖市
              city_origin = (city.admin_area === city.parent_city)
                ? "中国" : city.admin_area; 

              matchCitys.push({
                city: city.location,
                city_parent: city.parent_city,
                origin: city_origin
              });
            }
          }

          that.setData({
            searchcitys: matchCitys
          });
        },
        complete: function () {

        }
      });
    }
    else{
      beginSearch = false;
    }

    that.setData({
      beginSearch: beginSearch
    });
  },
  addNewcity(event){
    let that = this;
    let location = event.currentTarget.dataset.location;
    let totalCitys = this.data.totalCitys;

    console.log(location);
    
    let cur = totalCitys.indexOf(location);

    if (cur < 0) {
      totalCitys.push(location);
      cur = totalCitys.length - 1;

      wx.setStorageSync("totalCitys", totalCitys);
    }

    wx.setStorageSync("currentCity", cur);

    wx.reLaunch({
      url: "../../pages/index/index",
    });
  }
})
