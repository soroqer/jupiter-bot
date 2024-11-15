const EventEmitter = require('events');
const {priceOfDex, priceOfByBit} = require("./price_api");

module.exports = class PriceEmitter extends EventEmitter {

    dexData = []
    byBitData = []

    // 发布消息
    publish(message) {
        // console.log(`发布消息:`, message);
        // 触发事件，所有订阅该事件的订阅者将会收到消息
        this.emit('message', message);
    }

    async start() {
        setInterval(() => {
            this.emitDexPrice()
            this.emitByBitPrice()
        }, 1000); // 每秒推送一次数据
    }


    emitDexPrice() {
        priceOfDex().then(response => {
            const lastSwap = response.extraInfo.lastSwappedPrice
            let price,time = 0;
            if (lastSwap.lastJupiterSellAt > lastSwap.lastJupiterBuyAt) {
                price = lastSwap.lastJupiterSellPrice;
                time = lastSwap.lastJupiterSellAt * 1000;
            } else {
                price = lastSwap.lastJupiterBuyPrice;
                time = lastSwap.lastJupiterBuyAt * 1000;
            }

            if (this.dexData.length === 0 || time > this.dexData[this.dexData.length - 1].point.x){
                const data = {
                    source : 1,
                    point: {
                        x:time,
                        y:price
                    }
                };
                this.dexData.push(data);
                this.publish(data)

                if (this.dexData.length > 10) {
                    this.dexData.shift()
                }
            }

        }).catch(err => {
                // console.error('dex price', err);
            }
        )
    }

    emitByBitPrice() {
        priceOfByBit().then(response => {
            const data = {
                source : 2,
                point: {
                    x:response.time,
                    y:response.result.list[0].lastPrice,
                }
            };
            this.byBitData.push(data);
            this.publish(data);
            if (this.byBitData.length > 10) {
                this.byBitData.shift();
            }
        }).catch(err => {
            // console.error(err);
        })
    }
}
