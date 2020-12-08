const db = wx.cloud.database()
// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      "滨海校区",
      "松山校区"
    ],
    campus: "滨海",
    avatarUrl: "",
    userInfo: {},
    wuPinInfo: [],
    wuPinCount: 0,
    current: 0,
    messageList: [{
        message: "公告：欢迎来到“寻物”微信小程序。",
      },
      // {
      //   message: "公告：如果遇到广告，可点击举报。5人以上举报系统即可删除。",
      // },
      // {
      //   message: "公告：若丢失物品，请先仔细找一找身边的物品哦。",
      // },
      // {
      //   message: "公告：觉得小程序有帮助，可以给我一个好评哦！",
      // },
    ]
    // ids:{}
  },

  onNavBarTap: function(event) {
    // 获取点击的navbar的index
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex
    })
    // console.log(navbarTapIndex)
    if (navbarTapIndex == 1) {
      this.setData({
        campus: "松山"
      })
      this.onPullDownRefresh()
    } else if (navbarTapIndex == 0) {
      this.setData({
        campus: "滨海"
      })
      this.onPullDownRefresh()
    }
  },

  // 点击头像回到“我的”页
  toMeBtn() {
    wx.switchTab({
      url: '/pages/me/me',
    })
  },


  getList() {
    const that = this
    // 获取列表信息
    // .orderBy('addDate', 'desc') 实现安装时间排序显示
    db.collection('wuPin')
      .where({
        theCampus: that.data.campus
      })
      .orderBy('addDate', 'desc')
      .get({
        success: function(res) {
          console.log(res);

          that.setData({
            wuPinInfo: res.data,
            // ids: res.data._openid
          });
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          // console.log("wuPinInfo",res.data[0]._id)
        }
      })
    // 关闭下拉刷新的窗口
    wx.stopPullDownRefresh();
  },


  // 搜索
  inputS(e) {
    // console.log(e.detail.value)
    this.setData({
      inputSearch: e.detail.value
    })
  },


  searchBtn(e) {
    const that = this
    console.log(that.data.inputSearch)
    db.collection('wuPin').where({
      //使用正则查询，实现对搜索的模糊查询
      name: db.RegExp({
        regexp: that.data.inputSearch,
        //从搜索栏中获取的value作为规则进行匹配。
        options: 'i',
        //大小写不区分
      }),

    }).limit(10).orderBy('addDate', 'desc').get({
      success: res => {
        if (res.data.length != 0) {
          wx.showToast({
            title: '查找成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            wuPinInfo: res.data,
            inputValue: ""
          })
        } else {
          wx.showToast({
            title: '数据未找到',
            icon: 'loading',
            duration: 2000
          })
          that.setData({
            inputValue: ""
          })
        }


      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 缓存中拿数据
    const ui = wx.getStorageSync("userInfo")

    this.setData({
      userInfo: ui,
      openid: ui.openid,
      avatarUrl: ui.avatarUrl
    })

    this.getList();

    // db.collection('gongGaoList').get({
    //   success: function (res) {
    //     console.log("公告：",res)
    //     // this.setData({
    //     //   messageList:res.data
    //     // })
    //   }
    // })

    // 获取公告
    const that = this
    db.collection('gongGaoList')
      .get({
        success: function(res) {
          console.log("公告：", res.data)
          that.setData({
            messageList: res.data
          })
        }
      })

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (!this.data.userInfo.avatarUrl) {
      console.log("没有头像")

      const ui = wx.getStorageSync("userInfo")

      this.setData({
        avatarUrl: ui.avatarUrl
      })
    } else {
      console.log("有头像")
    }

    // 重置数组
    this.setData({
      wuPinInfo: {},
      inputValue: ""
    })

    // 发送请求
    this.getList();

  },

  // 下拉刷新页面
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

    // 重置数组
    this.setData({
      wuPinInfo: {},
      inputValue: ""
    })

    // 发送请求
    this.getList();
    // 数据请求回来，需要手动关闭等待效果

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // console.log("到底");

    wx.showLoading({
      title: '刷新中！',
      duration: 1000
    })

    let x = this.data.wuPinCount + 20
    // console.log(x)

    let old_data = this.data.wuPinInfo
    db.collection('wuPin').orderBy('addDate', 'desc').skip(x) // 限制返回数量为 20 条
      .get()
      .then(res => {
        // 利用concat函数连接新数据与旧数据
        // 并更新wuPinInfo
        this.setData({
          wuPinInfo: old_data.concat(res.data),
          wuPinCount: x
        })
        console.log(res.data)
      })
      .catch(err => {
        console.error(err)
      })
    // console.log('circle 下一页');
  },

})