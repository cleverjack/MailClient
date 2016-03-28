var http = require('http');
var mailer = require('nodemailer');
var URL = require('url');
var Imap = require('imap'); // IMAP协议模块
var POP3Client = require('poplib'); // POP协议模块
var inspect = require('util').inspect;
var fs = require('fs');
var MailParser = require('mailparser').MailParser;
var querystring = require('querystring');


/* 文件路径 */
var recvConfigJsonFile = './src/config/recv.json';
var sendConfigJsonFile = './src/config/send.json';
var accountConfigJsonFile = './src/config/account.json';

var username = '289202839@qq.com';
var password = 'krugnizmwivecbbi';
var ACCOUNT = "";
var GLOBAL_SERVER = "qq";

http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // 设置接收数据编码格式为 UTF-8
    req.setEncoding('utf-8');

    if (req.method == 'GET') {
    	var arg = URL.parse(req.url, true).query;
	    var requestType = arg.type;
	    var action = arg.action;
	    var boxName = arg.box;
	    var pageNo = arg.pageno || 1;
	    var pageSize = arg.pagesize || 5;
	    var server = arg.server || '163';

	    GLOBAL_SERVER = server;
		
		ACCOUNT = arg.account || 'NewAccount';

		console.log('ACCOUNT', ACCOUNT);
		console.log('server', server);

	    var configFile = fs.readFileSync(recvConfigJsonFile, 'utf-8');
	    var serverJSON = JSON.parse(configFile);
	    var serverConfig = serverJSON[ACCOUNT][server];
	    console.log('serverConfig', serverConfig);
	    var protocol = serverConfig['protocol'];


	    if (action == 'mail') {
	    	if (protocol == 'IMAP') {
        		getMailList(req, res, {
	    			'boxName' : boxName || 'INBOX',
	    			'pageNo' : pageNo,
	    			'pageSize' : pageSize
	    		}, 'IMAP', serverConfig.server);

	        } else if (protocol == 'POP') {
	        	getMailListByPOP(req, res)
	        }
    		
    	} else if (action == 'badge'){
    		getBadgeList(req, res, 'IMAP', serverConfig.server);
    	}
	    
	    
    } else {
    	var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
	    // 数据块接收中
	    req.addListener("data", function (postDataChunk) {
	        postData += postDataChunk;
	    });
	    // 数据接收完毕，执行回调函数
	    req.addListener("end", function () {
	        var params = querystring.parse(postData);
	        ACCOUNT = params.account || 'NewAccount';

	        switch (params.action) {
	        	case "SEND":
	        		sendMail(req, res, params);
	        		break;
	        	case "CONFIG":
	        		var data = params;
	        		var a = setAccount(req, res, data);
	        		var b = setSend(req, res, data);
	        		var c = setRecv(req, res, data);
	        		var result = {};

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
	        		var result = {};
					result.success = tryLogin(data);
					result.server = '163';
	        		res.writeHead(200, { 'Content-Type': 'application/json' });
		        	res.end(JSON.stringify(result));
		        	break;
	        }
	    });
    }
    
}).listen(8081);

/**
 * [tryLogin description]
 * @param  {[type]} json [{account:xxx,email:xxx,password}]
 * @return {[type]}      [description]
 */
