import EventEmitter from 'events';
import fetch from "node-fetch";
import {RestClientV5} from 'bybit-api';
import {insertByBitPoint,insertBitGetPoint} from "./sql.js";
import {bitGetRpc, bitGetTokens, byBitTokens, jupiterRpc} from '../config.js';

const client = new RestClientV5();



export class PriceEmitter extends EventEmitter {
    jupiter = {};
    byBit = {};
    bitGet = {};

    constructor() {
        super();
        this.addresses = [];
        this.setMaxListeners(20);
        bitGetTokens.forEach(token=>{
            this.addresses.push(token.address);
        })
        byBitTokens.forEach(token=>{
            if (this.addresses.indexOf(token.address) === -1) {
                this.addresses.push(token.address);
            }
        })

        console.log('Jupiter监听',this.addresses)
    }

    async start() {
        setInterval(() => {
            this.refreshJupiter()
            this.refreshByBit()
            this.refreshBitGet()
        }, 1000); // 每秒推送一次数据
    }

    refreshJupiter() {
        this.priceOfJupiter().then(response => {

            // console.log('refreshJupiter success');
            bitGetTokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                const newTime = Math.max(quoted.buyAt, quoted.sellAt)
                this.jupiter[token.name] = {
                    buyPr:quoted.buyPrice,
                    sellPr:quoted.sellPrice,
                    time:newTime,
                };
            })
            byBitTokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                const newTime = Math.max(quoted.buyAt, quoted.sellAt)

                this.jupiter[token.name] = {
                    buyPr:quoted.buyPrice,
                    sellPr:quoted.sellPrice,
                    time:newTime,
                    // this.updateByBitAndPublish(token.name)
                }
            })
        }).catch(err=>{
            // console.log(err);
        });
    }


    refreshByBit() {
        this.priceOfByBit().then(response => {

            response.result.list.forEach(item=>{
                const symbol = item.symbol.slice(0, -4)
                byBitTokens.forEach(token=>{
                    if (symbol === token.name) {

                        this.byBit[token.name] = {
                            buyPr:item.bid1Price,
                            sellPr:item.ask1Price,
                            time:response.time,
                        };
                        this.updateByBitAndPublish(token.name)
                    }
                })
            })
        }).catch(error => {
            // console.error(error);
        });
    }

    refreshBitGet() {
        this.priceOfBitGet().then(response => {
            // console.log('refreshBitGet success');
            response.data.forEach(item=>{
                const symbol = item.symbol.slice(0, -4)
                bitGetTokens.forEach(token=>{
                    if (symbol === token.name) {

                        this.bitGet[token.name] = {
                            buyPr:item.bidPr,
                            sellPr:item.askPr,
                            time:response.requestTime
                        };
                        this.updateBitGetAndPublish(token.name)
                    }
                })
            })
        }).catch(error => {
            // console.error(error);
        });
    }

    // 检查计算并发布消息
    updateByBitAndPublish(symbol) {
        if (this.jupiter[symbol] === undefined || this.byBit[symbol] === undefined) {
            return;
        }

        let y1 = this.byBit[symbol].buyPr - this.jupiter[symbol].buyPr;
        y1 = y1 / this.jupiter[symbol].buyPr * 10000;

        let y2 = this.jupiter[symbol].sellPr - this.byBit[symbol].sellPr;
        y2 = y2 / this.byBit[symbol].sellPr * 10000;
        const data = {
            x:Date.now(),
            y1:y1,
            y2:y2,
            symbol:symbol,
            cexBuy:this.byBit[symbol].buyPr,
            cexSell:this.byBit[symbol].sellPr,
            cexTime:this.byBit[symbol].time,
            dexBuy:this.jupiter[symbol].buyPr,
            dexSell:this.jupiter[symbol].sellPr,
            dexTime:this.jupiter[symbol].time * 1000,
        }

        // insertByBitPoint(point)
        this.emit('ByBit-' + symbol, data)
        insertByBitPoint(data)
    }

    // 检查计算并发布消息
    updateBitGetAndPublish(symbol) {


        if (this.jupiter[symbol] === undefined || this.bitGet[symbol] === undefined) {
            return;
        }

        const now = Date.now();
        let y1 = this.bitGet[symbol].buyPr - this.jupiter[symbol].buyPr;
        y1 = y1 / this.jupiter[symbol].buyPr * 10000;

        let y2 = this.jupiter[symbol].sellPr - this.bitGet[symbol].sellPr;
        y2 = y2 / this.bitGet[symbol].sellPr * 10000;
        const data = {
            x:Date.now(),
            y1:y1,
            y2:y2,
            symbol:symbol,
            cexBuy:this.bitGet[symbol].buyPr,
            cexSell:this.bitGet[symbol].sellPr,
            cexTime:this.bitGet[symbol].time,
            dexBuy:this.jupiter[symbol].buyPr,
            dexSell:this.jupiter[symbol].sellPr,
            dexTime:this.jupiter[symbol].time * 1000,
        }
        // console.log('BitGet-' + symbol, data)
        this.emit('BitGet-' + symbol, data)
        insertBitGetPoint(data)
    }

    // 查询最新价格
    async priceOfJupiter(){
        try {
            const url = jupiterRpc + '/price/v2?showExtraInfo=true&ids=' + this.addresses;
            const response = await fetch(url);
            if (!response.ok) {
                console.log(response.status)
            }
            const obj = await response.json();
            return obj.data;

        }catch (err) {
            console.log(err);
        }
    }

    async priceOfBitGet() {
        try {
            const url = bitGetRpc + '/api/v2/spot/market/tickers';
            const response = await fetch(url);
            if (!response.ok) {
                console.log(response.status)
            }
            return await response.json();

        }catch (err) {
            console.log('BitGet', err);
        }
    }

    async priceOfByBit() {

        return client
            .getTickers({
                category: 'spot',
            })
    }
}
