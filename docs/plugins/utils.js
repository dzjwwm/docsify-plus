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
// 获取路由
function getRouterSync() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../_sidebar.md', false); // 使用同步请求
    xhr.send(null);

    if (xhr.status === 200) {
        const content = xhr.responseText;
        const lines = content.split('\n');
        const result = {};

        const parseLines = (lines, parent) => {
            let currentParent = parent;
            let currentParentSplit = ""
            // 忽略前两行
            lines.slice(3).forEach(line => {
                const match = line.match(/- \[📃 (.+?)\]\((.+?)\)/);
                const folderMatch = line.match(/- \[📁 (.+?)\]\((.+?)\)/);
                if (match) {
                    const [_, name, url] = match;
                    // console.log("获取到文件：", url);
                    // 判断当前 currentParent 实在url中,如果在就向对应的数组中添加
                    if (url.includes(currentParentSplit)) {
                        result[currentParent].push({
                            name,
                            url,
                        });
                    }
                }
                if (folderMatch) {
                    const [_, name, url] = folderMatch;
                    // console.log("获取到文件夹：", url);
                    // 分割contents/java/README.md路径的README.md，获取contents/java/
                    currentParentSplit = url.split('/').slice(0, -1).join('/');
                    currentParent = url
                    result[currentParent] = [];
                }
            });
            // 将result中的key转换为数组
            const keys = Object.keys(result);
            // 去除后缀 /README.md
            const removeSuffix = (path) => path.replace(/\/README\.md$/, '');

            // 构建目录结构
            const buildDirectoryStructure = (filePaths) => {
                const directoryStructure = {};

                filePaths.forEach((path) => {
                    const directory = removeSuffix(path);
                    const parts = directory.split('/');
                    const parent = parts.slice(0, -1).join('/') + '/README.md';
                    if (!directoryStructure[parent]) {
                        directoryStructure[parent] = [];
                    }

                    directoryStructure[parent].push({ name: parts[parts.length - 1], url: path });
                });

                return directoryStructure;
            };
            const directoryStructure = buildDirectoryStructure(keys);
            // 移除contents/README.md key
            delete directoryStructure['contents/README.md'];
            // 构建目录结构,循环处理directoryStructure，将directoryStructure的key对应的value赋值给result的key对应的value
            Object.keys(directoryStructure).forEach(key => {
                result[key] = directoryStructure[key];
            })
        };
        parseLines(lines, result);
        // 将result存入本地内存，key为router
        localStorage.setItem('router', JSON.stringify(result));
        return result;
    } else {
        throw new Error(`Failed to fetch file: ${xhr.status}`);
    }
}
getRouterSync()