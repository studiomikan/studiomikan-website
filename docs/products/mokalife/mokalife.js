
var ml, mokalife;

/**
	Game of Life ~ Who Killed Okayu ~ 
	
	outher : okayu
	license : MIT License

	このアプリケーションは jQuery を使用しています。

	jQuery
	Copyright 2012 jQuery Foundation and other contributors
	http://jquery.com/

*/
function MokaLife(canvasName, params)
{
	// 変数初期化
	this.params = params;
	this.canvas = null;	// キャンバス
	this.context = null;
	this.canvasName = null;
	this.loopFlag = true;
	this.running = false;
	this.generation = 0;
	this.enabledGrid = true;
	this.enabledLoop = true;
	
	this.map = null;	// マップ配列 map[y][x]
	this.backmap = null;	// 裏マップ
	this.pen = null;	// ペン。 null なら鉛筆

	// パターンの取得と UI への登録
	this.patterns = new Patterns();
	this.initPenSettingsMenu();
	
	this.createCanvas(canvasName, params);
	this.initMap(params.hCellNum, params.vCellNum);
	this.initMouseEvent(canvasName);
	this.initFloatingWindow();
	this.initCanvasSettingMenu();

	$("#status").text("停止中");
	this.draw();
	this.log("ロード完了");
}
MokaLife.prototype = 
{
	/**
		マップ配列の初期化
		this.map と this.backmap を初期化する
		@param hnum 横の要素数
		@param vnum 縦の要素数
	*/
	initMap : function(hnum, vnum)
	{
		this.map = [];
		this.backmap = [];
		for(var i = 0; i < vnum; i++)
		{
			this.map[i] = [];
			this.backmap[i] = [];
			for(var j = 0; j < hnum; j++)
			{
				this.map[i][j] = 0;
				this.backmap[i][j] = 0;
			}
		}
		//this.assignPattern(1, 1, this.patterns.getByName("最小機関車").pattern);
		
	},
	
	/**
		マップの (x, y) の位置に指定のパターンを挿入
		@param x
		@param y
		@param pattern パターンの配列
	*/
	assignPattern : function(x, y, pattern)
	{
		if(pattern == undefined) return;
		
		var hnum = pattern[0].length;
		var vnum = pattern.length;
		
		for(var i = 0; i < hnum; i++)
		{
			for(var j = 0; j < vnum; j++)
			{
				if(pattern[j][i] != 0)
				{
					var x2 = (x + i) % this.params.hCellNum;
					var y2 = (y + j) % this.params.vCellNum;
					this.map[y2][x2] = pattern[j][i];
				}
			}
		}
	},
	
	/**
		マップの (x, y) の位置に指定の名前のパターンを挿入
		@param {Number} x 
		@param {Number} y
		@param {String} name パターン名
	*/
	assignPatternByName : function(x, y, name)
	{
		this.assignPattern(x, y, this.patterns.getByName(name).pattern);
		this.draw();
	},

	/**
		パターンを 90 度回転したものを返す
		@param pattern パターン
		@param right 右回りなら true。省略時 true 扱い
	*/
	rotatePattern : function(pattern, right)
	{
		var np = [];
		var xnum = pattern[0].length;
		var ynum = pattern.length;
		
		for(var i = 0; i < xnum; i++)
			np[i] = [];
		
		if(right == undefined || right)
		{
			for(var i = 0; i < xnum; i++)
			{
				for(var j = 0; j < ynum; j++)
					np[i][j] = pattern[ynum-1-j][i];
			}
		}
		else
		{
			for(var i = 0; i < xnum; i++)
			{
				for(var j = 0; j < ynum; j++)
					np[i][j] = pattern[j][xnum-1-i];
			}
		}
		return np;
	},

	/**
		パターンを反転したものを返す
		@param {Array} pattern パターン
		@param {Boolean} lr 左右反転なら true
	*/
	reversePattern : function(pattern, lr)
	{
		var np = [];
		var xnum = pattern[0].length;
		var ynum = pattern.length;

		if(lr == undefined) lr = true;
		
		if(lr === undefined || lr)
		{
			for(var i = 0; i < ynum; i++)
			{
				np[i] = [];
				for(var j = 0; j < xnum; j++)
					np[i][xnum-j-1] = pattern[i][j]
			}
		}
		else
		{
			for(var i = 0; i < ynum; i++)
			{
				var ynum2 = ynum - i - 1;
				np[ynum2] = [];
				for(var j = 0; j < xnum; j++)
					np[ynum2][j] = pattern[i][j]
			}
		}

		return np;
	},
	
	/**
		キャンバスを生成する
		@param canvasName キャンバスの ID
		@param params 設定値 
	 */
	createCanvas : function(canvasName, params)
	{
		this.canvasName = canvasName;
		this.canvas = document.getElementById(canvasName);
		this.canvasJO = $(this.canvas);
		this.canvasX = $("#" + canvasName).pageX;
		this.canvasY = $("#" + canvasName).pageY;
		this.context = this.canvas.getContext("2d");
		
		var width = params.cellWidth * params.hCellNum;
		var height = params.cellHeight * params.vCellNum;

		$("#" + canvasName).css("background-color", "black");
//			.css("border", "solid 1px #ff0000");
		this.setCanvasSize(width, height);
	},
	
	/**
		キャンバスのサイズを設定
		@param width 幅
		@param height 高さ
	*/
	setCanvasSize : function(width, height)
	{
		this.canvas.width = width;
		this.canvas.height = height;
	},
	
	/**
		デバッグ用ログを出力
		@param message メッセージ
	*/
	log : function(message)
	{
		$("#message").text(message);
		console.log(message);
	},
	
	/**
		ループ動作
		@param self 所属先のオブジェクト
	*/
	run : function(self)
	{
		this.generation++;
		
		this.evolve();
		this.draw();
	},
	
	/**
		世代を経る
	*/
	evolve : function()
	{
		for(var i = 0; i < this.params.hCellNum; i++)
		{
			for(var j = 0; j < this.params.vCellNum; j++)
				this.evolveCell(i, j);
		}
		// map と backmap を入れ替える
		var tmp = this.map;
		this.map = this.backmap;
		this.backmap = tmp;
	},
	
	/**
		セルの進化
		@param x x 座標
		@param y y 座標
	*/	
	evolveCell : function(x, y)
	{
		// カウント
		var count = 0;
		for(var i = -1; i <= 1; i++)
		{
			for(var j = -1; j <= 1; j++)
			{
				var x2 = x + i;
				var y2 = y + j;

				if(this.enabledLoop)
				{
					if(x2 < 0) x2 = this.params.hCellNum - 1;
					if(x2 >= this.params.hCellNum) x2 = 0;				
					if(y2 < 0) y2 = this.params.vCellNum - 1;
					if(y2 >= this.params.vCellNum) y2 = 0;
					if(this.map[y2][x2] != 0) count++;
				}
				else
				{
					if(x2 < 0 || x2 >= this.params.hCellNum || 
						y2 < 0 || y2 >= this.params.vCellNum)
						/* マップの範囲外なので何もしない */;
					else
						if(this.map[y2][x2] != 0) count++;
				}
			}
		}
		
		var life = 0;
		if(this.map[y][x] == 0)
		{
			// 誕生
			if(count == 3) life = 1;
		} 
		else
		{
			// 生存
			// count には自分自身のカウントも含まれているので、 3 or 4 で生存
			if (count == 3 || count == 4)
				life = this.map[y][x] + 1;
		}
		this.backmap[y][x] = life;
	},

	/** 描画 */
	draw : function()
	{
		var c = this.context;
		this.fillRect(c, 0, 0, this.canvas.width, this.canvas.height, "#ffffff");

		// グリッド
		this.drawGrid(c, "#dddddd", this.canvas.width, this.canvas.height);
		// セル
		this.drawCells(c, ["#87cfff", "#6ec5ff", "#54bbff"], this.map, this.params.hCellNum, this.params.vCellNum);
	},
	
	/**
		グリッドを描画
		@param c コンテキスト
		@param color 色
	*/
	drawGrid : function(c, color, width, height)
	{
		if(!this.enabledGrid) return;

		var x = 0, y = 0;
		for(var i = 0; i <= this.params.hCellNum; i++)
		{
			this.drawLine(c, x, 0, x, height, 1, color);
			x += this.params.cellWidth;
		}
		for(var i = 0; i <= this.params.vCellNum; i++)
		{
			this.drawLine(c, 0, y, width, y, 1, color);
			y += this.params.cellHeight;
		}
	},
	
	/**
		セルを描画
		@param c コンテキスト
		@param color 色
		@param cells セルのマップ
		@param hCellNum 横方向のセルの数
		@param vCellNum 縦方向のセルの数
	*/
	drawCells : function(c, color, cells, hCellNum, vCellNum)
	{
		if(cells == null) return;
		for(var i = 0; i < hCellNum; i++)
		{
			for(var j = 0; j < vCellNum; j++)
			{
				if(cells[j][i] != 0)
				{
					var x = this.params.cellWidth * i;
					var y = this.params.cellHeight * j;
					switch (cells[j][i])
					{
					case 1: this.paintCell(c, x, y, color[0]); break;
					case 2: this.paintCell(c, x, y, color[1]); break;
					default: this.paintCell(c, x, y, color[2]); break;
					}
				}
			}
		}
	},
	
	/**	
		セルを塗る
		@param {Context} c コンテキスト
		@param {Number} x x 座標
		@param {Number} y y 座標
		@param {String} color 色
	*/
	paintCell : function(c, x, y, color)
	{
		this.fillRect(c, x, y, 
			this.params.cellWidth, this.params.cellHeight, color);
	},
	
	/**
		矩形塗りつぶし
		@param {Context} c コンテキスト
		@param {Number} x x 座標
		@param {Number} y y 座標
		@param width 幅
		@param height 高さ
		@param {String} color 色
	*/
	fillRect : function(c, x, y, width, height, color)
	{
		c.beginPath();
		c.fillStyle = color;
		c.fillRect(x, y, width, height);
		c.closePath();
	},
	
	/**
		線を引く
		@param c コンテキスト
		@param x1 始点 x 座標
		@param y1 始点 y 座標
		@param x2 終点 x 座標
		@param y2 終点 y 座標
		@param width 線の太さ
		@param color 線の色
	*/
	drawLine : function(c, x1, y1, x2, y2, width, color)
	{
		c.beginPath();
		c.strokeStyle = color;
		c.lineWidth = width;
		c.moveTo(x1, y1);
		c.lineTo(x2, y2);
		c.closePath();
		c.stroke();
	},
	
	/**
		次のループをセットする
		@param t 誤差
	*/
	nextLoop : function(t)
	{
		var self = this;
		this.drawTimer = setTimeout(function(){
			if(self.loopFlag)
			{
				var start = new Date();
				self.run(self);
				self.nextLoop(new Date() - start);
			}
		}, this.params.frame - t);
	},
	
	/** 開始する */
	start : function()
	{
		if(this.running) return;
		
		this.log("繁殖、繁殖ゥ！");
		this.loopFlag = true;
		this.running = true;
		this.nextLoop(this.params.frame);
		$("#status").html("再生中");
	},
	
	/** 停止する */
	stop : function()
	{
		this.log("停止しました。");
		this.loopFlag = false;
		this.running = false;
		$("#status").html("停止中");
	},
	
	/** クリアする */
	clear : function()
	{
		if(this.running)
			this.stop();
		
		for(var i = 0; i < this.params.hCellNum; i++)
		{
			for(var j = 0; j < this.params.vCellNum; j++)
				this.map[j][i] = 0;
		}
		this.draw();
	},
	
	/** キャンバスクリック時のイベント初期化 */
	initMouseEvent : function(canvasName)
	{
		var c = $("#" + canvasName);
		var self = this;
		var width = this.canvas.width;
		var height = this.canvas.height;
		
		$("body").click(function(event){
			var x = event.pageX;
			var y = event.pageY;
			var cjo = $("#gamecanvas").offset();
			var x2 = x - cjo.left;
			var y2 = y - cjo.top;
			if(0 <= x2 && x2 < self.canvas.width && 0 <= y2 && y2 < self.canvas.height)
				self.onMouseUpOnCanvas(x2 , y2);
		});
		
		$("body").mousemove(function(event){
			if(self.pen == null) return;
			var x = event.pageX;
			var y = event.pageY;
			var cjo = $("#gamecanvas").offset();
			var x2 = x - cjo.left;
			var y2 = y - cjo.top;
			if(0 <= x2 && x2 < self.canvas.width && 0 <= y2 && y2 < self.canvas.height)
			{
				var xpos = Math.floor(x2 / self.params.cellWidth);
				var ypos = Math.floor(y2 / self.params.cellHeight);
				if(xpos != self.floatingX || ypos != self.floatingY)
				{
					self.floatingX = xpos;
					self.floatingY = ypos;
					self.floating.css("display", "block");
					self.moveFloatingWindow(
						cjo.left + xpos*self.params.cellWidth, 
						cjo.top + ypos*self.params.cellHeight);
				}
			}
		});
	},
	
	/** キャンバス内部での、マウスクリック時のイベント */
	onMouseUpOnCanvas : function(x, y)
	{
		var xpos = Math.floor(x / this.params.cellWidth);
		var ypos = Math.floor(y / this.params.cellHeight);

		if(this.pen == null)
		{
			if(this.map[ypos][xpos] == 1)
				this.map[ypos][xpos] = 0;
			else
				this.map[ypos][xpos] = 1;
		}
		else
		{
			var p = this.pen;
			this.assignPattern(xpos, ypos, p);
		}
		this.draw();
	},
	
	/** ペンをリセットし、鉛筆にする */
	resetPen : function()
	{
		this.pen = null;
		this.floating.css("display", "none");
	},
		
	/** フローティングウィンドウの初期設定 */
	initFloatingWindow : function()
	{
		this.floating = $("#floating");
		this.floatingCanvas = this.floating[0];
		this.floatingContext = this.floatingCanvas.getContext("2d");
		this.floating.css({
			position : "absolute",
			margin : 0,
			padding : 0,
			"z-index" : 100,
			left : 200,
			top : 200,
			display : "none",
		});
		this.floating[0].width = 0;
		this.floating[0].height = 0;
		this.floatingX = 0;
		this.floatingY = 0;
	},
	
	/**
		フローティングウィンドウの移動
		@param x x 座標
		@param y y 座標
	*/
	moveFloatingWindow : function(x, y)
	{
		this.floating.css({
			left : x,
			top : y,
		});
	},
	
	/** フローティングウィンドウに描画する。サイズも自動的に変更される。 */
	drawFloatingWindow : function()
	{
		if(this.pen == null) return;

		var p = this.pen;
		var f = this.floating;
		var fctx = this.floatingContext;
		var width = p[0].length;
		var height = p.length;
		
		var canvasWidth = width * this.params.cellWidth;
		var canvasHeight = height * this.params.cellHeight;
		
		f[0].width = canvasWidth;
		f[0].height = canvasHeight;
		f.css({
			background : "#00000000",
			border : "dashed 1px #aaaaaa",
			display : "block",
		});
		
		fctx.clearRect(0, 0, canvasWidth, canvasHeight);
		this.drawCells(fctx, ["#646464"], p, width, height);
	},

	/** ペン設定を初期化する */
	initPenSettingsMenu : function()
	{
		var self = this;
		
		// 種別をクリックしたときの動作
		var onClickType = function()
		{
//			self.log($(this).data("name"));
			var thiselm = $(this);
			var name = thiselm.data("name");
			var length = thiselm.data("length");
			var box = $("#ml_box_patterns_" + name);
			var display = box.css("display");

			$("#pensettings div").slideUp(200);
			
			// クリックされた要素以下を開く or 閉じる
			if(display == "block") box.slideUp(200);
			else box.slideDown(200);
		};
		
		// パターンを追加する
		var addPatternLink = function(owner, pattern)
		{
			if(pattern == undefined) return;

			var name = pattern.name;
			
			var clickFunc = function(){
				self.onClickPattern(name);
			};
			
			var link = $("<a>")
				.html(name)
				.attr("href", "#")
				.data("name", name)
				.click(clickFunc);
			owner.append(link);
			owner.append($("<br>"));
		};
		
		var owner = $("#pensettings");
		owner.append($("<h3>").html("ペン設定"));

		// 回転など
		owner.append($("<input>")
			.attr({
				type : "button",
				value : " リセット ",
			})
			.click(function(){
				$("#pensettings div").slideUp(200);
				self.resetPen();
			}));
		owner.append($("<input>")
			.attr({
				type : "button",
				value : " 回転 ",
			})
			.click(function(){
				if(self.pen == null) return;
				self.pen = self.rotatePattern(self.pen);
				self.drawFloatingWindow();
			}));
		owner.append($("<input>")
			.attr({
				type : "button",
				value : " 反転 ",
			})
			.click(function(){
				if(self.pen == null) return;
				self.pen = self.reversePattern(self.pen);
				self.drawFloatingWindow();
			}));
		owner.append($("<br>"));
		
		// ペンタイプ
		var typeList = this.patterns.getTypeList();
		for(var i = 0; i < typeList.length; i++)
		{
			var type = typeList[i];
			var patterns = this.patterns.getByType(type);

			var typeLink = $("<a>")
				.html("■" + type + "...")
				.data("name", type)
				.data("length", patterns.length)
				.attr({
					href : "#", id : "ml_link_type_" + type
				})
				.click(onClickType);
			owner.append(typeLink);
			owner.append($("<br>"));

			var patternBox = $("<div>")
				.css({
					"border-left" : "solid 1px #818181",
					"margin-left" : "0.45em",
					"padding" : "0 0 0 5px",
					"width" : "300px",
					display : "none",
				})
				.attr({
					id : "ml_box_patterns_" + type,
					"class" : "ml_box_patterns_class",
				})
				.data("name", type);
			owner.append(patternBox);
			for(var j = 0; j < patterns.length; j++)
				addPatternLink(patternBox, patterns[j]);
		}
	},

	/**
		パターンが選択された時 
		@param clickedName クリックされた要素の名前
	*/
	onClickPattern : function(clickedName)
	{
//		this.log("onClickPattern");
		var pattern = this.patterns.getByName(clickedName);
		this.log("ペン選択:" + clickedName + " " + pattern.type);
		if(pattern != undefined)
		{
			this.pen = pattern.pattern;
			this.drawFloatingWindow();
			
			var co = $("#gamecanvas").offset();
			this.moveFloatingWindow(co.left-1, co.top-1);
		}
		else
			this.log("エラー at onClickPattern");
	},

	/** キャンバス設定を初期化する */
	initCanvasSettingMenu : function()
	{
		var top = $("#canvassettings");
		var self = this;

		var addItem = function(owner, name, input)
		{
			owner.append($("<span>").html(name).css("float", "left"));
			owner.append(input.css("float", "right"));
			owner.append($("<br>").css("clear", "right"));
		};

		var getIntValue = function(elm)
		{
			elm = $(elm);
			var max = parseInt(elm.attr("max"));
			var min = parseInt(elm.attr("min"));
			var _val = elm.val();
			var val;
			if(_val == "") val = min;
			else val = parseInt(_val);

			if(val > max) val = max;
			if(val < min) val = min;
			elm.attr("value", val);
			return val;
		};

		top.append($("<h3>").html("キャンバス設定"));

		addItem(top, "セルの幅:", $("<input>")
			.attr({
				value : "" + this.params.cellWidth,
				type : "number",
				max: "50",
				min: "1",
			})
			.change(function(){
				self.onChangeCellWidth(parseInt($(this).val()));
			})
		);

		addItem(top, "セルの高さ:", $("<input>")
			.attr({
				value : "" + this.params.cellHeight,
				type : "number",
				max: "50",
				min: "1",
			})
			.change(function(){
				self.onChangeCellHeight(parseInt($(this).val()));
			})
		);

		addItem(top, "セルの数(横)", $("<input>")
			.attr({
				value : "" + this.params.hCellNum,
				type : "number",
				max : "1000",
				min : "5",
			})
			.change(function(){
				self.onChangeHorizontalCellNum(getIntValue(this));
			})
		);

		addItem(top, "セルの数(縦)", $("<input>")
			.attr({
				value : "" + this.params.hCellNum,
				type : "number",
				max : "1000",
				min : "5",
			})
			.change(function(){
				var thiz = $(this);
				self.onChangeVerticalCellNum(getIntValue(this));
			})
		);

		addItem(top, "フレーム時間(ms):", $("<input>")
			.attr({
				value : "" + this.params.frame,
				type : "number",
				max: "2000",
				min: "16",
			})
			.change(function(){
				self.params.frame = parseInt($(this).val());
			})
		);

		var gridSwitch = $("<div>").css({padding : "5px 0"});

		addItem(gridSwitch, "グリッド表示", this.getToggleSwitch(function(state){
				if(state == "off") self.enabledGrid = false;
				else self.enabledGrid = true;
				self.draw();
			}, "on"));
		top.append(gridSwitch);

		var loopSwitch =$("<div>").css({padding : "5px 0"});
		addItem(loopSwitch, "端でループ", this.getToggleSwitch(function(state){
				if(state == "off") self.enabledLoop = false;
				else self.enabledLoop = true;
			}, "on"));
		top.append(loopSwitch);
	},	

	/**
		セルの幅が変更されたとき
		@param width 新しい幅
	*/
	onChangeCellWidth : function(width)
	{
		var height = this.params.cellHeight;
		this.setCellSize(width, height);
	},

	/**
		セルの高さが変更されたとき
		@param height 新しい高さ
	*/
	onChangeCellHeight : function(height)
	{
		var width = this.params.cellWidth;
		this.setCellSize(width, height);
	},

	/**
		セルのサイズを変更する
		@param width 幅
		@param height 高さ
	*/
	setCellSize: function(width, height)
	{
		var c = this.canvas;
		c.width = width * this.params.hCellNum;
		c.height = height * this.params.vCellNum;

		this.params.cellWidth = width;
		this.params.cellHeight = height;

		this.draw();
		this.drawFloatingWindow();
	},

	/**
		セルの横の数が変わった時
		@param {Number} hCellNum 数
	*/
	onChangeHorizontalCellNum : function(hCellNum)
	{
		this.setCellNum(hCellNum, this.params.vCellNum);
	},

	/**
		セルの縦の数が変わった時
		@param {Number} vCellNum
	*/
	onChangeVerticalCellNum : function(vCellNum)
	{
		this.setCellNum(this.params.hCellNum, vCellNum);
	},

	/**
		セルの数を設定
		@param {Number} hCellNum 
		@param {Number} vCellNum
	*/
	setCellNum : function(hCellNum, vCellNum)
	{
		var c = this.canvas;

		c.width = this.params.cellWidth * hCellNum;
		c.height = this.params.cellHeight *vCellNum;

		this.params.hCellNum = hCellNum;
		this.params.vCellNum = vCellNum;

		this.initMap(hCellNum, vCellNum);

		this.draw();
	},

	/**
		トグルスイッチを設置する
		@param {Function} onClick クリック時の動作
		@param {String} state on または false
	*/
	getToggleSwitch : function(onClick, state)
	{
		var self = this;

		var toOn = function()
		{
			div.data("state", "on");
			text.html("ON").css({
				"background-color" : "#0094ff",
				"color" : "white",
			});
			text.animate({
				"marginLeft" : "0px",
			}, 200);
		};

		var toOff = function()
		{
			div.data("state", "off");
			text.html("OFF").css({
				"background-color" : "#646464",
				"color" : "#dddddd",
			});
			text.animate({
				"marginLeft" : "45px",
			}, 200);
		};

		var toCannotSelect = function(elm)
		{
			elm.css({
				"user-select" : "none",
				"-webkit-user-select" : "none",
				"-moz-user-select" : "none",
				"-khtml-user-select" : "none",
			});
			elm.attr("unselectable", "on");
			return elm;
		};

		var onClickSwitch = function()
		{
			var state = div.data("state");
			if(state == "off")
			{
				toOn();
				onClick("on");
			}
			else
			{
				toOff();
				onClick("off");
			}
		};

		var div = $("<div>")
			.css({
//				height : "20px",
				width : "90px",
				"background-color" : "#cccccc",
			})
			.data("state", "off")
			.click(function(){
				onClickSwitch();
			});
		div = toCannotSelect(div);

		var text = $("<span>")
			.css({
				"float" : "left",
				"background-color" : "#ffffff",
				"color" : "#ffffff",
				"user-select" : "none",
				"width" : "45px",
//				"height" : "20px",
				"padding": "1px",
				"text-align" : "center",
			})
			.bind("selectstart", function(){ return false; })
			.html("ON");
		text = toCannotSelect(text);

		div.append(text);

		if(state == "on") toOn();
		else toOff();

		return div;
	},
};


// エントリ
$(function(){

	ml = mokalife= new MokaLife("gamecanvas", {
		cellWidth : 10,
		cellHeight : 10,
		hCellNum : 50,
		vCellNum : 50,
		frame : 50,	// １代の時間
	});
	
	$("#start").click(function(){
		ml.start();
	});
	$("#stop").click(function(){
		ml.stop();
	});
	$("#clear").click(function(){
		ml.clear();
	});

	ml.assignPatternByName(1, 1, "最小機関車");
});


