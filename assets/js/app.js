;define(function (require) {
	

	var MailApp = {
		init : function () {
			
			console.log('app is initial');
			this.bindEvents();
		}, 
		bindEvents : function () {
			var $viewModal = $('#viewModal');
			$('#writeMail').on('click', function () {
				$viewModal.modal('show');

			});

			var editor = new wangEditor('toolbar');
			editor.create();
			console.log('wangEditor', editor);
		}
	};



	return MailApp;
});