// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "find-ghuzm"
})
const db = cloud.database()
const _ = db.command


// 云函数入口函数
exports.main = async (event, context) => {
  
  let { wuPinId } = event

  try {
    const delWuPin = await db.collection('wuPin').where({ _id : wuPinId }).remove()
    const delComment = await db.collection('comment').where({ wuPin_id: wuPinId }).remove()

    return{
      delWuPin,
      delComment
    }
  } catch (e) {
    console.error(e)
  }

}