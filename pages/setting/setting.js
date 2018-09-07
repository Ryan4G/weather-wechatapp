Page({
  onLoad: function(){
    this.getCache();
  },
  data: {
    cache: {
      size: 0,
      limit: 10
    }
  },
  getCache: function(){
    let that = this;

    wx.getStorageInfo({
      success: function (res) {
        console.log(res);
        
        that.setData({
          cache: {
            size: res.currentSize,
            limit: (res.limitSize / 1024).toFixed(1)
          }
        });

      },
      fail: function () {

      },
      complete: function () {

      }
    });
  },
  clearCache: function(){
    let that = this;
    // 提示用户是否确认清除
    wx.showModal({
      title: '清空缓存',
      content: '确认清空数据（城市将清空）？',
      showCancel: true,
      success: function () {
        wx.clearStorage();
        wx.reLaunch({
          url: "../../pages/index/index",
        });

      },
      complete: function () {
        that.getCache();
      }
    });
  }
})
