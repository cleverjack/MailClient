#主框架描述
##视图
  + main.html     -- 邮件操作主页面
  + proxy.html    -- 代理配置主页面

##控制器
  + app.js        -- 邮件应用类
  + proxy.js      -- 代理配置类


##数据模型
  + account.json       -- 邮箱帐户配置
  + send.json          -- 发件服务器配置
  + recv.json          -- 收件服务器配置


#核心类及实例方法描述

##app.js -- 主要含 Mail 和 MailApp 两个类

###MailAPP -- 邮件应用类
  + init    		  初始化主程序
  + bindEvents		  邮件应用的事件绑定
  + getMailInstance	  获取邮件类实例
  + wrteMail         写信
  + recvMail         收信(刷新邮箱信息)
  + getInbox         获取收件箱邮件
  + getSendbox       获取发件箱邮件
  + getTrash         获取垃圾箱邮件
  + getDraft         获取草稿箱邮件
  + viewDetail       查看邮件详情

###Mail -- 邮件类， 通过MailApp实例进行管理
  + send 			 发送邮件
  + del              删除邮件/批量删除邮件 , 可指定是否强制删除
  + save             保存邮件（到草稿箱）
  + moveTo           移动邮件
  + list             列出邮件/条件列举 
  + listPage         分页列出邮件/条件分页


##proxy.js -- 主要含 MailServerFSM 、 Configure 类 和 Proxy 类

###MailServerFSM -- 邮件配置的状态机， 用于切换邮件的配置状态
  + addMailServer    新增邮件服务器
  + setupMailServer  配置邮件服务器
  + setupSendServer  配置发送服务器
  + setupRecvServer  配置收件服务器
  + testConnection   测试连接服务器

###Proxy -- 邮件代理配置类， 用于全局控制配置信息
  + init             初始化代理信息
  + getConfig		 获取指定类型的配置信息
  + saveConfigs      保存所有的配置项
  + connect          连接到服务器 

###Configure -- 邮件配置类， 生成配置信息并写入json文件

  + type       配置类型  0: 帐号配置  1: 发件服务器配置  2: 收件服务器配置
  + path       配置文件  account.json / send.json / recv.json
  + data       {key1: value, key2: value}
