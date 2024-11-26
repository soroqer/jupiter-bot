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
            backgroundColor: 'rgba(175, 152, 72, 1)'
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time', // 设置 X 轴为时间轴
                time: {
                    unit: 'minute', // 显示单位
                    stepSize:1,
                    tooltipFormat: 'HH:mm', // tooltip 显示的日期格式
                    displayFormats: {
                        minute: 'HH:mm:ss' // X 轴标签显示格式
                    }
                },
                title: {
                    display: true,
                    text: 'time'
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
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x', // 允许水平拖动
                    onPanComplete: handlePanComplete // 平移完成时的回调
                },
                zoom: {
                    wheel: {
                        enabled: true // 启用鼠标滚轮缩放
                    },
                    drag: {
                        enabled: true, // 启用拖动缩放
                        modifierKey: 'shift' // 按住 Shift 键启用拖动缩放
                    },
                    pinch: {
                        enabled: true // 启用多指缩放（触屏）
                    },
                    mode: 'x', // 仅在 X 轴方向缩放
                }
            }
        }
    }
});
// 当前选中的 symbol
const queryParams = new URLSearchParams(window.location.search);
const currentSymbol = queryParams.get('symbol'); // 获取 "symbol" 参数

// 初始化按钮状态
document.querySelector(`[data-symbol="${currentSymbol}"]`).classList.add('disabled');

// 设置 title
document.title = "散点图-" + currentSymbol;

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
const buttons = document.querySelectorAll('.button-left, .button-right');



// 遍历每个按钮并添加点击事件监听器
buttons.forEach((button) => {
    const symbol = button.dataset.symbol; // 获取按钮的 data-symbol 值
    button.hidden = symbol === currentSymbol;

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



function handlePanComplete({ chart }) {
    const xScale = chart.scales.x;
    const minTime = xScale.min; // 当前可视区域的最小时间

    // 如果已到最左侧的边缘
    if (xScale.min <= chart.data.datasets[0].data[0]?.x) {
        console.log(' TMD划过来啦')
        // loadMoreData(minTime).then(newData => {
        //     // 假设 `newData` 是从服务器加载的历史数据
        //     chart.data.datasets.forEach((dataset, index) => {
        //         dataset.data = [...newData[index], ...dataset.data];
        //     });
        //
        //     // 更新图表
        //     chart.update();
        // });
    }
}
