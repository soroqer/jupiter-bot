// const {priceOfDex, priceOfByBit} = require("./src/price_api");
//
//
//
// priceOfDex()
//     .then(res => {
//         console.log('then',res.extraInfo.lastSwappedPrice)
//     })
//     .catch(err => {
//         console.log('err',err)
//     });


import {connect} from './src/sql.js'

connect()
const timestamp_ms = 1669465200000; // 示例毫秒时间戳

// 创建一个 Date 对象
const date = new Date(timestamp_ms);

// 格式化为 SQL 可接受的时间字符串 (YYYY-MM-DD HH:mm:ss)
const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
console.log(formattedDate);
//
// insertPrice({
//     buy:1,
//     sell:2,
//     time:formattedDate,
//     source:1
// })
//
// insertPoint({
//
//     x:1231231231,
//     y:222,
//     symbol: "symbol",
// },1).then(
//     console.log('---')
// )
