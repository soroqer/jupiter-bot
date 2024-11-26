const navButtons = document.querySelectorAll('.button-left, .button-right');
navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const baseUrl = button.getAttribute('data-url'); // 基础 URL
        const symbol = button.getAttribute('data-symbol'); // 获取需要传递的参数
        const params = new URLSearchParams({ symbol }); // 构造查询参数
        const targetUrl = `${baseUrl}?${params.toString()}`; // 拼接完整 URL
        window.location.href = targetUrl; // 跳转x
    });
});
