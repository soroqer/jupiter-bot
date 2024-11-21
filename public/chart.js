const canvas = document.getElementById('scatterChart');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

const ctx = canvas.getContext('2d');
const scatterChart = new Chart(ctx, {
    type: 'scatter', // 设置图表类型为散点图
    data: {
        datasets: [{
            label: '正向',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 1)'
        },{
            label: '反向',
            data: [],
            backgroundColor: 'rgba(175, 92, 72, 1)'
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time', // 设置 X 轴为时间轴
                time: {
                    unit: 'minute', // 显示单位
                    setpSize:1,
                    tooltipFormat: 'HH:mm', // tooltip 显示的日期格式
                    displayFormats: {
                        minute: 'HH:mm:ss' // X 轴标签显示格式
                    }
                },
                title: {
                    display: true,
                    text: 'Time'
                },
                ticks:{
                    autoSkip:true,
                    maxTicksLimit:10
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'bps'
                }
            }
        }
    }
});
// 当前选中的 symbol
const queryParams = new URLSearchParams(window.location.search);
const currentSymbol = queryParams.get('symbol'); // 获取 "symbol" 参数

// WebSocket 连接
const url = window.location.hostname === 'localhost'
    ? 'ws://localhost:9665' // 本地调试
    : 'ws://54.65.224.180:9665';
let ws = new WebSocket(url);
ws.onopen = () => {
    console.log('WebSocket Connected');
    const message = {
        symbol: currentSymbol
    };
    ws.send(JSON.stringify(message));
};
ws.onmessage = (event) => {
    console.log(event)
    const msg = JSON.parse(event.data);
    scatterChart.data.datasets[0].data.push(msg[0]); // 添加新点
    if (scatterChart.data.datasets[0].data.length > 700) {
        scatterChart.data.datasets[0].data.shift();
    }
    scatterChart.data.datasets[1].data.push(msg[1]); // 添加新点
    if (scatterChart.data.datasets[1].data.length > 700) {
        scatterChart.data.datasets[1].data.shift();
    }
    scatterChart.update(); // 更新图表
};

// let reconnectInterval = null;
ws.onclose = () => {
    console.log('WebSocket 连接已关闭，尝试重连...');
    // reconnectInterval = setInterval(() => {
    //     console.log('尝试重连...');
    //     const newWs = new WebSocket(url);
    //     newWs.onopen = () => {
    //         clearInterval(reconnectInterval);
    //         console.log('WebSocket 重连成功');
    //     };
    //     newWs.onmessage = ws.onmessage; // 复用旧的消息处理逻辑
    //     ws = newWs;
    // }, 5000); // 每隔 5 秒尝试重连
};
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};



// 获取所有按钮
const buttons = document.querySelectorAll('.toggle-button');



// 遍历每个按钮并添加点击事件监听器
buttons.forEach((button) => {
    const symbol = button.dataset.symbol; // 获取按钮的 data-symbol 值
    if (symbol === currentSymbol) {
        button.disabled = true; // 禁用匹配的按钮
        button.classList.add('active'); // 可选：给禁用的按钮加高亮样式
    } else {
        button.disabled = false; // 确保其他按钮可用
        button.classList.remove('active'); // 移除高亮样式
    }

    // 绑定点击事件（仅对未禁用的按钮有效）
    button.addEventListener('click', () => {
        if (!button.disabled) {
            const targetUrl = button.dataset.url;
            const targetSymbol = button.dataset.symbol;
            if (targetUrl) {
                // 跳转页面并传递符号参数
                window.open(`${targetUrl}?symbol=${targetSymbol}`, '_blank');
            }
        }
    });
});

// 初始化按钮状态
document.querySelector(`[data-symbol="${currentSymbol}"]`).classList.add('disabled');
