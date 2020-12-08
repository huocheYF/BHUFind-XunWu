const db = wx.cloud.database()
const _ = db.command
const util = require('../../../utils/util.js')
// pages/home/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    wuPinInfo: [],
    userinfo: [],
    comments: [],
    newComment: "",
    userRose: 0,
    hiddenmodalput: true,
    postPhoneNums: null,
    inReport: false
  },

  clk() {
    const that = this
    if(!that.data.isShow){
      wx.showModal({
        title: '提示',
        content: '稍后请先通过下方的联系方式与对方取得联系并辨别真伪后，再点击“发送认领/归还请求”按钮。',
        confirmText:"我知道了",
        success (res) {
          if (res.confirm) {
            that.setData({
              'isShow': !that.data.isShow
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      that.setData({
        'isShow': !that.data.isShow
      })
    }

  },

  // 预览图片
  previewImg(){
    wx.previewImage({
      current: this.data.wuPinInfo.img, // 当前显示图片的http链接
      urls: [this.data.wuPinInfo.img] // 需要预览的图片http链接列表
    })
  },

  // 点击举报按钮
  toReport() {
    const that = this
    wx.showModal({
      title: '举报',
      content: '5人举报该广告将会被永久删除',
      success(res) {
        if (res.confirm) {
          console.log("用户点击确认举报")
          // 1.向物品信息添加举报人ID，弹窗提示举报成功
          // 2.判断物品信息举报人是否到5人，若是则删除

          // end 判断是否有举报信息
          if (that.data.wuPinInfo.toReports) {

            // 检查信息是否达到删除标准
            that.checkReport();

            // 是否在举报名单中
            that.inReportBook();

            if (that.data.inReport) {
              console.log("我在举报名单里")
              wx.showToast({
                title: '已经举报过了',
              })
            } else {
              // 数据库添加举报人ID
              that.reportCloudFunction();
            }
            // end else
          } else {
            // 数据库添加举报人ID
            that.reportCloudFunction();
          }
          // end 判断是否有举报

        } else if (res.cancel) {
          console.log('用户点击取消举报')
        }
      }
    })
  },


  checkReport() {
    if (this.data.wuPinInfo.toReports.length >= 4) {
      console.log("举报人数N人", this.data.wuPinInfo.toReports)
      wx.cloud.callFunction({
        name: "deleteWuPin",
        data: {
          wuPinId: this.data.wuPinInfo._id,
        },
        complete: console.log
      })
      // 删除照片
      wx.cloud.deleteFile({
        fileList: [this.data.wuPinInfo.img],
        success(res) {
          console.log(res, '删除图片成功')
        },
        fail(err) {
          console.log(err,"删除图片失败")
        }
      })
    } else {
      console.log("举报不超过N人")
    }
    // end 检查举报信息
  },

  // 是否在举报名单中
  inReportBook() {
    console.log("用户有举报信息")
    const arr = this.data.wuPinInfo.toReports
    const me = this.data.userinfo.openid

    for (var i = 0; i <= arr.length; i++) {
      if (arr[i] === me) {
        this.setData({
          inReport: true
        })
      }
    }
  },

  // reportCloudFunction
  reportCloudFunction() {
    // 数据库添加举报人ID
    wx.cloud.callFunction({
      name: "addToReports",
      data: {
        wuPinId: this.data.wuPinInfo._id,
        repostId: this.data.userinfo.openid
      },
      complete: console.log
    })
    wx.showToast({
      title: '举报成功',
      icon: "success",
      duration: 2000,
      success: function() {
        // 设置返回延时
        setTimeout(function() {
          wx.navigateBack({})
        }, 2000) //延迟时间
      }
    })
    // end Toast
  },


  // 拨打电话
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.wuPinInfo.phoneNum
    })
  },
  // 一键复制事件
  copyBtnQQ: function(e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据
      data: that.data.wuPinInfo.qqNum,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },
  // 一键复制事件
  copyBtnWX: function(e) {
    var that = this;
    wx.setClipboardData({
      //准备复制的数据
      data: that.data.wuPinInfo.weChatNum,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  // 添加用户评论
  newCommentInput(e) {
    this.setData({
      newComment: e.detail.value
    })
  },
  newCommentBtn() {
    console.log("newComment", this.data.newComment);
    const userinfo = wx.getStorageSync("userInfo");
    const that = this;
    console.log("userinfo", userinfo)
    db.collection("comment").add({
      data: {
        newComment: that.data.newComment,
        avatarUrl: userinfo.avatarUrl,
        nickName: userinfo.nickName,
        openId: userinfo.openid,
        commentDate: util.formatTime(new Date()),
        wuPin_id: that.data.wuPinInfo._id,
      }
    }).then(res => {
      wx.showToast({
        title: '评论发送成功',
        icon: "success",
        duration: 2000,
        success: function() {
          // 设置返回延时
          setTimeout(function() {
            wx.navigateBack({})
          }, 2000) //延迟时间
        }
      })
      //end Toast
    })
  },

  // 删除个人评论
  delCommet(e) {
    const that = this
    wx.showModal({
      title: '删除确认',
      content: '是否删除此条评论',
      success(res) {
        if (res.confirm) {
          db.collection('comment').where({
              openId: that.data.userinfo.openid,
              wuPin_id: that.data.wuPinInfo._id,
              newComment: e.currentTarget.dataset.comment
            })
            .remove({
              success: function(res) {
                wx.showToast({
                  title: '删除成功',
                  icon: "success",
                  duration: 2000,
                  success: function() {
                    // 设置返回延时
                    setTimeout(function() {
                      wx.navigateBack({})
                    }, 2000) //延迟时间
                  }
                })
                //end Toast
              }
            })
          // console.log("delComment", e.currentTarget.dataset.comment)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 发送认领请求
  //点击按钮弹出指定的hiddenmodalput弹出框
  postBtn: function() {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  postBtnNull() {
    wx.showModal({
      title: '失主已收到宝贝',
      content: '',
    })
  },
  //取消按钮
  postCancel: function() {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认
  postConfirm: function() {

    // 对电话号码进行判断
    let str = /^1\d{10}$/
    if (str.test(this.data.postPhoneNums)) {
      this.setData({
        hiddenmodalput: true,
      })
      console.log("手机号码正确")
      // 向数据库wuPin添加数据
      // 手机号码，用户openid，时间，头像，网名
      // 数据库

      const that = this
      wx.cloud.callFunction({
        name: "upFindData",
        data: {
          wuPinId: that.data.wuPinInfo._id,
          postDate: util.formatTime(new Date()),
          postOpenid: that.data.userinfo.openid,
          postPhoneNum: that.data.postPhoneNums,
          postavatarUrl: that.data.userinfo.avatarUrl,
          postnickName: that.data.userinfo.nickName
        },
        complete: console.log
      })
      wx.showToast({
        title: '发送成功',
        icon: "success",
        duration: 2000,
        success: function() {
          // 设置返回延时
          setTimeout(function() {
            wx.navigateBack({})
          }, 2000) //延迟时间
        }
      })
      //end Toast


    } else {
      wx.showToast({
        title: '失败=>手机号不正确',
        icon: "none"
      })
      this.setData({
        hiddenmodalput: true,
      })
    }
  },

  // 用户发送认领请求收到的电话号码
  postPhoneNum(e) {
    // console.log("e", e.detail.value)
    this.setData({
      postPhoneNums: e.detail.value
    })
  },
  // end 发送认领请求


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const {
      wuPin_id
    } = options;
    const that = this;

    // 获取物品信息
    db.collection('wuPin').where({
      _id: wuPin_id
    }).get({
      success: function(res) {
        that.setData({
          wuPinInfo: res.data[0],
        })
        // res.data 是包含以上定义的两条记录的数组
        console.log("物品信息获取成功", wuPinInfo)
      },
      fail(res) {
        console.log("获取物品信息失败", res)
      }
    })


    // 获取评论信息
    db.collection('comment').where({
      wuPin_id: wuPin_id
    }).get({
      success: function(res) {

        that.setData({
          comments: res.data,
        })

        console.log("获取评论信息", that.data.comments)

        //获取发失物招领人的Rose数量
        db.collection('users').where({
          _openid: that.data.wuPinInfo._openid,
          nickName: that.data.wuPinInfo.nickName
        }).get({
          success: function(res) {
            that.setData({
              userRose: res.data[0].rose
            })
          }
        })

      }
    })


    //本地缓存信息
    const ui = wx.getStorageSync("userInfo")
    that.setData({
      userinfo: ui
    })

  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const userinfo = wx.getStorageSync("userInfo")
    if (!userinfo) {
      wx.showLoading({
        title: '请登录！',
      })

      setTimeout(function() {
        wx.switchTab({
          url: '/pages/me/me',
        })
        wx.hideLoading()
      }, 2000)
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})