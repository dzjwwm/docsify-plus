// 下载 PDF 的函数
function downloadPDF() {
    // 给出message提示
    if (confirm("如果不在笔记开始处，导出的PDF文件可能显示不全，导出消耗时间在2-10秒左右，是否继续？")) {
        // 获取id=main的元素下h1元素的id属性值
        const filename = document.querySelector('#main h1').id
        const element = document.querySelector('#main');
        
        // 确保html2pdf库已加载
        if (typeof html2pdf === 'function') {
            const opt = {
                margin: 10,
                filename: filename + '.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        } else {
            console.error('html2pdf library is not loaded.');
        }
    }
}