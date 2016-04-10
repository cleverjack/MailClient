var http = require('http');
var mailer = require('nodemailer'); // 发送邮件的模块
var URL = require('url');
var Imap = require('imap'); // IMAP协议模块
var POP3Client = require('poplib'); // POP协议模块
var inspect = require('util').inspect;
var fs = require('fs'); // nodejs文件系统模块
var MailParser = require('mailparser').MailParser; // 邮件的解析模块
var querystring = require('querystring'); // 请求接口的解析模块


/* 文件路径 */
var sendConfigJsonFile = './src/config/send.json'; // 发件服务器的配置项
var recvConfigJsonFile = './src/config/recv.json'; // 收件服务器的配置项
var accountConfigJsonFile = './src/config/account.json'; // 帐户的配置项

var ACCOUNT = ""; // 当前的帐户
var GLOBAL_SERVER = ""; // 当前的邮件服务器

var myServer = http.createServer(function(req, res) {
    // 允许跨域
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 设置接收数据编码格式为 UTF-8
    req.setEncoding('utf-8');

    if (req.url == '/favicon.ico') {
        res.end();
    }

    // 分发GET, POST请求
    if (req.method == 'GET') {
        var arg = URL.parse(req.url, true).query;
        var requestType = arg.type;
        var action = arg.action;
        var boxName = arg.box;
        var pageNo = arg.pageno || 1;
        var pageSize = arg.pagesize || 5;
        var server = arg.server || 'gmail';

        GLOBAL_SERVER = server;
        ACCOUNT = arg.account || 'NewAccount';

        // 同步读取配置信息
        var configFile = fs.readFileSync(recvConfigJsonFile, 'utf-8');
        var serverJSON = JSON.parse(configFile);
        var serverConfig = serverJSON[ACCOUNT][server];
        var protocol = serverConfig['protocol'];

        //console.log('ACCOUNT', ACCOUNT);
        //console.log('server', server);

        // 取邮件列表的接口
        if (action == 'mail') {
            // 按协议分发邮件列表的请求接口
            if (protocol == 'IMAP') {
                getMailList(req, res, {
                    'boxName': boxName || 'INBOX',
                    'pageNo': pageNo,
                    'pageSize': pageSize
                }, 'IMAP', serverConfig.server);

            } else if (protocol == 'POP') {
                getMailListByPOP(req, res, 'POP', serverConfig.server);
            }
        } else if (action == 'badge') {
            // 取邮件数接口
            getBadgeList(req, res, 'IMAP', serverConfig.server);
        }


    } else {
        var postData = ""; //POST & GET ： name=aaa&email=bbb@sina.com

        // 数据块接收中
        req.addListener("data", function(postDataChunk) {
            postData += postDataChunk;
        });

        // 数据接收完毕，执行回调函数
        req.addListener("end", function() {
            var params = querystring.parse(postData);
            var result = {};

            ACCOUNT = params.account || 'NewAccount';

            // 分发请求指令
            switch (params.action) {
                case "SEND":
                    sendMail(req, res, params);
                    break;
                case "CONFIG":
                    var data = params;
                    var a = setAccount(req, res, data);
                    var b = setSend(req, res, data);
                    var c = setRecv(req, res, data);
                    if (a && b && c) {
                        result.success = true;
                    } else {
                        result.success = false;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                    break;
                case "LOGIN":
                    var data = params;
                    result.success = tryLogin(data);
                    result.server = getServerByAccount(data.account);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                    break;
                case "MOVE":
                    var data = params;
                    moveMail(req, res, data);
                    break;
                case "DELETE":
                    var data = params;
                    deleteMail(req, res, data);
                    break;
            }
        });
    }

});

/**
 * [deleteMail 删除邮件]
 * @param  {[type]} req  [请求对象]
 * @param  {[type]} res  [响应对象]
 * @param  {[type]} data [数据结构]
 * @return {[type]}      [description]
 */
function deleteMail(req, res, data) {
    var account = data["account"];
    var server = data["server"];
    var configFile = fs.readFileSync(recvConfigJsonFile, 'utf-8');
    var serverJSON = JSON.parse(configFile);
    var serverConfig = serverJSON[account][server];
    console.log('account', account);
    console.log('server', server);
    console.log('serverConfig', serverConfig);
    
    var imap = new Imap(serverConfig.server);
    var result = {};
    var srcBoxName = data['srcBoxName'];
    var messageSource = data["messageSource"];
    var srcBox = boxNameMapping[server][srcBoxName];
    console.log('srcBox', srcBox);
    imap.once('ready', function() {
        // 打开源文件夹
        imap.openBox(srcBox, true, function(err, box) {
            if (err) throw err;

            // 设置信息源描述对象的标志位为删除
            imap.setFlags(messageSource, "Deleted", function(err) {
                if (err) throw err;
                console.log('Deleted flag has been successfully set at ' + messageSource);

                imap.expunge(messageSource, function(err) {
                    if (err) throw err;
                    // console.log('mail has been deleted');

                    imap.end();

                    result.success = true;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                })
            });

        })
    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended');
    });

    imap.connect();
}

/**
 * [moveMail 发送移动邮件的动作]
 * @param  {[type]} req  [请求对象]
 * @param  {[type]} res  [响应对象]
 * @param  {[type]} data [数据结构]
 * @return {[type]}      [description]
 */
function moveMail(req, res, data) {
    var configFile = fs.readFileSync(recvConfigJsonFile, 'utf-8');
    var serverJSON = JSON.parse(configFile);
    console.log('data in moveMail', data);
    var account = data["account"];
    var server = data["server"];
    var serverConfig = serverJSON[account][server];

    console.log('serverConfig', serverConfig);
    var imap = new Imap(serverConfig.server);
    var result = {};

    var srcBoxName = data['srcBoxName'];
    var targetBoxName = data['targetBoxName'];
    var messageSource = data["messageSource"];
    var srcBox = boxNameMapping[server][srcBoxName];
    var targetBox = boxNameMapping[server][targetBoxName];

    imap.once('ready', function() {
        imap.openBox(srcBox, false, function(err, box) {
            if (err) throw err;
            console.log('BOX', box);

            imap.move(messageSource, targetBox, function(err) {
                if (err) throw err;
                console.log('Successfully moved');

                result.success = true;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        });
    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended');
    });

    imap.connect();
    return true;
}


function getServerByAccount(account) {
    var sendJsonFile = fs.readFileSync(sendConfigJsonFile, 'utf-8');
    var sendJson = JSON.parse(sendJsonFile);
    if (account in sendJson) {
        var map = sendJson[account];
        for (var attr in map) {
            return attr;
        }
    }
    return "qq";
}

/**
 * [tryLogin description]
 * @param  {[type]} json [{account:xxx,email:xxx,password}]
 * @return {[type]}      [description]
 */
function tryLogin(json) {
    var accountJsonFile = fs.readFileSync(accountConfigJsonFile, 'utf-8');
    var accountJson = JSON.parse(accountJsonFile);
    var flag = false;
    for (var account in accountJson) {
        if (account == json['account']) {
            var potential = accountJson[account];
            if (potential.password == json['password']) {
                flag = true;
                break;
            }
        }
    }

    return flag;
}

/**
 * [setAccount 设置帐户]
 * @param {[type]} req  [请求对象]
 * @param {[type]} res  [响应对象]
 * @param {[type]} data [设置的参数]
 */
function setAccount(req, res, data) {
    var config = fs.readFileSync(accountConfigJsonFile, 'utf-8');
    var configJson = JSON.parse(config);

    var info = JSON.parse(data.data);

    console.log('info', info);
    console.log('info.account', info.account);

    var cloned = clone(configJson);
    var extraInfo = info.accountInfo;
    console.log('extraInfo', extraInfo);

    cloned[info.account] = {
        "email": extraInfo.email,
        "password": extraInfo.password,
        "remember": extraInfo.remember
    };

    console.log('cloned', cloned);

    fs.writeFileSync(accountConfigJsonFile, JSON.stringify(cloned), 'utf-8');

    return true;
}

/**
 * [setSend 设置发件服务器]
 * @param {[type]} req  [请求对象]
 * @param {[type]} res  [响应对象]
 * @param {[type]} data [设置的参数]
 */
function setSend(req, res, data) {
    var config = fs.readFileSync(sendConfigJsonFile, 'utf-8');
    var configJson = JSON.parse(config);

    var info = JSON.parse(data.data);
    console.log('info in send', info);
    var cloned = clone(configJson);
    var append = clone(info['send']);
    if (!cloned[info.account]) {
        cloned[info.account] = {};
    }
    cloned[info.account][info.server] = append;

    fs.writeFileSync(sendConfigJsonFile, JSON.stringify(cloned), 'utf-8');
    return true;
}


/**
 * [setRecv 设置收件服务器]
 * @param {[type]} req  [请求对象]
 * @param {[type]} res  [响应对象]
 * @param {[type]} data [设置的参数]
 */
function setRecv(req, res, data) {
    var config = fs.readFileSync(recvConfigJsonFile, 'utf-8');
    var configJson = JSON.parse(config);

    var info = JSON.parse(data.data);
    console.log('info in recv', info);
    var cloned = clone(configJson);
    var append = clone(info['recv']);
    if (!cloned[info.account]) {
        cloned[info.account] = {};
    }
    cloned[info.account][info.server] = append;

    fs.writeFileSync(recvConfigJsonFile, JSON.stringify(cloned), 'utf-8');
    return true;
}




function getMailListByPOP(req, res, recvType, json) {
    var port = json.port;
    var host = json.host;
    var param = {
        tlserrs: false,
        enabletls: json.tls,
        debug: true
    };
    var username = json.user;
    var password = json.password;

    var mailList = [];
    //首先建立连接
    var client = new POP3Client(port, host, param);

    // var client = new POP3Client(995, 'pop.qq.com', {
    //       tlserrs: false, //是否忽略tls errors
    //       enabletls: true, //传输层安全协议ssl
    //       debug: true //是否在console输出命令和响应信息
    // });

    //connect to the remote server
    client.on('connect', function() {
        console.log('CONNECT success');
        //成功建立连接后进入AUTHORIZATION状态，进行身份认证
        client.login(username, password);
    });
    /**
     * Successfully login
     */
    //login handler status Boolean
    client.on('login', function(status, rawdata) {
        if (status) {
            console.log('LOGIN/PASS success.');
            //获取邮件列表
            client.list();
        } else {
            console.log('ERR: LOGIN/PASS failed');
            client.quit();
        }
    });
    //LIST handler
    client.on('list', function(status, msgcount, msgnumber, data, rawdata) {
        if (status === false) {
            console.log('LIST failed');
            //获取失败，退出服务
            client.quit();
        } else {
            console.log('LIST success with', msgcount, ' element(s).');
            if (msgcount > 0) {
                //获取第一封邮件
                for (var i = 1; i < msgcount && i < 3; i++) {
                    (function(c) {
                        setTimeout(function() {
                            client.retr(c);
                        }, (c + 1) * 400);
                    })(i);
                }
            }
        }
    });
    //RETR handler
    client.on('retr', function(status, msgnumber, data, rawdata) {
        if (status === true) {
            console.log('RETR success', msgnumber);
            //获得后，输出data数据
            console.log('data is ', data);
            var mailparser = new MailParser();
            mailparser.write(data);
            mailparser.end();

            mailparser.on('end', function(mail) {
                console.dir(mail);
                var mailEntity = {
                    id: msgnumber,
                    subject: mail.subject,
                    from: fnJoin(mail.from, 'address'),
                    to: fnJoin(mail.to, 'address'),
                    date: mail.date
                };

                mailList.push(mailEntity);

                if (mailList.length == 3) {
                    console.log('mailList', mailList);
                    client.quit();
                }
            });
        } else {
            console.log('ERR: RETR failed for msgnumber', msgnumber);
        }
    });
    //QUIT handler
    client.on('quit', function(status, rawdata) {
        if (status === true) {
            console.log('QUIT success');
        } else {
            console.log('ERR: QUIT failed.');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mailList));
    });
}

var boxNameMapping = {
    "qq": {
        "INBOX": "INBOX",
        "SENDBOX": "Sent Messages",
        "TRASH": "Deleted Messages",
        "DRAFT": "Drafts"
    },
    "163": {
        "INBOX": "INBOX",
        "SENDBOX": "已发送",
        "TRASH": "已删除",
        "DRAFT": "草稿箱"
    },
    "gmail": {
        "INBOX": "INBOX",
        "TRASH": "Trash"
    }
};

function fnJoin(list, key) {
    var ret = '';
    for (var i = 0, l = list.length; i < l; i++) {
        if (i) {
            ret += ',';
        }
        ret += list[i][key];
    }

    return ret;
}

function getBadgeList(req, res, recvType, json) {
    var imap = new Imap(json);

    function openBox(boxName, cb) {
        imap.openBox(boxNameMapping[GLOBAL_SERVER][boxName], false, cb);
    }

    var result = {};
    var counter = 0;
    imap.once('ready', function() {
        for (var boxName in boxNameMapping[GLOBAL_SERVER]) {
            + function(box) {
                openBox(box, function(err, Box) {
                    if (err) throw err;
                    result[box] = clone(Box.messages);
                    counter++;
                    if (counter == 4) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                        imap.end();
                    }
                })
            }(boxName);
        }
    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended');
    });


    imap.connect();
}

function getMailList(req, res, configJson, recvType, json) {
    // 获取邮件列表
    var imap = new Imap(json);

    var buffer = '';

    function openBoxByName(boxName, cb) {
        imap.openBox(boxName, false, cb);
    }

    var boxName = configJson['boxName'];
     var mailList = [],
        currentNo = 0,
        attrUIDList = [];
    imap.once('ready', function() {
        imap.getBoxes(function(err, boxes) {
            if (err) throw err;
            console.log("boxes", boxes);
        });

        var targetBox = boxNameMapping[GLOBAL_SERVER][boxName];
        console.log('targetBox', targetBox);
        openBoxByName(targetBox, function(err, box) {
            if (err) throw err;
            var pageNo = configJson['pageNo'];
            var pageSize = configJson['pageSize'];
            var start = (pageNo - 1) * pageSize + 1;
            var end = pageNo * pageSize;


            var f = imap.seq.fetch(start + ':' + end, {
                bodies: '',
                struct: true
            });

            f.on('message', function(msg, seqno) {
                var mailparser = new MailParser();
                console.log('Message #%d', seqno);
                var prefix = '(#' + seqno + ') ';
                msg.on('body', function(stream, info) {
                    stream.pipe(mailparser);
                    buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        stream.once('end', function() {
                            if (info.which !== 'TEXT') {
                                console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                            } else {
                                console.log(prefix + 'Body[%s] Finished', inspect(info.which));
                            }
                        });
                    });

                    mailparser.on("end", function(mail) {
                        console.log('mail', mail);
                         var froms = mail['from'];
                         var tos = mail['to'];
                         var fromString = '';
                         var toStr = '';
                         for (var f = 0; f < froms.length; f++) {
                            if (f) fromString + ';'
                            fromString += froms[f]['address'];
                         }

                         for (var t = 0; t < tos.length; t++) {
                            if (t) toStr + ';'
                            toStr += tos[t]['address'];
                         }
                         var mailEntity = {
                            from : fromString,
                            to : toStr,
                            date : mail['date'],
                            subject : mail['subject']
                         };
                         mailEntity.path = 'mailbodies/msg-' + seqno + '-body.html';
                         mailList.push(mailEntity);

                         console.log('mailList', mailList)
                        fs.writeFile('mailbodies/msg-' + seqno + '-body.html', mail.html, function(err) {
                            if (err) {
                                throw err;
                            }
                            console.log('Info: #%d saved!', seqno);
                        });
                        //如果有附件，则存储起来。
                        // if(mail.attachments){
                        //   mail.attachments.forEach(function(attachment){
                        //       console.log(attachment.fileName);
                        //       fs.writeFile('mailattaches/msg-' + seqno + '-' + attachment.generatedFileName, attachment.content, function(err){
                        //         if(err){
                        //           throw err;
                        //         }
                        //         console.log('Info: #%d attachment saved!', seqno);
                        //       });
                        //   });                    
                        // }
                    });
                });

               
                msg.once('attributes', function(attrs) {
                    var entity = inspect(attrs, false, 8);
                    var re = /uid\s*:\s*(\d+)\s?/;
                    var match = entity.match(re);
                    var uid = RegExp["$1"];
                    attrUIDList.push(uid);

                    console.log(prefix + 'Attributes: %s', entity);
                });

                msg.once('end', function() {
                    console.log(prefix + 'Finished');
                });
            });

            f.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });

            f.once('end', function() {
                imap.end();
            });
 
        });
    });

    imap.once('error', function(err) {
        console.log(err);
    });

    imap.once('end', function() {
        console.log('Connection ended');
        console.log('Done fetching all messages!');
        for (var i = 0; i < mailList.length; i++) {
            var uid = attrUIDList[i];
            mailList[i].id = uid;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mailList));
    });

    imap.connect();
}

function sendMail(req, res, data) {
    var server = data['server'];
    var account = data['account'];
    var serverConfig = fs.readFileSync(sendConfigJsonFile, 'utf-8');
    var config = JSON.parse(serverConfig)[account][server];

    console.log('server', server);
    console.log('account', account);
    console.log('config', config);
    var auth = config['auth'];
    console.log('auth', auth);
    var transporter = mailer.createTransport("SMTP", config);

    var mail = {
        from: auth['user'],
        to: data['to'],
        subject: data['subject'],
        html: data['content']
    };
    var result = {};
    transporter.sendMail(mail, function(error, response) {
        if (error) {
            result.success = false;
            result.message = error;
            throw error;
        } else {
            result.success = true;
            result.message = response.message;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    });
}


function clone(obj) {
    if (typeof obj !== 'object' || obj === undefined || obj === null) {
        return obj;
    }

    var ret = obj.constructor == 'Array' ? [] : {};
    for (var attr in obj) {
        ret[attr] = clone(obj[attr]);
    }

    return ret;
}

myServer.listen(8081);
console.log('Server has been listening at port 8081');
