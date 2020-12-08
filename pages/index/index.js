//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

  },


  onLoad: function() {
      // 等待三秒后跳转到index.wxml
      setTimeout(function() {
        // 微信API：跳转到XX页面
        wx.switchTab({
          url: '/pages/home/home',
        })
      }, 3000)

  }
})