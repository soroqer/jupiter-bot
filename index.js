
import fetch from "node-fetch";
// import {queryPoints,connect} from "./src/sql.js";
//
// connect()
// queryPoints('ByBit','GRASS', Date.now(), function(err,result){
//     console.log(result);
// })

// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage

setInterval(() => {
    sss()
}, 1000); // 每秒推送一次数据

async function sss() {
    const quoteResponse = await (
        await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
&amount=100000000\
&slippageBps=50'
        )
    ).json();
    console.log('时间戳:',Date.now().toString(), '输出金额',quoteResponse.outAmount )

}
