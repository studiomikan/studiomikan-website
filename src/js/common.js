// common.js
$(function() {
	// PJAX設定
	(function() {
		$.pjax({
			area: '#global-content-wrapper',
			link: 'a.pjax-link',
			ajax: { timeout: 10000 },
			load: { script: false }
		});
		$(document).on('pjax:fetch', function() {
			// pjaxのページ遷移が行われる前
			alert('pjax!');
		});
		$(document).on('pjax:render', function() {
			// pjaxのページ遷移が完了した後
			onResize();
		});
	})();
	// メニューボタン
	(function() {
		var button = $('header button.menu');
		var target = $(button.attr('target'));
		var win = $(window);
		button.on('click', function() {
			target.animate({
				height: 'toggle'
			}, 200);
		});
		win.on('resize', function() {
			if (win.width() > 800) target.show();
		});
	})();
});

