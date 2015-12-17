// common.js
$(function() {
	// 揃える処理など
	// PJAX設定
	(function() {
		$.pjax({
			area: '#center-block',
			link: 'a.pjax-link',
			ajax: { timeout: 10000 },
			load: { script: false }
		});
		$(document).on('pjax:fetch', function() {
			// pjaxのページ遷移が行われる前
		});
		$(document).on('pjax:render', function() {
			// pjaxのページ遷移が完了した後
			onResize();
		});
	})();
});

