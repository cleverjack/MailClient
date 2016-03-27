var http = require('http');
var mailer = require('nodemailer');
var URL = require('url');
var Imap = require('imap');
var inspect = require('util').inspect;

http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    var arg = URL.parse(req.url, true).query;
    var requestType = arg.type;
    var data = arg.data;

    if (requestType == 'get') {
        getMailList(req, res, 'IMAP', {
	        user: '289202839@qq.com',
	        password: 'krugnizmwivecbbi',
	        host: 'imap.qq.com',
	        port: 993,
	        tls: true
	    });

    } else if (arg.type == 'post') {

    }
}).listen(8081);


function getMailList (req, res, recvType, json) {
	// 获取邮件列表
    var imap = new Imap(json);

    var buffer = '';

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
        //imap.openBox('SENDBOX', true, cb);
    }

    imap.once('ready', function() {
        openInbox(function(err, box) {
            if (err) throw err;
            var f = imap.seq.fetch('1:4', {
                //bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE TEXT)',
                bodies : '',
                struct: true
            });

            var mailList = [],
            	currentNo = 0;

            f.on('message', function(msg, seqno) {
                console.log('Message #%d', seqno);
                var prefix = '(#' + seqno + ') ';
                msg.on('body', function(stream, info) {
                	console.log('info', info);
                    buffer = '';
                    stream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                    });
                });

                msg.once('attributes', function(attrs) {
                    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });

                msg.once('end', function() {
                    console.log(prefix + 'Finished');
                    if (currentNo != seqno) {
                    	currentNo = seqno;
                    	mailList.push(Imap.parseHeader(buffer));
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

console.log('Server has been listening at port 8081');
