---
title: "MAC微信双开极简攻略（免费，0基础小白级教程）"
description: "很多人 Mac 上都有微信双开的需求，一个工作号，一个生活号，来回扫码切换非常麻烦；但苦于 Mac 原生生态封闭，没有办法直接双开微信，那今天就分享一个非常简单粗暴的方法，1 分钟教会你在mac上面双开微信。 这个方法不是破解微信 ，只是在本机复制一个应用副本。后续微信更新后，双开版可能需要重新处理一次； 命令里会用到 sudo ，需要输入你的 Mac 开机密码。 简单粗暴直接说方法： 第一步，打开访达（finder）进入“应用程序”…"
pubDate: 2026-06-15
keywords: ["AI干货家老明", "微信公众号同步"]
heroImage: "/images/blog/mac-wechat-dual-open-guide-wechat-01.png"
---

> **原文首发**：[微信公众号](https://mp.weixin.qq.com/s/n-2eMvov7UuaZdL6mlmo4g)
很多人 Mac 上都有微信双开的需求，一个工作号，一个生活号，来回扫码切换非常麻烦；但苦于 Mac 原生生态封闭，没有办法直接双开微信，那今天就分享一个非常简单粗暴的方法，1 分钟教会你在mac上面双开微信。

这个方法不是破解微信，只是在本机复制一个应用副本。后续微信更新后，双开版可能需要重新处理一次；命令里会用到 `sudo`，需要输入你的 Mac 开机密码。

简单粗暴直接说方法：

第一步，打开访达（finder）进入“应用程序”。

![](/images/blog/mac-wechat-dual-open-guide-wechat-01.png)![](/images/blog/mac-wechat-dual-open-guide-wechat-02.png)

  


找到原来的微信，一般叫 `WeChat.app` 或者显示为“微信”。

![](/images/blog/mac-wechat-dual-open-guide-wechat-03.png)右键复制一份，然后把复制出来的新应用改名为：
    
    
    WeChat2.app（注意大小写！）  
    

![](/images/blog/mac-wechat-dual-open-guide-wechat-04.png)
    
    
      
    

接下来，同时按住command和空格键，在搜索框里输入“终端”或者“terminal”，按下回车↩︎（return），打开终端（terminal）。

![](/images/blog/mac-wechat-dual-open-guide-wechat-05.png)

在终端里运行下面这条命令：

sudo /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.tencent.xinWeChat2" /Applications/WeChat2.app/Contents/Info.plist
    
    
    复制粘贴后，按回车，然后输入你的 mac 开机密码，输入完成后，再按回车。

（作用：给复制出来的微信改一个新的应用 ID，避免它和原版微信冲突）

然后继续运行下面这条命令，给这个新复制出来的微信重新签名：

sudo codesign --force --deep --sign - /Applications/WeChat2.app

到这里基本就完成了。现在你的“应用程序”里会有两个微信：
    
    
    WeChat.app    原版微信  
    WeChat2.app   双开微信  
    

直接双击 `WeChat2.app`，就可以打开第二个微信。原版微信和双开版微信可以同时登录，适合一个生活号、一个工作号分开使用。

如果第一次打开时提示无法打开，或者系统拦截，可以去“系统设置 - 隐私与安全性”里允许打开；如果还是不行，可以再终端执行一次下面这条命令清除隔离属性：
    
    
    sudo xattr -rd com.apple.quarantine /Applications/WeChat2.app  
    
    
    
      
    

整体来说，这个方法优点是简单、免费、不需要装乱七八糟的第三方工具；缺点是微信版本更新后，复制版可能会失效，需要重新复制和签名一次。
