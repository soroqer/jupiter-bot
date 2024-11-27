// server.js
import express from 'express';
import {WebSocketServer} from 'ws';
import { createServer } from 'http';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
import {PriceEmitter} from "./src/price_emitter.js";
import {connect} from "./src/sql.js";


connect()
app.get('/points', (req, res) => {
    res.json({ status: 'WebSocket server running', time: new Date() });
})
app.use(express.static('public')); // 将静态文件目录设为 'public'

// 创建消息中心实例
const priceEmitter = new PriceEmitter();
priceEmitter.start()


// WebSocket 连接处理
wss.on('connection', (ws) => {
    console.log('客户端已连接');

    function subscriber(message) {
        ws.send(JSON.stringify(message));
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('订阅：', data.symbol);
        priceEmitter.on(data.symbol, subscriber)
    })

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
