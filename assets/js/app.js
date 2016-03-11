(function ($, wangEditor) {

	var PASSWORD = 'xxxxxxxxxx'; // 测试邮件的密码， 不要merge这一行！

	function Mail () {};
	Mail.prototype = {
		constructor : Mail,
		send : function (data) {
			// 发送删除
		},
		del : function (id) {

			if (isArray(id)) {
				// 批量删除邮件, 也可只为数组传入一个邮件id进行删除
			} else {
				// 单独删除
			}
		},
		save : function (mail) {

		},
		moveTo : function (flag) {
			// 0: send
			// 1: draft
			// 2: trash
		}

	};


	function MailApp (){};

	MailApp.prototype = {
		constructor : MailApp,
		init : function () {
			console.log('app is initial');
			this.mailer = new Mail();

			this.bindEvents();
		}, 
		bindEvents : function () {
			var $viewModal = $('#viewModal');
			$('#writeMail').on('click', function () {
				$viewModal.modal('show');

				// test
				//sendMail();

			});

			var editor = new wangEditor('toolbar');
			editor.create();
			console.log('wangEditor', editor);
		},
		getMailInstance : function () {
			return this.mailer;
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
		        pass: PASSWORD
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



	/*==================================== 工具类 ===============================================*/

	/**
	 * [isArray 是否为数组]
	 * @param  {[type]}  array [description]
	 * @return {Boolean}       [description]
	 */
	function isArray (array) {
		var protostr = Object.prototype.toString;
		return protostr.call(array) === '[object Array]';
	}

	/**
	 * [clone 对象的深拷贝]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
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


	
	MailApp.init(); // 初始化邮箱应用

	return MailApp;
})(jQuery, wangEditor);