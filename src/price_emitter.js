import EventEmitter from 'events';
import './price_api.js'
import fetch from "node-fetch";
import { RestClientV5 } from 'bybit-api';
import {jupiterRpc, tokens} from '../config.js';
const client = new RestClientV5();
export class PriceEmitter extends EventEmitter {
    jupiter = {};
    byBit = {};

    constructor() {
        super();
        this.addresses = [];
        tokens.forEach(token=>{
            this.addresses.push(token.address);
        })
    }

    async start() {
        setInterval(() => {
            this.emitJupiterPrice()
            this.emitByBitPrice()
        }, 1000); // 每秒推送一次数据
    }

    emitJupiterPrice() {
        this.priceOfJupiter().then(response => {
            tokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                if (this.jupiter[token.name] === undefined
                    || this.jupiter[token.name].buyAt > quoted.buyAt
                    || this.jupiter[token.name].sellAt > quoted.sellAt) {

                    this.jupiter[token.name] = quoted;
                    this.updateAndPublish(token.name)
                }
            })
        }).catch(err=>{
            // console.log(err);
        });
    }
    // 查询并发送最新价格
    emitByBitPrice() {
        this.priceOfByBit().then(response => {
            response.result.list.forEach(item=>{
                tokens.forEach(token=>{
                    if (item.symbol === token.name) {
                        this.byBit[token.name] = item;
                        this.updateAndPublish(token.name)
                    }
                })
            })
        }).catch(error => {
            // console.error(error);
        });
    }
/*
两条线：
1.  正向（cex买，dex卖）价差： (bid1-sellquote)/sellquote * 10000  单位是bps
2. 反向 （dex买，cex卖），价差： (buyquote-ask1)/ask1 * 10000 单位是bps
 */


    // 检查计算并发布消息
    updateAndPublish(symbol) {

        if (this.jupiter[symbol] === undefined || this.byBit[symbol] === undefined) {
            return;
        }

        const now = Date.now();
        let y1 = this.byBit[symbol].bid1Price - this.jupiter[symbol].sellPrice;
        y1 = y1 / this.jupiter[symbol].sellPrice * 10000;

        let y2 = this.byBit[symbol].ask1Price - this.jupiter[symbol].buyPrice;
        y2 = y2 / this.jupiter[symbol].buyPrice * 10000;
        const data = [{
            x:now,
            y:y1,
        },{
            x:now,
            y:y2,
        }];
        this.emit(symbol, data)
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



    async priceOfByBit() {

        return client
            .getTickers({
                category: 'spot',
            })
    }
}
