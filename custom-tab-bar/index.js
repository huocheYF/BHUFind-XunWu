// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    

  },

  /**
   * 组件的初始数据
   */
  data: {
    // 当前高亮项
    selected:0,
    
    tabList: [
        {
          "pagePath": "/pages/home/home",
          "text": "主页"
        },
        {
          "pagePath": "/pages/add/add",
          "text": "发布"
        },
        {
          "pagePath": "/pages/me/me",
          "text": "我的"
        }
      ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 底部切换
    switchTab(e){
      console.log("111111",e)
      let key = Number(e.currentTarget.dataset.index);
      let tabList = this.data.tabList;
      let selected = this.data.selected;
      console.log("kay:",key,"tabList:",tabList,"selected:",this.data.selected)

      if (selected != key){
        console.log("if selected != key")
        this.setData({
          selected:key
        });
        console.log("selected1:",this.data.selected);
        wx.switchTab({
          url: `/${tabList[this.data.selected].pagePath}`,
        })
        console.log("kay:", key, "tabList:", tabList, "selected:", this.data.selected)
      }
      console.log("kay:", key, "tabList:", tabList, "selected:", this.data.selected)
    }
  }
})
