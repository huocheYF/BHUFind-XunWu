// 云函数入口文件
const cloud = require('wx-server-sdk')
const db = cloud.database()
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  try {
    return await db.collection("users").add({
      data: {
        nickName: event.nickName,
        gender: event.gender,
        avatarUrl: event.avatarUrl,
        openid:event.openid 
      }
    })
  } catch (e) {
    console.log(e);
  }

}