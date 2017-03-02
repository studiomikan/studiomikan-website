// common.js

document.addEventListener('DOMContentLoaded', function() {

	// start 背景アニメ
	(function() {
		// 設定
		var color = 'rgba(255, 170, 1, 0.3)';
		var maxSize = 30;
		var minSize = 100;
		var circleNum = 15;
		var minSpeed = 0.1;
		var maxSpeed = 2;
		var bound = 0.2;

		// フィールド
		var canvas = null;
		var context = null;
		var circles = [];

		// 初期化
		var init = function() {
			canvas = document.getElementById('back-anim-canvas');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			context = canvas.getContext('2d');
		};

		// サークル情報を生成
		var createCircles = function() {
			for (var i = 0; i < circleNum; i++) {
				var c = {
					//x: canvas.width / 2,
					x: 125,
					y: canvas.height / 2 - 75,
					size: minSize + (maxSize - minSize) * Math.random(),
					angle: Math.PI * 2 * Math.random(),
					speed: minSpeed + (maxSpeed - minSpeed) * Math.random()
				};
				circles.push(c);
			}
		};

		// リサイズ時の動作の初期化
		var initOnResize = function() {
			var timer = null;
			window.addEventListener('resize', function() {
				if (timer === null) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(function() {
					canvas.width = window.innerWidth;
					canvas.height = window.innerHeight;
					console.log('resize: canvas ' + canvas.width + ',' + canvas.height);
					console.log('resize: canvas ' + window.innerWidth + ',' + window.innerHeight);
					timer = null;
				}, 200);
			});
		};

		// 描画する
		var draw = function() {
			// クリア
			context.beginPath();
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.closePath();
			for (var i = 0; i < circles.length; i++) {
				var c = circles[i];
				context.beginPath();
				context.fillStyle = color;
				context.arc(c.x, c.y, c.size, 0, Math.PI*2, false);
				context.fill();
				context.closePath();
			}
		};

		// サークルを移動させる
		var move = function() {
			var canvasWidth = canvas.width;
			var canvasHeight = canvas.height;
			for (var i = 0; i < circles.length; i++) {
				var c = circles[i];
				// 移動
				var moveX = c.speed * Math.cos(c.angle);
				var moveY = c.speed * Math.sin(c.angle);
				c.x += moveX;
				c.y += moveY;
				// 跳ね返り
				if (c.x <= 0 || canvasWidth <= c.x) {
					c.angle = Math.atan2(moveY, -moveX);
					c.x = c.x <= 0 ? 0 : canvasWidth;
				}
				if (c.y <= 0 || canvasHeight <= c.y) {
					c.angle = Math.atan2(-moveY, moveX);
					c.y = c.y <= 0 ? 0 : canvasHeight;
				}
			}
		};

		// タイマー開始
		var startTimer = function() {
			var requestAnimationFrame = 
				window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
			var loopFunc = function() {
				try {
					move();
					draw();
				} catch (e) {
					console.log(e);
				}
				requestAnimationFrame(loopFunc);
			};
			requestAnimationFrame(loopFunc);
		};

		init();
		createCircles();
		initOnResize();
		startTimer();
	})();
	// end 背景アニメ
});

