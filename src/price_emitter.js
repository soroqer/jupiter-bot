import EventEmitter from 'events';
import fetch from "node-fetch";
import { RestClientV5 } from 'bybit-api';
import {bitGetRpc, jupiterRpc, bitGetTokens, byBitTokens} from '../config.js';
const client = new RestClientV5();
export class PriceEmitter extends EventEmitter {
    jupiter = {};
    byBit = {};
    bitGet = {};

    constructor() {
        super();
        this.addresses = [];
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

            console.log('refreshJupiter success');
            bitGetTokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                if (this.jupiter[token.name] === undefined
                    || this.jupiter[token.name].buyAt > quoted.buyAt
                    || this.jupiter[token.name].sellAt > quoted.sellAt) {

                    this.jupiter[token.name] = quoted;
                    this.updateBitGetAndPublish(token.name)
                }
            })
            byBitTokens.forEach(token=>{
                const quoted = response[token.address].extraInfo.quotedPrice
                if (this.jupiter[token.name] === undefined
                    || this.jupiter[token.name].buyAt > quoted.buyAt
                    || this.jupiter[token.name].sellAt > quoted.sellAt) {

                    this.jupiter[token.name] = quoted;
                    this.updateByBitAndPublish(token.name)
                }
            })
        }).catch(err=>{
            // console.log(err);
        });
    }


    refreshByBit() {
        this.priceOfByBit().then(response => {
            console.log('refreshByBit success');
            response.result.list.forEach(item=>{
                const symbol = item.symbol.slice(0, -4)
                byBitTokens.forEach(token=>{
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
            console.log('refreshBitGet success');
            response.result.list.forEach(item=>{
                const symbol = item.symbol.slice(0, -4)
                bitGetTokens.forEach(token=>{
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
        console.log('ByBit-' + symbol, data)
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
        console.log('BitGet-' + symbol, data)
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
