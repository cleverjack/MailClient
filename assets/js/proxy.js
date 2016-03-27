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

	var configOption = {
		server : 'qq',
		setup : {
			serverName : 'QQ Mail server',
			serverAddr : '289202839@qq.com',
			serverPass : 'aaa',
			remember : false,
		},
		smtp : {
			server : 'smtp.qq.com',
			port : 465,
			username : 'user',
			password : 'pass',
			useSSH : true
		}
	};


	var collectForm = {
		addMailServer : function ($ctx) {
			configOption.server = $ctx.attr('data-config');
		},
		setupMailServer : function ($ctx) {
			configOption.setup = {
				serverName : $ctx.find('input[id="name"]').val(),
				serverAddr : $ctx.find('input[id="email"]').val(),
				serverPass : $ctx.find('input[id="password"]').val(),
				remember : $ctx.find('input[id="remember"]').prop('checked'),
			}

			console.log('setup', configOption.setup);
		},
		setupSendServer : function ($ctx) {

		},
		setupRecvServer : function ($ctx) {

		},
		testConnection : function ($ctx) {

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
				
				collectForm['setupMailServer']($ctx);

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
				window.location = './main.html';
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
    	
        MailServerFSM.currentStatus = 'addMailServer';
        displayPanelByName('addMailServer');
        bindStepEvents();
    };


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