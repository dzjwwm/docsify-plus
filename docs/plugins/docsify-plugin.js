
function docsifyPlugin() {
    var myPlugin = function (hook, vm) {
        // 当docsify脚本初始化时调用一次
        hook.init(function () {

        });
        // 在每次页面加载，新的markdown转换为HTML之前调用
        // 支持异步任务（详见beforeEach文档）
        hook.beforeEach(function (mdText) {
            // ------------------------------编辑功能------------------------------
            var url =
                'https://gitee.com/tl31707/docsify-plus/tree/master/docs/' +
                vm.route.file;
            var editHtml = '[📝 编辑内容](' + url + ')\n';
            // ------------------------------目录功能------------------------------
            // 添加路由，读取内存中的本地内存，key为router，并且转为对象
            var router = JSON.parse(localStorage.getItem('router') || '{}');
            console.log("router2:",router);
            // vm.route.file 中文乱码，需要转码
            var file = decodeURIComponent(vm.route.file);
            // 从router中获取当前笔记的子路径
            var subPath = router[file] || '';
            // 再mdText后面加两个空格
            mdText += '\n\n';
            // 判断subPath是否为数组 forEach遍历数组，将每个子路径添加到mdText中，如：[name](/url)
            if (Array.isArray(subPath)) {
                subPath.forEach(function (item) {
                    mdText += '[' + item.name + '](/' + item.url + ')\n\n';
                })
            }

            return (
                mdText +
                '\n----\n' +
                editHtml
            );
        });
        // 在每次页面加载，新的markdown已经转换为HTML之后调用
        // 支持异步任务（详见afterEach文档）
        hook.afterEach(function (html, next) {
            // 过滤一下路径，首页和包含README的页面不显示
            if (vm.route.path !== '/' && !vm.route.path.includes('README')) {
                // 添加下载按钮，获取当前笔记名称，将名称传给downloadPDF
                html += '<button id="downloadPDF" data-tooltip="请先回到笔记开始处再下载，否则下载的文件显示不全">📥 导出PDF</button>';
                // 添加回到顶部
                html += '<button id="backToTop" data-tooltip="回到顶部">🚀</button>';
            }
            next(html);
        });
        // 在每次页面加载，新的HTML已经添加到DOM之后调用
        hook.doneEach(function () {
            // 为下载按钮添加事件监听
            const downloadButton = document.getElementById('downloadPDF');
            if (downloadButton) {
                downloadButton.addEventListener('click', downloadPDF);
            }
            // 为回到顶部按钮添加事件监听
            const backToTopButton = document.getElementById('backToTop');
            if (backToTopButton) {
                backToTopButton.addEventListener('click', function () {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        });
        // 在渲染初始页面之后调用一次
        hook.ready(function () {
            const router = getRouter();
            // 将router存入本地内存，key为router
            localStorage.setItem('router', JSON.stringify(router));
        });
    };
    // 将插件添加到docsify的插件数组
    $docsify = $docsify || {};
    $docsify.plugins = [].concat(myPlugin, $docsify.plugins || []);
}
docsifyPlugin()