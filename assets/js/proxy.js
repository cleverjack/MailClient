(function ($) {
	$(function () {
        init();
    });


	/**
	 * [displayPanelByName 根据配置面板名字显示配置项]
	 * @param  {[type]} name [面板名字]
	 * @return {[type]}      [description]
	 */
	function displayPanelByName (name) {
		$('.step').hide();
		$('.step[data-name="'+ name +'"]').show();
	}

	// default DEMO config
	var configOption = {
		server : 'qq',
		account : 'NewAccount',
		accountInfo : {
			email : '289202839@qq.com',
			password : 'PASSWORD',
			remember : false,
		},
		send : {
			"NewAccount" : {
				"qq": {
			        "host": "smtp.qq.com",
			        "secureConnection": true,
			        "port": 465,
			        "auth": {
			            "user": "289202839@qq.com",
			            "pass": "password"
			        }
			    }
			}
		},
		recv : {
			"QQMailserver" : {
				"qq": {
			        "protocol": "IMAP",
			        "server" : {
			            "user": "289202839@qq.com",
			            "password": "password",
			            "host": "imap.qq.com",
			            "port": 993,
			            "tls": true
			        }
			    }
			}
		}
	};


	var collectForm = {
		addMailServer : function ($ctx) {
			configOption.server = $ctx.find('.list-group-item.active').attr('data-server');
			console.log("configOption.server", configOption.server);
		},
		setupMailServer : function ($ctx) {
			var $account = $ctx.find('input[id="name"]');
			var $email = $ctx.find('input[id="email"]');
			var $password = $ctx.find('input[id="password"]');
			var $remember = $ctx.find('input[id="remember"]');

			configOption.account = $account.val();
			configOption.accountInfo = {
				email : $email.val(),
				password : $password.val(),
				remember : $remember.prop('checked'),
			}

			console.log('configOption.accountInfo', configOption.accountInfo);
		},
		setupSendServer : function ($ctx) {
			var $host = $ctx.find('input[id="sendServer"]');
			var $port = $ctx.find('input[id="port"]');
			var $user = $ctx.find('input[id="sendServerUsername"]');
			var $pass = $ctx.find('input[id="sendServerPassword"]');
			var $secureConnection = $ctx.find('input[id="secureConnection"]');
			
			configOption.send = {
				"host": $host.val(),
		        "secureConnection": $secureConnection.prop('checked'),
		        "port": $port.val(),
		        "auth": {
		            "user": $user.val(),
		            "pass":  $pass.val()//"krugnizmwivecbbi"
		        }
			}

			console.log('configOption.send', configOption.send);
		},
		setupRecvServer : function ($ctx) {
			var $protocol = $ctx.find('.dropdown-target:first');
			// var $account = $ctx.find('input[id="account"]');
			var $host = $ctx.find('input[id="recvServer"]');
			var $port = $ctx.find('input[id="recvServerPort"]');
			var $user = $ctx.find('input[id="recvServerUsername"]');
			var $password = $ctx.find('input[id="recvServerPassword"]');
			var $tls = $ctx.find('input[id="tls"]');

			configOption.recv = {
				"protocol": $protocol.text(),
		        "server" : {
		            "user": $user.val(),
		            "password": $password.val(),
		            "host": $host.val(),
		            "port": $port.val(),
		            "tls": $tls.prop('checked')
		        }
			}

			console.log("configOption.recv", configOption.recv);
		},
		testConnection : function ($ctx) {
			// 写配置文件
		}
	};

	/**
	 *   手动实现一个状态机， 用于引导配置邮件代理服务器
	 *   prev, next方法可以抽出去， 后边做个封装
	 */
	var MailServerFSM = {
		"addMailServer" : {
			prevButtonWasPressed : function () {
				doNothing();
			},
			nextButtonWasPressed : function ($ctx) {
				// 1. display setupMailServer modal panel
				
				if (!$ctx.find('.list-group-item.active').length) {
					alert('请选择一个邮箱系统');
					return;
				}

				// 2. collect data
				collectForm['addMailServer']($ctx);

				// 3. update current status
				this.currentStatus = 'setupMailServer';

				// 4. switch panel
				displayPanelByName('setupMailServer');
			}
		},
		"setupMailServer" : {
			prevButtonWasPressed : function () {
				
				this.currentStatus = 'addMailServer';
				displayPanelByName('addMailServer');
			},
			nextButtonWasPressed : function ($ctx) {
				
				// 校验
				var $account = $ctx.find('input[id="name"]');
				var $username = $ctx.find('input[id="email"]');
				var $password = $ctx.find('input[id="password"]');
				var $remember = $ctx.find('input[id="remember"]');

				$('.error').removeClass('error');
				// if (!$account.val()) {
				// 	$account.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$username.val()) {
				// 	$username.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$password.val()) {
				// 	$password.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				collectForm['setupMailServer']($ctx);

				this.currentStatus = 'setupSendServer';

				displayPanelByName('setupSendServer');
			}
		},
		"setupSendServer" : {
			prevButtonWasPressed : function () {
				
				this.currentStatus = 'setupMailServer';

				displayPanelByName('setupMailServer');
			},
			nextButtonWasPressed : function ($ctx) {
				// 校验
				$('.error').removeClass('error');
				var $host = $ctx.find('input[id="sendServer"]');
				var $port = $ctx.find('input[id="port"]');
				var $user = $ctx.find('input[id="sendServerUsername"]');
				var $pass = $ctx.find('input[id="sendServerPassword"]');

				// if (!$host.val()) {
				// 	$host.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$port.val()) {
				// 	$port.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$user.val()) {
				// 	$user.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }
				// 
				// if (!$pass.val()) {
				// 	$pass.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }


				collectForm['setupSendServer']($ctx);
				this.currentStatus = 'setupRecvServer';
				displayPanelByName('setupRecvServer');
			}
		},
		"setupRecvServer" : {
			prevButtonWasPressed : function () {
				this.currentStatus = 'setupSendServer';
				displayPanelByName('setupSendServer');
			},
			nextButtonWasPressed : function ($ctx) {
				// 校验
				var $protocol = $ctx.find('.dropdown-target:first');
				var $account = $ctx.find('input[id="account"]');
				var $host = $ctx.find('input[id="recvServer"]');
				var $port = $ctx.find('input[id="recvServerPort"]');
				var $user = $ctx.find('input[id="recvServerUsername"]');
				var $password = $ctx.find('input[id="recvServerPassword"]');
				
				$('.error').removeClass('error');
				// if (!$account.val()) {
				// 	$account.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$host.val()) {
				// 	$host.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }

				// if (!$port.val()) {
				// 	$port.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }
				// 
				// if (!$user.val()) {
				// 	$user.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }
				//  
				// if (!$password.val()) {
				// 	$password.addClass('error');
				// 	alert('请检查输入项');
				// 	return;
				// }


				collectForm['setupRecvServer']($ctx);

				this.currentStatus = 'testConnection';

				displayPanelByName('testConnection');
			}
		},
		"testConnection" : {
			prevButtonWasPressed : function () {

				this.currentStatus = 'setupRecvServer';

				displayPanelByName('setupRecvServer');
			},
			nextButtonWasPressed : function ($ctx) {
				//1. write config files
				$.ajax({
					url : 'http://localhost:8081/interface.do',
					type : "POST",
					data : {
						action : "CONFIG",
						data : JSON.stringify(configOption)
					},
					success : function (ret) {
						if (ret.success == true || ret.success == 'true') {
							// 2. redirect
							alert('配置成功!');
							window.location = './main.html?server=' + configOption.server + "&account=" +  configOption.account;
						} else {
							alert('配置失败，请联系管理员');
						}
					}
				})
				
			}
		}
	};



	var __defaultConfig = {
		type : 'account',
		path : 'account.json'
	};

	function Configure (json) {
		var config = $.extend({}, json, __defaultConfig);

		this.type = config.type;
		this.path = config.path;
	};

	Configure.prototype = {
		constructor : Configure,
		save : function () {
			var fileType = this.type;
			var filePath = this.path;
		},
		update : function () {

		},
		get : function (callback) {
			var filePath = this.path;
			// 读取文件并回调
			
			// // 1. readfile
			// readFile(filePath, function (data) {
			// 	// 2. callback
			// 	callback && callback(data);
			// })
		},
		del : function () {}
	};


    function init () {
    	
    	initLoginModal();
        MailServerFSM.currentStatus = 'addMailServer';
        displayPanelByName('addMailServer');
        bindStepEvents();
    };


    function initLoginModal () {
    	var $modal = $('#loginModal');
    	$modal.modal('show');
    	$('#cancelLogin').on('click', function () {
    		$modal.modal('hide');
    	});

    	$('#login').on('click', function () {
    		// 1. validate
    		var $account = $modal.find('#loginUser');
    		var $password = $modal.find('#loginPass');

    		$('.error').removeClass('error');
    		if (!$account.val()) {
    			$account.addClass('error');
    			alert('请检查输入项');
    			return;
    		}

    		if (!$password.val()) {
    			$password.addClass('error');
    			alert('请检查输入项');
    			return;
    		}

    		// 2. try logging in
    		var params = {
				"action" : "LOGIN",
				"account" : $account.val(),
				"password" : $password.val()
			};
    		$.ajax({
    			url : 'http://localhost:8081/interface.do',
    			type : "POST",
    			dataType : "JSON",
    			data : params,
    			success : function (info) {
    				if (info.success == 'true' || info.success == true) {
    					alert('登陆成功！');
    					window.location = './main.html?server=' + info.server + "&account=" +  $account.val();
    				} else {
    					alert('帐户或密码错误！');
    				}
    			}
    		});
    	});
    }


    /**
     * [doNothing 空函数， 起占位作用， 用于功能扩展]
     * @return {[type]} [description]
     */
    function doNothing () {}

    function bindStepEvents () {

    	var currentIndex = 0;

        $(document).on('click', '.btn-next', function (ev) {
        	$panel = $(ev.currentTarget).closest('.panel');
        	MailServerFSM[MailServerFSM.currentStatus].nextButtonWasPressed.call(MailServerFSM, $panel);
        });

        $(document).on('click', '.btn-prev', function (ev) {
        	$panel = $(ev.currentTarget).closest('.panel');
        	MailServerFSM[MailServerFSM.currentStatus].prevButtonWasPressed.call(MailServerFSM, $panel);
        });


        $(document).on('click', '.list-group-item', function (ev) {
        	var $target = $(ev.currentTarget);
        	if ($target.hasClass('active')) {
        		$target.removeClass('active');
        	} else {
        		$('.list-group-item').removeClass('active');
        		$target.addClass('active');
        	}
        });

        $(document).on('click', '.dropdown-menu>li', function (ev) {
        	var $target = $(ev.currentTarget);
        	var selected = $target.find('a').text();
        	$target.closest('.panel-body').find('.dropdown-target').text(selected)
        });
    }

})(jQuery);