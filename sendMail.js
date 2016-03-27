var http = require('http');
var mailer = require('nodemailer');

http.createServer(function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");

	var json = {
		from : '289202839@qq.com',
		to : '87935213@qq.com',
		title : '测试发送邮件' + new Date(),
		content : 'hello, server.<br><b>' + new Date() + '</b>'
	};

	var transporter = mailer.createTransport("SMTP", {
	    host: "smtp.qq.com",
	    secureConnection: true, 
	    port: 465, 
	    requiresAuth: true,
	    domains: ["qq.com"],
	    auth: {
	        user: '289202839@qq.com',
	        pass: 'krugnizmwivecbbi'
	    }
	});

	var mail = {
		from : json.from,
	    to: json.to,
	    subject: json.title,
	    text: json.content
	};
	transporter.sendMail(mail, function(error, response){
	   if(error){
	       console.log(error);
	   }else{
	       console.log("Message sent: " + response.message);
	   }
	});
}).listen(8081);

console.log('Server has been listening at port 8081');