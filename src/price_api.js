import fetch from 'node-fetch';
import { RestClientV5 } from 'bybit-api';
import {jupiterRpc, tokens} from '../config.js';
const client = new RestClientV5();


const addresses =  function(){
    const ids = [];
    tokens.forEach(token=>{
        ids.push(token.address);
    })
    return ids.join();
}()
// const addresses = getAddresses()

/**/
export async function priceOfDex(){

    try {
        const url = jupiterRpc + '/price/v2?showExtraInfo=true&ids=' + addresses;
        console.log(url)
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const obj = await response.json();


        return obj.data.Grass7B4RdKfBCjTKgSqnXkqjwiGvQyFbuSCUJr3XXjs;

    }catch (err) {
        console.log(err);
        throw err;
    }
}


/*
* {
    "retCode": 0,
    "retMsg": "OK",
    "result": {
        "category": "inverse",
        "list": [
            {
                "symbol": "BTCUSD",
                "lastPrice": "16597.00",
                "indexPrice": "16598.54",
                "markPrice": "16596.00",
                "prevPrice24h": "16464.50",
                "price24hPcnt": "0.008047",
                "highPrice24h": "30912.50",
                "lowPrice24h": "15700.00",
                "prevPrice1h": "16595.50",
                "openInterest": "373504107",
                "openInterestValue": "22505.67",
                "turnover24h": "2352.94950046",
                "volume24h": "49337318",
                "fundingRate": "-0.001034",
                "nextFundingTime": "1672387200000",
                "predictedDeliveryPrice": "",
                "basisRate": "",
                "deliveryFeeRate": "",
                "deliveryTime": "0",
                "ask1Size": "1",
                "bid1Price": "16596.00",
                "ask1Price": "16597.50",
                "bid1Size": "1",
                "basis": ""
            }
        ]
    },
    "retExtInfo": {},
    "time": 1672376496682
}*/
export async function priceOfByBit() {

    return client
        .getTickers({
            category: 'spot',
        })
}
