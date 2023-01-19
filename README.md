## okteto上部署trojan
> 官网 https://www.okteto.com/ 。听介绍说免费版24小时不活动就sleep，不知道是24小时内无请求进来就休眠还是没在平台网页上操作就休眠，所以我既做了主页轮询请求保活，也做了登陆session保活。

### 操作
1. 下载okteto客户端工具并添加至环境变量，命令行中登陆，弹开的网页中进行身份验证及授权。
2. git clone 本项目到本地并进入该文件夹，输入`okteto deploy --build`并回车，即可推送代码至okteto云端仓库。
3. `hello-world/config.json`为xray配置文件，可自行修改。
4. 默认trojan协议，ws路径:/api，密码：123

### 保活
1. 主页请求及xray进程保活，许修改`hello-world/index.js`第84行为自己的url。
2. 登陆session保活，需自行抓包，替换代码中的Cookie及其他相关请求头字段，希望这部分是多余的。
