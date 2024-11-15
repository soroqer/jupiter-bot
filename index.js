// const http = require('http');
// const {listener} = require("./src/service");
const {priceOfDex, priceOfByBit} = require("./src/price_api");
const res = require("express/lib/response");


// http.createServer(listener).listen(8000)

priceOfDex()
    .then(res => {
        console.log('then',res.extraInfo.lastSwappedPrice)
    })
    .catch(err => {
        console.log('err',err)
    });

// priceOfByBit().then(res => {
//
//     console.log('then',res)
// }).catch(err => {
//     console.log(err);
// });
// console.log('======');
// // priceOfByBit()
