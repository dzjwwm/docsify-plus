(function () {
    var myPlugin = function (hook, vm) {
        // 当docsify脚本初始化时调用一次
        hook.init(function () {

        });
        // 当docsify实例挂载到DOM上时调用一次
        hook.mounted(function () {
        });
        // 在每次页面加载，新的markdown转换为HTML之前调用
        // 支持异步任务（详见beforeEach文档）
        hook.beforeEach(function (markdown, next) {
            try {
                // Async task(s)...
            } catch (err) {
                // ...
            } finally {
                next(markdown);
            }
        });
        // 在每次页面加载，新的markdown已经转换为HTML之后调用
        // 支持异步任务（详见afterEach文档）
        hook.afterEach(function (html, next) {
            try {
                // Async task(s)...
            } catch (err) {
                // ...
            } finally {
                next(html);
            }
        });
        // 在每次页面加载，新的HTML已经添加到DOM之后调用
        hook.doneEach(function () {
        });
        // 在渲染初始页面之后调用一次
        hook.ready(function () {
        });
    };
    // 将插件添加到docsify的插件数组
    $docsify = $docsify || {};
    $docsify.plugins = [].concat(myPlugin, $docsify.plugins || []);
})();
