// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "find-ghuzm"
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let { wuPinId, repostId } = event
  try {
    return await db.collection('wuPin').doc(wuPinId)
      .update({
        data: {
          toReports: _.push(repostId)
        },
      })
  } catch (e) {
    console.error(e)
  }

}