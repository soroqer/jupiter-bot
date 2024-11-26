import EventEmitter from 'events';
import './price_api.js'
import fetch from "node-fetch";
import { RestClientV5 } from 'bybit-api';
import {bitGetRpc, jupiterRpc, tokens} from '../config.js';
const client = new RestClientV5();
export class PriceEmitter extends EventEmitter {
    jupiter = {};
    byBit = {};
    bitGet = {};

    constructor() {
        super();
        this.addresses = [];
        tokens.forEach(token=>{
            this.addresses.push(token.address);
        })
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
            tokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                if (this.jupiter[token.name] === undefined
                    || this.jupiter[token.name].buyAt > quoted.buyAt
                    || this.jupiter[token.name].sellAt > quoted.sellAt) {

                    this.jupiter[token.name] = quoted;
                    this.updateBitGetAndPublish(token.name)
                    this.updateByBitAndPublish(token.name)
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
                tokens.forEach(token=>{
                    if (symbol === token.name) {
                        this.byBit[token.name] = item;
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
            response.result.list.forEach(item=>{
                const symbol = item.symbol.slice(0, -4)
                tokens.forEach(token=>{
                    if (symbol === token.name) {
                        this.byBit[token.name] = item;
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

        const now = Date.now();
        let y1 = this.byBit[symbol].bid1Price - this.jupiter[symbol].buyPrice;
        y1 = y1 / this.jupiter[symbol].buyPrice * 10000;

        let y2 = this.jupiter[symbol].sellPrice - this.byBit[symbol].ask1Price;
        y2 = y2 / this.byBit[symbol].ask1Price * 10000;
        const data = [{
            x:now,
            y:y1,
        },{
            x:now,
            y:y2,
        }];
        this.emit('ByBit-' + symbol, data)
    }

    // 检查计算并发布消息
    updateBitGetAndPublish(symbol) {

        if (this.jupiter[symbol] === undefined || this.bitGet[symbol] === undefined) {
            return;
        }

        const now = Date.now();
        let y1 = this.bitGet[symbol].bidPr - this.jupiter[symbol].buyPrice;
        y1 = y1 / this.jupiter[symbol].buyPrice * 10000;

        let y2 = this.jupiter[symbol].sellPrice - this.bitGet[symbol].askPr;
        y2 = y2 / this.bitGet[symbol].askPr * 10000;
        const data = [{
            x:now,
            y:y1,
        },{
            x:now,
            y:y2,
        }];
        this.emit('BitGet-' + symbol, data)
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
            console.log('bitGet -----》 成功')
            if (!response.ok) {
                console.log(response.status)
            }
            const obj = await response.json();
            return obj.data;

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
