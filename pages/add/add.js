const db = wx.cloud.database()
const util = require('../../utils/util.js')
// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarActiveIndex: 0,
    lostORfind: "",
    navbarTitle: [
      "遗失",
      "拾遗"
    ],
    navbarImg: [
      "cuIcon-camerafill", "cuIcon-clothesfill"
    ],
    scrollLeft: 0,
    imgList: [],
    imgsFileId: null,
    date: "请选择时间",
    campus: [{
        value: '滨海',
        name: '滨海',
        checked: 'true'
      },
      {
        value: '松山',
        name: '松山'
      },
    ],
    theCampus: "滨海"
  },


  onNavBarTap: function(event) {
    // 获取点击的navbar的index
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex,
      date: "请选择时间",
      imgList: []
    })
    // console.log(navbarTapIndex)
  },

  // 单选按钮
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)

    const campus = this.data.campus
    for (let i = 0, len = campus.length; i < len; ++i) {
      campus[i].checked = campus[i].value === e.detail.value
    }

    this.setData({
      campus,
      theCampus: e.detail.value
    })
  },

  // 提交表单
  btnSub(res) {

    console.log("btnRes:", res);
    // console.log("the",this.data.theCampus)
    if (!res.detail.value.name) {
      wx.showModal({
        title: '错误警告',
        content: '未正确填写名称',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else if (!res.detail.value.place) {
      wx.showModal({
        title: '错误警告',
        content: '未正确填写地点！',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else if (!res.detail.value.date) {
      wx.showModal({
        title: '错误警告',
        content: '未正确填写日期！',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else if (!res.detail.value.details) {
      wx.showModal({
        title: '错误警告',
        content: '未填写详情！',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else if (this.data.imgList.length === 0) {
      wx.showModal({
        title: '错误警告',
        content: '未上传图片！',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else if (!res.detail.value.phoneNum && !res.detail.value.qqNum && !res.detail.value.weChatNum) {
      wx.showModal({
        title: '错误警告',
        content: '请至少填写一个联系方式！',
        cancelText: '返回',
        confirmText: '重填',
        success: ress => {}
      })
    } else {
      if (res.detail.value.phoneNum) {
        // 对电话号码进行判断
        let str = /^1\d{10}$/
        if (!str.test(res.detail.value.phoneNum)) {
          wx.showToast({
            title: '手机号码填写不正确',
            icon: "none",
            duration: 2000,
            // success: function() {
            //   // 设置返回延时
            //   setTimeout(function() {
            //     wx.navigateBack({})
            //   }, 2000) //延迟时间
            // }
          })
          // end Toast
        }else{
          // 手机号码正确
          this.messageOk(res)
        }
      }
    }
    // end else
  },


  // 消息确认并上传
  messageOk(res){
    wx.showModal({
      title: '温馨提示',
      content: '所提交信息是否正确？',
      cancelText: '取消',
      confirmText: '正确',
      success: ress => {
        if (ress.confirm) {
          wx.showLoading({
            title: '提交中',
            mask: true
          })
          //上传图片
          var images = this.data.imgList;
          // for (var i = 0; i < images.length; i++) {
          // console.log("图片地址：" + images[i]);

          //生成随机字符串
          var str = Math.random().toString(36).substr(2);
          console.log("随机字符串：" + str);

          const filePath = images[0];
          const cloudPath = str + filePath.match(/\.[^.]+?$/)[0];

          wx.cloud.uploadFile({
            cloudPath,
            filePath,
            success: ress2 => {
              console.log('[上传文件] 成功：', ress2)
              this.setData({
                imgsFileId: ress2.fileID
              });
              // console.log("imgsFileId:" + this.data.imgsFileId);
              // 上传数据
              // console.log("imgsFileId2:" + this.data.imgsFileId);
              const userinfo = wx.getStorageSync("userInfo")


              db.collection("wuPin").add({
                data: {
                  name: res.detail.value.name,
                  place: res.detail.value.place,
                  date: res.detail.value.date,
                  details: res.detail.value.details,
                  img: this.data.imgsFileId,
                  phoneNum: res.detail.value.phoneNum,
                  qqNum: res.detail.value.qqNum,
                  weChatNum: res.detail.value.weChatNum,
                  lostORfind: this.data.navbarTitle[this.data.navbarActiveIndex],
                  addDate: util.formatTime(new Date()),
                  nickName: userinfo.nickName,
                  avatarUrl: userinfo.avatarUrl,
                  solve: false,
                  theCampus: this.data.theCampus,
                  findData: {
                    findTrue: false,
                    postPhoneNum: "",
                    postOpenid: "",
                    postDate: "",
                    postavatarUrl: "",
                    postnickName: ""
                  }
                }
              }).then(res => {
                wx.hideLoading(); // 隐藏加载栏

                // 将表单信息清空
                this.setData({
                  form_info: "",
                  imgList: []
                })

                // 跳转到首页
                wx.switchTab({
                  url: '/pages/home/home',
                })
              })
              // end 上传数据
            },
            fail: e => {
              console.error('[上传文件] 失败：', e)
            }
          })

          // end 上传图片
        } else if (ress.cancel) {

        }
      }
    })
  },



  /**
   *
   */
  onBindAnimationFinish: function({
    detail
  }) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  ChooseImage() {
    if (this.data.imgList.length < 1) {
      wx.chooseImage({
        count: 1, //默认9
        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], //从相册选择
        success: (res) => {
          if (this.data.imgList.length != 0) {
            this.setData({
              imgList: this.data.imgList.concat(res.tempFilePaths)
            })
          } else {
            this.setData({
              imgList: res.tempFilePaths
            })
          }
        }
      });
    } else {
      wx.showToast({
        title: '最多上传一张照片',
        icon: "none",
        duration: 2000,
      })
      // end Toast
    }

  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '温馨提示',
      content: '确定要删除这张照片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  //上传图片
  // uploadImages() {
  //   var images = this.data.imgList;
  //   for (var i = 0; i < images.length; i++) {
  //     console.log("图片地址：" + images[i]);

  //     //生成随机字符串
  //     var str = Math.random().toString(36).substr(2);
  //     console.log("随机字符串：" + str);

  //     const filePath = images[i];
  //     const cloudPath = str + filePath.match(/\.[^.]+?$/)[0];

  //     wx.cloud.uploadFile({
  //       cloudPath,
  //       filePath,
  //       success: res => {
  //         console.log('[上传文件] 成功：', res)
  //         console.log("fileId:" + res.fileID);
  //         this.setData({
  //           imgsFileId: res.fileID
  //         });

  //       },
  //       fail: e => {
  //         console.error('[上传文件] 失败：', e)
  //         wx.showToast({
  //           icon: 'none',
  //           title: '上传失败',
  //         })
  //       }
  //     })
  //   }
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 检测是否登录
    const userinfo = wx.getStorageSync("userInfo")
    // console.log("res",userinfo)
    if (!userinfo) {
      wx.showLoading({
        title: '未登录！',
      })

      setTimeout(function() {
        wx.switchTab({
          url: '/pages/me/me',
        })
        wx.hideLoading()
      }, 1000)
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})