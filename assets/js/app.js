;define(function (require) {
	var MailApp = {
		init : function () {
			console.log('app is initial');
			this.bindEvents();
		}, 
		bindEvents : function () {
			$('#writeMail').on('click', function () {
				$('#viewModal').modal('show');
			});
		}
	};



	return MailApp;
});