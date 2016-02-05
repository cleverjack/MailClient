;define(function (require) {

	window.DEBUG_LEVEL = 0;

	var utils = {
		log : function () {
			switch (window.DEBUG_LEVEL) {
				case 0:
					console.log(arguments);
					break;

				default;
			}
		}
	};


	return utils;

});