//index.js
//获取应用实例
const app = getApp()

Page({
  onLoad(event) {
    let that = this;

    // 设置swiper高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: Number(750 / res.windowWidth) * res.windowHeight,
        });
      }
    });

    // 重载参数，用于刷新主页数据
    let totalCitys = wx.getStorageSync('totalCitys');
    let currentCity = wx.getStorageSync('currentCity');

    console.log("enter index onload.", totalCitys, currentCity);

    // 根据系统时间更换背景图片
    let dateNowHour = new Date().getHours();
    let bgURI = "weather-bg1";
    if (dateNowHour < 6 || dateNowHour > 19){
      bgURI = "weather-bg2";
    }
    
    this.setData({
      bgURI: bgURI
    });

    if (totalCitys && currentCity >= 0) {
      this.setData({
        totalCitys: totalCitys,
        currentCity: currentCity
      });

      this.getCache();
    }
    else {
      wx.setStorage({
        key: 'totalCitys',
        data: this.data.totalCitys
      });

      wx.setStorage({
        key: 'currentCity',
        data: this.data.currentCity
      });
    }

    this.onPullDownRefresh();
  },
  data: {
    pageHeight: 800,
    bgURI: "weather-bg1",
    currentCity: 0,
    totalCitys: ['北京'],
    footerNote: "气象数据来自和风天气",
    scrollInfo: {
      enableScroll: false,
      scrollPage: 0,
      scrollDelta: 30,
      scrollLeft: 0
    },
    weatherInfos: [{
      city: '广州',
      city_parent: '广州',
      origin: '广东',
      tempC: 28,
      weather: '多云',
      wind_dir: '北风',
      wind_sc: '2级',
      humidity: 80,
      tempFit: 40,
      code: "102",
      lastUpdateTime: 0,
      
      futureInfo: [
        {
          date: '今天(7/13)',
          weather: '雷阵雨',
          airCondition: '优',
          tempCUpper: '35',
          tempCLower: '27',
          code: "302"
        },
        {
          date: '明天(7/14)',
          weather: '雷阵雨',
          airCondition: '优',
          tempCUpper: '35',
          tempCLower: '27',
          code: "302"
        },
        {
          date: '周二(7/15)',
          weather: '雷阵雨',
          airCondition: '优',
          tempCUpper: '35',
          tempCLower: '27',
          code: "302"
        }
      ]
    }]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onPullDownRefresh(){
    try{
      let that = this;
      let reqWeatherURL = "https://free-api.heweather.com/s6/weather?";
      let location = "auto_ip";

      if (this.data.totalCitys !== undefined && this.data.totalCitys.length > this.data.currentCity){
        location = this.data.totalCitys[this.data.currentCity];
      }

      let data = {
        location: location,
        key: "4932eabad8954d5facbae0924d037de3"
      };
      let cityCount = this.data.totalCitys.length;

      // 获取最后一次更新时间
      let lastUpdateTime = 0;
      // 新加入的城市没有数据，立即刷新
      if (this.data.weatherInfos.length > this.data.currentCity){
       lastUpdateTime = this.data.weatherInfos[this.data.currentCity].lastUpdateTime;
      }
      console.log('pullrefresh lasttime:', lastUpdateTime, ' now:', Date.now());
      // 5分钟内不再更新
      if ((Date.now() - lastUpdateTime) / 1000 < 600){
        wx.stopPullDownRefresh();
        
        wx.showToast({
          title: '数据已是最新的',
          icon: 'success',
          duration: 2000
        });

        this.getCache();

        return;
      }

      // 下拉刷新等待
      wx.showLoading({
        title: '数据加载中...',
      });

      // 获取实时的天气情况
      // 获取3天天气预报情况
      wx.request({
        url: reqWeatherURL,
        data: data,
        success(res){
          let weather = res.data.HeWeather6[0];
          let weather_basic = res.data.HeWeather6[0].basic;
          let weather_now = res.data.HeWeather6[0].now;
          let weather_forecast = res.data.HeWeather6[0].daily_forecast;
          let weather_hourly = res.data.HeWeather6[0].hourly;

          let windsc = weather_now.wind_sc + ' 级';
          let totalCitys = that.data.totalCitys;
          let currentCity = that.data.currentCity;
          let city_origin = "";
          let weatherInfos = that.data.weatherInfos;

          lastUpdateTime = Date.now();
          console.log('get real weather', weather);

          currentCity = totalCitys.indexOf(weather_basic.location);

          if (currentCity < 0) {
            totalCitys.push(weather_basic.location);
            currentCity = totalCitys.length - 1;
          }

          // 如果地级城市和区域是同一个，说明是直辖市
          city_origin = (weather_basic.admin_area === weather_basic.parent_city)
            ? "中国" : weather_basic.admin_area; 

          
          // 设置当前城市数据
          let weatherInfo = {};
          let weather_add = true;
          if (weatherInfos.length > currentCity){
            weatherInfo = weatherInfos[currentCity];
            weather_add = false;
          }

          // 基本信息
          weatherInfo.city = weather_basic.location;
          weatherInfo.city_parent = weather_basic.parent_city;
          weatherInfo.origin = city_origin;
          // 实况信息
          weatherInfo.tempC = weather_now.tmp;
          weatherInfo.weather = weather_now.cond_txt;
          weatherInfo.airFig = weather_now.cond_txt;
          weatherInfo.wind_dir = weather_now.wind_dir;
          weatherInfo.wind_sc = windsc;
          weatherInfo.humidity = weather_now.hum;
          weatherInfo.tempFit = weather_now.fl;
          weatherInfo.code = weather_now.cond_code;
          weatherInfo.lastUpdateTime = lastUpdateTime;
          // 预报信息
          if (weather_add) {
            weatherInfo.futureInfo = [];
            weatherInfos.push(weatherInfo);
            currentCity = weatherInfos.length - 1;
          }

          let dateLabel = ['今天', '明天', '后天'];
          // 预报信息数组
          let futureInfos = [];
          let forecastDate = '';
          for (let i = 0; i < weather_forecast.length; i++) {
            forecastDate = weather_forecast[i].date;
            forecastDate = '(' + forecastDate.substr(6).replace(/-/g, "/") + ')';
            futureInfos.push({
              date: dateLabel[i] + forecastDate,
              weather: weather_forecast[i].cond_txt_d,
              airCondition: '优',
              tempCUpper: weather_forecast[i].tmp_max,
              tempCLower: weather_forecast[i].tmp_min,
              code: weather_forecast[i].cond_code_d
            });
          }
          weatherInfos[currentCity].futureInfo = futureInfos;

          /*
          // 逐小时预报
          // 预报信息数组
          let hourlyInfos = [];
          let forecastTime = '';
          for (let i = 0; i < weather_hourly.length; i++) {
            forecastTime = weather_hourly[i].time;
            forecastTime = forecastDate.substr(forecastDate.length - 5, 5);
            
            hourlyInfos.push({
              time: forecastTime,
              weather: weather_hourly[i].cond_txt_d,
              tempC: weather_hourly[i].tmp,
              code: weather_hourly[i].cond_code_d,
              humidity: weather_hourly[i].hum,
              wind_dir: weather_hourly[i].wind_dir,
              wind_sc: weather_hourly[i].wind_sc + ' 级'
            });
          }
          weatherInfos[currentCity].hourlyInfo = hourlyInfos;
          */

          that.setData({
            weatherInfos: weatherInfos,
            totalCitys: totalCitys,
            currentCity: currentCity
          });

          wx.setStorage({
            key: 'weatherInfos',
            data: weatherInfos
          });

          wx.showToast({
            title: '数据下载成功',
            icon: 'success',
            duration: 2000
          });
        },
        error(){
          wx.showToast({
            title: '数据下载失败',
            icon: 'loading',
            duration: 2000
          });
        },
        complete(){
          wx.stopPullDownRefresh();
        }
      });
    }
    catch(e){
      console.log(e);
    }
  },
  updateWeather: function(){

  },
  getCache: function(){
    let cityCount = this.data.totalCitys.length;

    if (this.data.currentCity >= cityCount){
      console.log('cache error.', this.data.currentCity, this.data.totalCitys);
      return;
    }

    let infos = wx.getStorageSync("weatherInfos");
    
    if (infos) {
      // 当新加入城市无数据时，将已有数据加入，再执行更新操作
      if (this.data.currentCity > infos.length){
        let insertCity = infos[0];
        insertCity.city = this.data.totalCitys[this.data.currentCity];
        insertCity.parent_city = insertCity.city;
        insertCity.origin = insertCity.parent_city;
        insertCity.lastUpdateTime = 0;
        infos.push(insertCity);
      }
      this.setData({
        weatherInfos: infos
      });

      console.log('get cache weatherInfo.', infos);
    }
  },
  nextView(event){
    let source = event.detail.source;
    let curr = event.detail.current;

    console.log('swiper..', event);
    if (source === "touch"){
      this.setData({
        currentCity: curr
      });
    }

  },
  scrollNext(event){
    //console.log(event.detail);
    let that = this;
    let scrollInfo = this.data.scrollInfo;
    let pageCount = this.data.weatherInfos.length;
    let pageWidth = event.detail.scrollWidth / pageCount;
    let pageIndex = 0;
    
    if (!scrollInfo.enableScroll){
      return;
    }

    if (Math.abs(event.detail.deltaX) >= scrollInfo.scrollDelta){
      // 急速的滚动判定
      pageIndex = (event.detail.deltaX > 0) ? Math.max(0, pageIndex - 1) : 
        Math.min(pageCount - 1, pageIndex + 1);

      console.log('scrolling...fast', event.detail.deltaX);
    }
    else{
      // 慢速的滚动判定
      pageIndex = Math.abs(Math.round(event.detail.scrollLeft / pageWidth));
    }

    scrollInfo.scrollPage = pageIndex;

    console.log('scrolling...', event.detail, pageIndex);
    this.setData({
      "scrollInfo.scrollPage": pageIndex
    });
  },
  scrollStart(event){
    this.setData({
      "scrollInfo.enableScroll": true
    });
  },
  scrollEnd(event) {
    console.log('scrollend...', this.data.scrollInfo.scrollPage);
    this.setData({
      "scrollInfo.enableScroll": false,
      currentCity: this.data.scrollInfo.scrollPage
    })
  }
})
