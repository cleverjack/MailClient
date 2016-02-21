(function ($) {
	$(function () {
        init();
    });


	/**
	 *   手动实现一个状态机， 用于引导配置邮件代理服务器
	 *   prev, next方法可以抽出去， 后边做个封装
	 */

	var MailServerFSM = {
		"addMailServer" : {
			prevButtonPressed : function () {
				doNothing();
			},
			nextButtonPressed : function () {
				// 1. display setupMailServer modal panel
				
				// 2. update current status
				this.currentStatus = 'setupMailServer';
			}
		},
		"setupMailServer" : {
			prevButtonPressed : function () {
				
				this.currentStatus = 'addMailServer';
			},
			nextButtonPressed : function () {
				
				this.currentStatus = 'setupSendServer';
			}
		},
		"setupSendServer" : {
			prevButtonPressed : function () {
				
				this.currentStatus = 'setupMailServer';
			},
			nextButtonPressed : function () {
				
				this.currentStatus = 'setupRecvServer';
			}
		},
		"setupRecvServer" : {
			prevButtonPressed : function () {
				
			},
			nextButtonPressed : function () {
				
			}
		},
		"testConnection" : {
			prevButtonPressed : function () {
				
			},
			nextButtonPressed : function () {
				
			}
		}
	};



    function init () {
    	var $steps = $('.step');
        // $steps.hide();
        // $steps.first().show();

        var currentIndex = 0;

        $('.btn-next').click(function () {

        	
        });


        bindStepEvents();
    };


    /**
     * [doNothing 空函数， 啥也不干]
     * @return {[type]} [description]
     */
    function doNothing () {}

    function bindStepEvents () {

    }

})(jQuery);