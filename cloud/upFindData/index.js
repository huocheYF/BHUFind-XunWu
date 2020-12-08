// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "find-ghuzm"
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  // return event
  let { wuPinId, postDate, postOpenid, postPhoneNum, postavatarUrl, postnickName } =  event
  // return{
  //   wuPinId, postDate, postOpenid, postPhoneNum, postavatarUrl, postnickName
  // }
  try {
    return await db.collection('wuPin').doc(wuPinId)
    .update({
        data: {
          findData: {
            findTrue: true,
            postDate: postDate,
            postOpenid: postOpenid,
            postPhoneNum: postPhoneNum,
            postavatarUrl: postavatarUrl,
            postnickName: postnickName
          },
        },
      })
  } catch (e) {
    console.error(e)
  }
}