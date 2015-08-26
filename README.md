推荐使用[tiny-asset-pipeline](https://github.com/dongyuwei/tiny-asset-pipeline) 代替ria-packager。tiny-asset-pipeline的逻辑更简单，代码经过多次重构也简化了许多。

#ria-packager是什么？
一个前端模块化开发集成环境（工具集）: 支持按小模块开发js，less(css)，mustache(html模板)。内建文件合并及压缩工具可用于构建、发布静态资源。
##############################################
 1. 合并js文件：`require('a/b/c.js');` 
 2. 合并css文件：`@import url("a/b/c.css");` 重新计算背景图片相对地址. 剔除重复@import (目前策略是保留第一个css；以前是保留最后一个)
 3. 合并less文件：`@import-once "less/base/zindex.less";` 
 4. 合并mustache模板： 发布时预先把子模板合并到page主模板内。开发时自动加载_test/目录下的测试.json数据来渲染模板。
 5. 计算文件md5值，用于缓存版本号。
    1. 替换背景图片地址 `background-image: url(../../img/sprite_md5hash.png);` 这种方式有利于增量发布及A/B test。
    2. 生成js，css 文件内容md5映射(`md5_mapping.json`)，可用于更新或者回滚版本号。
 6. 注意： require .js（及.json）是从工程根目录开始计算路径; import .css及.less时按照文件相对路径计算。css和less中图片的引用也使用相对路径来计算。

#通过npm安装:
 1.  安装老的稳定版，用于支持mobile等老模块化工程:  `npm install ria-packager@1.5.0` 
 2.  安装最新版，支持less集成及新工程目录结构: `npm install ria-packager` 
 3.  如果是安装到 **全局**，即使用`-g`选项： `sudo npm install -g ria-packager`，则可以使用 **ria-packager** 这个系统命令：
   1.  **package project** : `ria-packager -from fromDir -to toDir [-verbose or -v] [-noRewriteFileName]`
   2.  **start    server** : `ria-packager -start [ -root /tmp ] [ -port 80 ]`
      1. -root为可选参数，默认documentRoot为启动该程序的当前目录。
      2. 和-port为可选参数，默认监听8888端口。
   3.  **stop     server** : `ria-packager -stop`

#构建静态资源（合并，压缩js，css）:
 `node index.js -from ~/workspace/litb_ria/mobile/trunk/   -to /tmp/mobile/ -v `
 1. -from 参数 指明要打包的工程根目录
 2. -to 参数 指明输出目录（可以是任意临时目录）

#在线打包部署（方便不习惯命令行的用户，目前只支持linux系统）
 1. 访问 `工程名称/deploy` 路径，如`mobile/deploy` 可在线打包mobile工程为`mobile.zip`可供下载

 
#辅助开发服务器（用于开发测试，联调）
1. cd 目标目录, 如`cd /data/ria/` 该目标目录`/data/ria/`即设置服务器为 **documentRoot** . 默认端口为 **8888**.
2. 启动服务器: `ria-packager -start` or `node lib/server/httpd.js`
3. 浏览器访问 /admin/debug 即可设置服务器环境为开发模式，此时按需动态合并js，css，但不压缩不混淆代码。
4. 浏览器访问 /admin/release 即可设置服务器环境为生产发布模式，此时按需动态合并，压缩（混淆）js，css。
5. 支持按照 [nginx-http-concat](https://github.com/taobao/nginx-http-concat) 的规范来动态合并静态资源，合并后的资源可使用独立版本号控制缓存。如：
  1. `http://127.0.0.1:8888/mobile/??i18n/js/en.js,page/checkout_address_process/checkout_address_process.js`
  2. `http://127.0.0.1:8888/mobile/??page/checkout_address_process/checkout_address_process.css,theme/blue/skin.css?v=99129a3f2430cb5a`

##模板测试数据及自定义模板容器：##
1. 渲染widget和pagelet时，会在模板文件父目录下查找_test/_layout.html，如果存在该模板，就使用它作为wiget的父模板。
2. 模板文件父目录下 _test/下所有.json文件会自动显示在模板数据select中，供切换以测试不同数据渲染效果。
3. 模板文件父目录下 _test/下与模板文件同名的.json文件为默认渲染模板所使用的数据文件。
4. .json文件中可以使用`require('a/b/c.json')`形式嵌套加载子.json文件。如 `"attachments" : require("widget/reviews/attachments/_test/main.json")`

##模块化联调接口说明
php开发人员可以远程加载前端开发机上的mustache模板，url中附加 raw=true 参数时只显示原始内容。例如：
http://fe.tbox.me:8888/lightsource/pagelet/most_helpful_reviews/main.html?raw=true
*.html 请求中可以附加以下几种特殊参数：
 1. raw=true 递归加载显示mustache原始内容
 2. dev=true 只显示当前widget原始内容（无子模板的递归加载），同时会加上必要的头和尾，用以引入该模块需要的js和css。
 3. iframe=true   前端团队写模块文档时可能要使用iframe引入test case页面，为了避免iframe显示底部的切换语言，皮肤，数据这个区块，可以在url中附加参数 iframe=true
