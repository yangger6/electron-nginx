# electron-nginx

> 一个用Electron + Vue2.x 做的nginx本地代理配置的程序, 对nginx的配置增删查改，通过node的child_process(子进程)启动、重启、重载nginx服务，fs模块读写nginx的配置

## 应用特性 

-  **能够快速的配置nginx代理路径**
-  **能够配合前端项目快速切换环境**
-  操作日志
-  错误日志

## 如何使用

在下载和运行这个项目之前，你需要在电脑上安装 [Git](https://git-scm.com) 和 [Node.js](https://nodejs.org/en/download/) (来自 [npm](https://www.npmjs.com/))。在命令行中输入:

``` bash
# 下载仓库
git clone https://github.com/yangger6/electron-nginx.git
# 进入仓库
cd electron-nginx
# 安装依赖, 运行应用
npm install && npm dev
```

根据你的平台打包应用:

``` shell
npm run build:darwin
npm run uild:linux
npm run build:win32
```


---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
