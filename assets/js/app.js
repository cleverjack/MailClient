(function ($, wangEditor) {
	var getMailListUrl = 'http://localhost:8081/interface.do?type=get';
	// 配置信息
	var CONFIG = {
		PAGE_SIZE : 5,
		LIMIT : 3,
		demoData : {
			INBOX : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					subject : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:25',
					title : '测试邮件标题3',
					content : '测试邮件内容3<br>附件是您的录用OFFER， 请查收，谢谢<br><a href="http://www.baidu.com" target="_blank">点击这里</a><br>祝你好运',
					desc : '测试邮件内容描述3'
				},{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题4',
					content : '测试邮件内容4',
					desc : '测试邮件内容描述4'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题5',
					content : '测试邮件内容5<br>附件是您的录用OFFER， 请查收，谢谢<br><a href="http://www.baidu.com" target="_blank">点击这里</a><br>祝你好运',
					desc : '测试邮件内容描述5'
				}],
			SENDBOX : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				}],
			DRAFT : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				}],
			TRASH : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				}]
		}
	};

	var badgeListJson = {
		INBOX : 9,
		SENDBOX : 5,
		TRASH : 2,
		DRAFT : 7
	};

	// 邮件类型数据结构
	var BOX_TYPE = {
		SENDBOX : 0,
		DRAFT : 1,
		TRASH : 2,
		INBOX : 3
	};

	var $editor = null; // wangEditor实例
	var PASSWORD = 'overkazaf89)!!&'; // 测试邮件的密码， 联网测试时候再填写，不要merge这一行！

	function Mail () {};
	Mail.prototype = {
		constructor : Mail,
		send : function (data) {
			// 发送删除，直接调用接口
			sendMail(data);
		},
		del : function (id) {

			if (isArray(id)) {
				// 批量删除邮件, 也可只为数组传入一个邮件id进行删除
			} else {
				// 单独删除
			}
		},
		save : function (mail) {
			// 存入草稿箱，直接调用接口
		},
		moveTo : function (boxType) {
			// 0: send
			// 1: draft
			// 2: trash
		}
	};


	function getMailList () {
		return $.ajax({
			url : getMailListUrl,
			type : 'GET'
		})
	}

	function decorationMailContents (data) {
		return data;
		for (var i = 0, mail; mail = data[i++];) {
			var content  = '<br>发件日期' + mail.date;
				content += '<br>发件人：' + mail.from;
				content += '<br>收件人：' + mail.to;

			mail.content = content;
			mail.desc = content;
		}

		return data;
	}


	function MailApp (){};

	MailApp.prototype = {
		constructor : MailApp,
		init : function () {
			var that = this;
			this.mailer = new Mail();

			getMailList().done(function (data) {
				CONFIG.demoData['INBOX'] = decorationMailContents(data);
				badgeListJson.INBOX = data.length;

				that.initMails();
				that.bindEvents();
			});



			$editor = new wangEditor('toolbar');
			$editor.create();
		}, 
		initMails : function () {
			initBadges();
			initMailList(CONFIG.demoData.INBOX, BOX_TYPE.INBOX, 1, CONFIG.PAGE_SIZE);
			initMailPreview(CONFIG.demoData.INBOX, BOX_TYPE.INBOX, 1, CONFIG.PAGE_SIZE, 3);
		},
		bindEvents : function () {
			var $writeModal = $('#writeModal');
			$('#writeMail').on('click', function () {
				$writeModal.modal('show');

				// test
				if (!$writeModal.data('send-mail')) {
					$writeModal.data('send-mail', true);

					$('.send-mail').on('click', function () {
						var mailOption = constructMail($writeModal);

						if (!mailOption) {
							alert('请检查您的输入');
						} else {
							APP.getMailInstance().send(mailOption);

							$writeModal.modal('hide');
						}
					});
				}
			});

			var $viewModal = $('#viewModal');
			$(document).on('click', '.mail-detail', function (ev) {
				var $current = $(ev.currentTarget);
				var mailId = $current.attr('data-id');
				$viewModal.modal('show');

				var targetMail = fetchMailById(mailId);
				if (targetMail) {
					loadMail(targetMail, $viewModal);
				}

			});

			$(document).on('click', '.list-group-item', function (ev) {
				var $current = $(ev.currentTarget);
				$current.toggleClass('active');
			})

			$('#selectAll').on('click', function () {
				$('.mail-list').find('.list-group-item').addClass('active');
			});

			$('#cancelAll').on('click', function () {
				$('.mail-list').find('.list-group-item').removeClass('active');
			});

			$('.badge-list').on('click', 'li', function (ev) {
				var $current = $(ev.currentTarget);
				var currentType = $current.find('span').attr('data-type');
				$('.badge-list>li').removeClass('active');
				$current.addClass('active');

				initMailList(CONFIG.demoData[currentType], BOX_TYPE[currentType], 1, CONFIG.PAGE_SIZE);
				initMailPreview(CONFIG.demoData[currentType], BOX_TYPE[currentType], 1, CONFIG.PAGE_SIZE, 3);
			});

		},
		getMailInstance : function () {
			return this.mailer;
		}
	};

	/**
	 * [constructMail 构建邮件的数据结构]
	 * @param  {[type]} $ctx [模态窗口上下文]
	 * @return {[type]}      [description]
	 */
	function constructMail ($ctx) {
		var $title = $ctx.find('input[id="subject"]');
		var $to = $ctx.find('input[id="to"]');
		var $content = $('#toolbar');
		var mailTitle = $title.val();
		var mailTo = $to.val();
		var mailContent = $editor.$txt.html(); // 由wangEditor实例返回，可能有特殊字符，过滤下
		
		$('.error').removeClass('error');

		if (!mailTo) {
			$to.addClass('error');
			$to.focus();
			return null;
		}

		if (!mailTitle) {
			$title.addClass('error');
			$title.focus();
			return null;
		}

		if (!$editor.$txt.text()) {
			$('.wangEditor-container').addClass('error');
			$content.focus();
			return null;
		}
		// 最终的数据结构
		var mailOption = {
			title : mailTitle,
			from : '289202839@qq.com',
			to : mailTo,
			content : mailContent,
			date : new Date()

		};
		return mailOption;
	}

	/**
	 * [fetchMailList 获取邮件列表]
	 * @return {[type]} [description]
	 */
	function fetchMailList () {
		// 这里要连接服务器取得邮件信息，连接会因为网络的原因搞得太麻烦
		// 后台先用node接口/或静态数据模拟，最后拼装
		
		return badgeListJson
	}

	function initBadges () {
		var dataList = fetchMailList();

		var $badgeList = $('.badge-list');
		$badgeList.find('.badge[data-type="INBOX"]').text(dataList.INBOX);
		$badgeList.find('.badge[data-type="SENDBOX"]').text(dataList.SENDBOX);
		$badgeList.find('.badge[data-type="TRASH"]').text(dataList.TRASH);
		$badgeList.find('.badge[data-type="DRAFT"]').text(dataList.DRAFT);
	}


	/**
	 * [initMailList 分页显示邮件列表]
	 * @param  {[type]} list     [邮件列表]
	 * @param  {[type]} boxType  [邮件类型]
	 * @param  {[type]} pageNo   [当前页数]
	 * @param  {[type]} pageSize [显示条数]
	 * @return {[type]}          [description]
	 */
	function initMailList (list, boxType, pageNo, pageSize) {
		var $container = $('.mail-list');
		var tpl = '';
		for (var i = 0, mail; mail = list[i++];) {
			var str = mailTpl();
			var subject = mail.subject.join(',');

			subject = subject.length < 20 ? subject : subject.substring(0, 20) + '...';
			str = str.replace(/{{SUBJECT}}/g, subject);
			str = str.replace(/{{DESC}}/g, mail.desc);
			tpl += str;
		}
		$container.html(tpl);
	}


	/**
	 * [initMailPreview 邮件预览列表，这里只显示3个，不过接口预留出来]
	 * @param  {[type]} boxType  [邮件类型]
	 * @param  {[type]} pageNo   [当前页数]
	 * @param  {[type]} pageSize [显示条数]
	 * @param  {[type]} limit    [限制条数]
	 * @return {[type]}          [description]
	 */
	function initMailPreview (list, boxType, pageNo, pageSize, limit) {
		var $container = $('.mail-preview');
		var tpl = '';
		for (var i = 0, mail; i < CONFIG.LIMIT && (mail = list[i++]);) {
			var str = mailPreviewTpl();
			var subject = mail.subject.join(',');

			subject = subject.length < 20 ? subject : subject.substring(0, 20) + '...';
			str = str.replace(/{{SUBJECT}}/g, subject);
			str = str.replace(/{{CONTENT}}/g, mail.content);
			tpl += str;
		}
		$container.html(tpl);
	}


	/**
	 * [fetchMailById 根据邮件ID获取缓存数据]
	 * @param  {[type]} mailId [给定的邮件ID]
	 * @return {[type]}        [description]
	 */
	function fetchMailById (mailId) {
		var data = CONFIG.demoData;
		var ret;
		for (var attr in data) {
			var typeGroup = data[attr];
			var found = false;
			for (var i = 0, mail; mail = typeGroup[i++];) {
				if (mail.id == mailId) {
					found = true;
					ret = mail;
					break;
				}
			}

			if (found) break;
		}

		return ret;
	}

	/**
	 * [loadMail 在预览模态窗口中装载邮件]
	 * @return {[type]} [description]
	 */
	function loadMail (mail, $context) {
		$context.find('.mail-subject').text(mail.title);
		$context.find('.mail-sender').text(mail.from);
		$context.find('.mail-date').text(mail.date);
		$context.find('.mail-content').html(mail.content);
	}

	/**
	 * [sendMail 发送邮件]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function sendMail (data) {
		

	}


	/*==================================== 模板函数开始 ==============================================*/
	/**
     * [mailTpl 构建邮件预览列表的模板函数]
     * @return {[type]} [description]
     */
	function mailPreviewTpl () {
		var tpl = '<div class="panel panel-info"> \
                    <div class="panel-heading"> \
                        {{SUBJECT}} \
                        <a class="pull-right mail-detail" data-id="{{ID}}">详细</a> \
                    </div> \
                    <div class="panel-body"> \
                        {{CONTENT}} \
                    </div> \
                </div>';
        return tpl;
	}
    
    /**
     * [mailTpl 构建邮件列表的模板函数]
     * @return {[type]} [description]
     */
	function mailTpl () {
		var tpl = '<div class="list-group"> \
                        <a href="#" class="list-group-item"> \
                            <h4 class="list-group-item-heading">{{SUBJECT}}</h4> \
                            <p class="list-group-item-text">{{DESC}}</p> \
                        </a> \
                    </div>';
        return tpl;
	}
	/*==================================== 模板函数结束 ==============================================*/


	/*==================================== 工具类开始 ===============================================*/

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

	/*==================================== 工具类结束 ===============================================*/

	// 邮箱客户端实例初始化
	var APP = new MailApp();
	APP.init();

	return MailApp;
})(jQuery, wangEditor);