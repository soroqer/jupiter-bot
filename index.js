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

// import {jupiterRpc} from "./config.js";
// async function sd(){
//     setInterval(() => {
//         const url = jupiterRpc + '/price/v2?showExtraInfo=true&ids=Grass7B4RdKfBCjTKgSqnXkqjwiGvQyFbuSCUJr3XXjs';
//         const response = await fetch(url);
//         if (!response.ok) {
//             console.log(response.status)
//         }
//         const obj = await response.json();
//         return obj.data;
//     }, 1000); //
// }


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