function tryLogin (json) {
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
function setAccount (req, res, data) {
	var config = fs.readFileSync(accountConfigJsonFile, 'utf-8');
	var configJson = JSON.parse(config);

	var info = JSON.parse(data.data);

	console.log('info', info);
	console.log('info.account', info.account);

	var cloned = clone(configJson);
	var extraInfo = info.accountInfo;
	console.log('extraInfo', extraInfo);

	cloned[info.account] = {
		"email" : extraInfo.email,
		"password" : extraInfo.password,
		"remember" : extraInfo.remember
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
function setSend (req, res, data) {
	var config = fs.readFileSync(sendConfigJsonFile, 'utf-8');
	var configJson = JSON.parse(config);

	var info = JSON.parse(data.data);
	console.log('info in send', info);
	var cloned = clone(configJson);
	var append = clone(info['send']);
	cloned[info.account] = {};
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
function setRecv (req, res, data) {
	var config = fs.readFileSync(recvConfigJsonFile, 'utf-8');
	var configJson = JSON.parse(config);
	
	var info = JSON.parse(data.data);
	console.log('info in recv', info);
	var cloned = clone(configJson);
	var append = clone(info['recv']);
	cloned[info.account] = {};
	cloned[info.account][info.server] = append;

	fs.writeFileSync(recvConfigJsonFile, JSON.stringify(cloned), 'utf-8');
	return true;
}




function getMailListByPOP (req, res, recvType, json) {
	//首先建立连接
	var client = new POP3Client(995, 'pop.qq.com', {
	      tlserrs: false, //是否忽略tls errors
	      enabletls: true, //传输层安全协议ssl
	      debug: true //是否在console输出命令和响应信息
	});

	//connect to the remote server
	client.on('connect', function(){
	  console.log('CONNECT success');
	  //成功建立连接后进入AUTHORIZATION状态，进行身份认证
	  client.login(username, password);
	});
	/**
	 * Successfully login
	 */
	//login handler status Boolean
	client.on('login', function(status, rawdata){
	  if(status){
	    console.log('LOGIN/PASS success.');
	    //获取邮件列表
	    client.list();
	  }else{
	    console.log('ERR: LOGIN/PASS failed');
	    client.quit();
	  }
	});
	//LIST handler
	client.on('list', function(status, msgcount, msgnumber, data, rawdata){
	  if(status === false){
	    console.log('LIST failed');
	    //获取失败，退出服务
	    client.quit();
	  }else{
	    console.log('LIST success with', msgcount, ' element(s).');
	    if(msgcount > 0){
	  //获取第一封邮件
	      client.retr(1);
	    }
	  }
	});
	//RETR handler
	client.on('retr', function(status, msgnumber, data, rawdata){
	  if(status === true){
	    console.log('RETR success', msgnumber);
	    //获得后，输出data数据
	    console.log('data is ', data);
	    client.quit();
	  }else{
	    console.log('ERR: RETR failed for msgnumber', msgnumber);
	  }
	});
	//QUIT handler
	client.on('quit', function(status, rawdata){
	  if(status === true){
	    console.log('QUIT success');
	    process.exit(0);
	  }else{
	    console.log('ERR: QUIT failed.');
	    process.exit(0);
	  }
	});
}

var boxNameMapping = {
	"qq" : {
		"INBOX" : "INBOX",
		"SENDBOX" : "Sent Messages",
		"TRASH" : "Deleted Messages",
		"DRAFT" : "Drafts"
	},
	"163" : {
		"INBOX" : "INBOX",
		"SENDBOX" : "已发送",
		"TRASH" : "已删除",
		"DRAFT" : "草稿箱"
	}
};

function getBadgeList (req, res, recvType, json) {
	var imap = new Imap(json);
	
	function openBox (boxName, cb) {
    	imap.openBox(boxNameMapping[GLOBAL_SERVER][boxName], false, cb);
    }
    
    var result = {};
    var counter = 0;
    imap.once('ready', function() {
    	for (var boxName in boxNameMapping[GLOBAL_SERVER]) {
	    	+function (box){
	    		openBox(box, function (err, Box){
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
    

	imap.connect();
}

function getMailList (req, res, configJson, recvType, json) {
	// 获取邮件列表
    var imap = new Imap(json);

    var buffer = '';

    function openBoxByName (boxName, cb) {
    	imap.openBox(boxName, false, cb);
    }

    var boxName = configJson['boxName'];
    imap.once('ready', function() {
        imap.getBoxes(function (err, boxes){
        	if (err) throw err;
        	console.log("boxes", boxes); 
        });

        var targetBox = boxNameMapping[GLOBAL_SERVER][boxName];
        console.log('targetBox', targetBox);
        openBoxByName(targetBox, function(err, box) {
            if (err) throw err;
            var pageNo = configJson['pageNo'];
            var pageSize = configJson['pageSize'];
            var start = (pageNo-1) * pageSize + 1;
            var end = pageNo * pageSize;


            var f = imap.seq.fetch(start + ':' + end, {
                bodies: '',
                struct: true
            });

            var mailList = [],
            	currentNo = 0;

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
                    	stream.once('end', function(){
					      if(info.which !== 'TEXT'){
					        console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
					      }else{
					        console.log(prefix + 'Body[%s] Finished', inspect(info.which));
					      }
					    });
                    });

                    mailparser.on("end", function(mail){
				      fs.writeFile('mailbodies/msg-' + seqno + '-body.html', mail.html, function(err){
				        if(err){
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
                    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });

                msg.once('end', function() {
                    console.log(prefix + 'Finished');
                    if (currentNo != seqno) {
                    	currentNo = seqno;
                    	var mailEntity = Imap.parseHeader(buffer);
                    	mailEntity.id = boxName + "_" + seqno;
                    	mailEntity.path = 'mailbodies/msg-' + seqno + '-body.html';
                    	mailList.push(mailEntity);
                    }
                });
            });

            f.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });

            f.once('end', function() {
                console.log('Done fetching all messages!');
                res.writeHead(200, { 'Content-Type': 'application/json' });
        		res.end(JSON.stringify(mailList));
                imap.end();
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
}

function sendMail (req, res, data) {
	var serverConfig = fs.readFileSync(sendConfigJsonFile, 'utf-8');
	var config = JSON.parse(serverConfig)[ACCOUNT]['qq'];

	console.log('config', config);
	var transporter = mailer.createTransport("SMTP", config);

    var mail = {
    	from : config.auth.user,
        to: data['to'],
        subject: data['subject'],
        html: data['content']
    };
    var result = {};
    transporter.sendMail(mail, function(error, response){
	   if(error){
	   		result.success = false;
	   		result.message = error;
	   }else{
	   		result.success = true;
	   		result.message = response.message;
	   }

	    res.writeHead(200, { 'Content-Type': 'application/json' });
	    res.end(JSON.stringify(result));
	});
}


function clone (obj) {
	if (typeof obj !== 'object' || obj === undefined || obj === null) {
		return obj;
	}

	var ret = obj.constructor == 'Array' ? [] : {};
	for (var attr in obj) {
		ret[attr] = clone(obj[attr]);
	}

	return ret;
}
console.log('Server has been listening at port 8081');
