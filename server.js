// server.js
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PriceEmitter = require("./src/price_emitter");

app.use(express.static('public')); // 将静态文件目录设为 'public'

// 创建消息中心实例
const priceEmitter = new PriceEmitter();
priceEmitter.start()


// WebSocket 连接处理
wss.on('connection', (ws) => {
    console.log('客户端已连接');

    for (let i = 0; i < priceEmitter.byBitData.length; i++) {
        ws.send(JSON.stringify(priceEmitter.byBitData[i]));
    }
    for (let i = 0; i < priceEmitter.dexData.length; i++) {
        ws.send(JSON.stringify(priceEmitter.dexData[i]));
    }

    function subscriber(message) {
        ws.send(JSON.stringify(message));
    }
    priceEmitter.on('message', subscriber)

    ws.on('close', () => {
        console.log('客户端已断开连接');
        priceEmitter.off('message', subscriber);
    });
});

// 监听端口
const PORT = 9665;
server.listen(PORT,() => {
    console.log(`服务器已启动在 http://localhost:${PORT}`);
});
