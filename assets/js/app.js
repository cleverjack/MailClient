(function ($, wangEditor) {
	var MailApp = {
		init : function () {
			console.log('app is initial');
			this.bindEvents();
		}, 
		bindEvents : function () {
			var $viewModal = $('#viewModal');
			$('#writeMail').on('click', function () {
				// $viewModal.modal('show');

				// test
				sendMail();

			});

			var editor = new wangEditor('toolbar');
			editor.create();
			console.log('wangEditor', editor);
		}
	};


	/**
	 * [sendMail 发送邮件]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function sendMail (data) {
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
		    to: '289202839@qq.com',
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
	}

	MailApp.init();

	return MailApp;
})(jQuery, wangEditor);