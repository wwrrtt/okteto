const express = require("express");
const app = express();
const port = 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("hello wolrd");
});

//获取系统进程表
app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>命令行执行结果：\n" + stdout + "</pre>");
    }
  });
});

//启动web
app.get("/start", (req, res) => {
  let cmdStr =
    "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "启动成功!");
    }
  });
});

//获取系统版本、内存信息
app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//文件系统只读测试
app.get("/test", (req, res) => {
  fs.writeFile("./test.txt", "这里是新创建的文件内容!", function (err) {
    if (err) res.send("创建文件失败，文件系统权限为只读：" + err);
    else res.send("创建文件成功，文件系统权限为非只读：");
  });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
    pathRewrite: {
      // 请求中去除/api
      "^/api": "/qwe",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
  })
);

/* keepalive  begin */
function keepalive() {
  // 1.请求主页，保持唤醒
  let okteto_app_url =
    "https://node-getting-started-with-compose-hrzyang.cloud.okteto.net";
  request(okteto_app_url, function (error, response, body) {
    if (!error) {
      console.log("保活-主页发包成功！");
      console.log("保活-响应报文:", body);
    } else console.log("保活-请求错误: " + error);
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  request(okteto_app_url + "/status", function (error, response, body) {
    if (!error) {
      if (body.indexOf("./web.js -c ./config.json") != -1) {
        console.log("保活-web正在运行");
      } else {
        console.log("保活-web未运行,发请求调起");
        request(okteto_app_url + "/start", function (err, resp, body) {
          if (!err) console.log("保活-调起web成功:" + body);
          else console.log("保活-请求调起web错误:" + err);
        });
      }
    } else console.log("保活-请求进程表出现错误: " + error);
  });

  // 3.登陆session保活，这可能是多余的。请根据自己抓包填写cookie及相关请求头
  var headers = {
    Host: "cloud.okteto.com",
    Cookie:
      "_lr_uf_-okteto-waxir=66f1c75d-b015-4b06-b9bd-649d1c7d772a; private-endpoint=MTY3NDEyNjY3MHxXdW0zQmxERXNJcFRKMlVBaWtpM29fd2JwbGdHcjU5LUhzOTFBMjVMN1NuTmhfYU9lX0NMOXJhVGZWNGtlWHpTS2IzdGVWZkg0QnRESTVMTVlTZXQ3cjBxUm1ZTnRDWnRWN2EwaEE2alRHVy1VQlhLUDRNYzNGOG9jUjBNUnFXWjNSODRoLXhEVEZqT1NuU213ODh5b2JwaWdUUWxodFAzVmRwSUVKTXBIeTQ9fK-v-cUSa9NmKdd88WPkwzPG_Vcxppt9hFxz3b9nOdfZ; mp_92fe782cdffa212d8f03861fbf1ea301_mixpanel=%7B%22distinct_id%22%3A%20%22185c8eb91501ca-0e4ae1989bb43e-26021051-c0000-185c8eb915112b%22%2C%22%24device_id%22%3A%20%22185c8eb91501ca-0e4ae1989bb43e-26021051-c0000-185c8eb915112b%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fgist.github.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22gist.github.com%22%2C%22__alias%22%3A%20%2298a487e8-3087-4066-b909-9c4a8fde182e%22%2C%22%24user_id%22%3A%20%2298a487e8-3087-4066-b909-9c4a8fde182e%22%7D; _lr_hb_-okteto-waxir%2Fokteto-cloud={%22heartbeat%22:1674127992754}; _lr_tabs_-okteto-waxir%2Fokteto-cloud={%22sessionID%22:0%2C%22recordingID%22:%225-29b5f578-3486-4ddc-8269-83b6d4b4b083%22%2C%22lastActivity%22:1674128093344}",
    "sec-ch-ua":
      '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
    "content-type": "application/json",
    "sec-ch-ua-mobile": "?0",
    authorization: "Bearer 7sYFiViLTesOb5ImspB4yxE1yM8pmDHOjpn4yBRa",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "sec-ch-ua-platform": '"Windows"',
    accept: "*/*",
    origin: "https://cloud.okteto.com",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://cloud.okteto.com/",
    "accept-language": "zh-CN,zh;q=0.9",
  };

  var dataString =
    '{"query":"query getSpace($spaceId: String!) {\\n  space(id: $spaceId) {\\n    id\\n    status\\n    quotas {\\n      ...QuotasFields\\n    }\\n    members {\\n      ...MemberFields\\n    }\\n    apps {\\n      ...AppFields\\n    }\\n    stacks {\\n      ...StackFields\\n    }\\n    gitDeploys {\\n      ...GitDeployFields\\n    }\\n    devs {\\n      ...DevFields\\n    }\\n    deployments {\\n      ...DeploymentFields\\n    }\\n    pods {\\n      ...PodFields\\n    }\\n    functions {\\n      ...FunctionFields\\n    }\\n    statefulsets {\\n      ...StatefulsetFields\\n    }\\n    jobs {\\n      ...JobFields\\n    }\\n    cronjobs {\\n      ...CronjobFields\\n    }\\n    volumes {\\n      ...VolumeFields\\n    }\\n    externals {\\n      ...ExternalResourceFields\\n    }\\n    scope\\n    persistent\\n  }\\n}\\n\\nfragment QuotasFields on Quotas {\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  pods {\\n    ...QuotaFields\\n  }\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment QuotaFields on Resource {\\n  limits\\n  limitsTotal\\n  requests\\n  requestsTotal\\n  total\\n  used\\n}\\n\\nfragment MemberFields on Member {\\n  id\\n  avatar\\n  email\\n  externalID\\n  name\\n  owner\\n}\\n\\nfragment AppFields on App {\\n  id\\n  name\\n  version\\n  chart\\n  icon\\n  description\\n  repo\\n  config\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment StackFields on Stack {\\n  id\\n  name\\n  yaml\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment GitDeployFields on GitDeploy {\\n  id\\n  name\\n  icon\\n  yaml\\n  repository\\n  repoFullName\\n  branch\\n  status\\n  actionName\\n  variables {\\n    name\\n    value\\n  }\\n  github {\\n    installationId\\n  }\\n  gitCatalogItem {\\n    id\\n    name\\n  }\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment DevFields on Dev {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  divert\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment EndpointFields on Endpoint {\\n  url\\n  private\\n  divert\\n}\\n\\nfragment DeploymentFields on Deployment {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  repository\\n  path\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment PodFields on Pod {\\n  id\\n  name\\n  yaml\\n  createdAt\\n  updatedAt\\n  error\\n  status\\n  deployedBy\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment FunctionFields on Function {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment StatefulsetFields on StatefulSet {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  devmode\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment JobFields on Job {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment CronjobFields on CronJob {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment VolumeFields on Volume {\\n  id\\n  name\\n  createdByDevmode\\n  deployedBy\\n  yaml\\n  status\\n  createdAt\\n  updatedAt\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment ExternalResourceFields on ExternalResource {\\n  id\\n  name\\n  createdAt\\n  updatedAt\\n  deployedBy\\n  endpoints {\\n    url\\n  }\\n  notes {\\n    path\\n    markdown\\n  }\\n}","variables":{"spaceId":"hrzyang"},"operationName":"getSpace"}';

  var options = {
    url: "https://cloud.okteto.com/graphql",
    method: "POST",
    headers: headers,
    body: dataString,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let externalID = "hrzyang"; //这里也可以换成自己的邮箱
      if (body.indexOf(externalID) != -1)
        console.log("externalID为hrzyang的用户session保活成功");
      else console.log("登陆session失效,保活失败");
    } else console.log("登陆session保活-发请求出错:" + error);
  });
}

// 9秒执行一次上述请求
setInterval(keepalive, 9 * 1000);
/* keepalive  end */

/* init  begin */

// 1.启动web.js
let startCMD =
  "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
exec(startCMD, function (err, stdout, stderr) {
  if (err) {
    console.log("初始化-启动web.js-失败:" + err);
  } else {
    console.log("初始化-启动web.js成功!");
  }
});

// 2. 安装ps命令
let cmdStr = "apt-get update && apt-get -y install procps";
exec(cmdStr, function (err, stdout, stderr) {
  if (err) console.log("初始化-安装ps命令包procps失败:" + err);
  else console.log("初始化-安装ps命令包procps成功!");
});

/* init  end */
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
