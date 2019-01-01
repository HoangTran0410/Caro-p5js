var caro = function (p) {
	p.table;
	p.game;

	p.reset = function (cols, rows, firstmove) {
		var wCell = p.width / cols;
		var hCell = p.height / rows;

		p.table = new Table(0, 0, rows, cols, wCell, hCell);
		p.game = new Game(firstmove);
	}

	p.setup = function () {
		p.createCanvas(900, 600);
		p.rectMode(p.CORNER); // all position is CORNER , top-left

		p.reset(30, 20, 'O');
	}

	p.draw = function () {
		p.background(30, 100);
		p.table.run();
	}

	p.mouseClicked = function () {
		if (p.mouseIsInside(0, p.height, 0, p.width)) {
			p.game.move();
		}
	}

	p.mouseIsInside = function (top, bottom, left, right) {
		return p.mouseX > left && p.mouseX < right && p.mouseY > top && p.mouseY < bottom;
	}

	// ======================== Classes Js ===============================
	class Cell {
		constructor(id, x, y, w, h) {
			this.id = id;
			this.pos = p.createVector(x, y);
			this.size = p.createVector(w, h);

			this.stage = '';
			this.hightlight = false;
		}

		show() {
			if (this.mouseIsHover()) {
				p.game.currentCell = this;
				if (this.stage == '') {
					var c = p.game.currentMove;
					var col = (c == "X" ? "#700" : "#070");
					this.print(c, col, 3);
				}

			}

			if (this.hightlight) {
				p.fill(100);

			} else {
				p.noFill();
				p.stroke(60);
			}

			p.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

			if (this.stage != '') {
				switch (this.stage) {
					case 'X':
						this.print('X', [255, 0, 0], 3);
						break;

					case 'O':
						this.print('O', [0, 255, 0], 3);
						break;
				}
			}
		}

		print(char, col, strWei) {
			p.noFill();
			p.strokeWeight(strWei);

			var del = strWei * 2;
			if (char == 'X') {
				p.stroke(col);
				p.line(this.pos.x + del, this.pos.y + del, this.pos.x + this.size.x - del, this.pos.y + this.size.y - del);
				p.line(this.pos.x + this.size.x - del, this.pos.y + del, this.pos.x + del, this.pos.y + this.size.y - del);
			} else {
				p.stroke(col);
				p.ellipse(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x - del, this.size.y - del);
			}
			p.strokeWeight(1);
		}

		mouseIsHover() {
			return (p.mouseX > this.pos.x &&
				p.mouseX < this.pos.x + this.size.x &&
				p.mouseY > this.pos.y &&
				p.mouseY < this.pos.y + this.size.y)
		}

		run() {
			this.show();
		}
	}

	class Table {
		constructor(x, y, rows, cols, wCell, hCell) {
			this.pos = p.createVector(x, y);
			this.size = p.createVector(cols, rows);
			this.sizeCell = p.createVector(wCell, hCell);
			this.cells = [];

			this.createTable(rows, cols);
		}

		createTable(rows, cols) {
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					this.cells.push(new Cell(p.createVector(j, i), this.pos.x + j * this.sizeCell.x,
						this.pos.y + i * this.sizeCell.y,
						this.sizeCell.x,
						this.sizeCell.y));
				}
			}
		}

		getCellAt(x, y) {
			if (x < 0 || x > this.size.x || y < 0 || y > this.size.y) return false;
			return this.cells[y * this.size.x + x];
		}

		run() {
			for (var c of this.cells) {
				c.run();
			}
		}
	}

	class Game {
		constructor(firstMove) {
			this.currentMove = firstMove;
			this.history = [];
			this.currentCell;
		}

		move() {
			if (this.currentCell && this.currentCell.stage == '') {
				this.currentCell.stage = this.currentMove;
				this.history.push(this.currentCell.id);
				this.changePlayer();

				// remove old hightlight
				var oldpos = this.history[this.history.length - 2];
				if (oldpos) p.table.getCellAt(oldpos.x, oldpos.y).hightlight = false;

				// add new hightlight 
				var pos = this.history[this.history.length - 1];
				if (pos) p.table.getCellAt(pos.x, pos.y).hightlight = true;

				// check win
				if (this.checkWin(this.currentCell, p.table)) {
					console.log(this.currentCell.stage + ' Win.');
				}
			}
		}

		changePlayer() {
			if (this.currentMove == "X") this.currentMove = "O";
			else this.currentMove = "X";
		}

		undo() {
			if (this.history.length) {
				var id = this.history.pop();
				p.table.getCellAt(id.x, id.y).stage = '';
				this.changePlayer();
			}
		}

		checkWin(cell, tableCaro) {
			var from, to;
			var count;

			// ============ check chieu ngang =============
			count = -1; // bù cho 2 lần cộng stage của cell ở 2 for

			// count to left
			from = cell;
			while (from.stage == cell.stage) {
				count++;
				from = tableCaro.getCellAt(from.id.x - 1, from.id.y);
			}

			// count to right
			to = cell;
			while (to.stage == cell.stage) {
				count++;
				to = tableCaro.getCellAt(to.id.x + 1, to.id.y);
			}

			if (count == 5) {
				for (var i = 1; i <= 5; i++) {
					tableCaro.getCellAt(from.id.x + i, from.id.y).hightlight = true;
				}
				return true;
			}

			// ============ check chieu doc ============
			count = -1;

			// count to top
			from = cell;
			while (from.stage == cell.stage) {
				count++;
				from = tableCaro.getCellAt(from.id.x, from.id.y - 1);
			}

			// count to right
			to = cell;
			while (to.stage == cell.stage) {
				count++;
				to = tableCaro.getCellAt(to.id.x, to.id.y + 1);
			}

			if (count == 5) {
				for (var i = 1; i <= 5; i++) {
					tableCaro.getCellAt(from.id.x, from.id.y + i).hightlight = true;
				}
				return true;
			}

			// ============ check cheo trai sang phai ============
			count = -1;

			// count to top-left
			from = cell;
			while (from.stage == cell.stage) {
				count++;
				from = tableCaro.getCellAt(from.id.x - 1, from.id.y - 1);
			}

			// count to right-bottom
			to = cell;
			while (to.stage == cell.stage) {
				count++;
				to = tableCaro.getCellAt(to.id.x + 1, to.id.y + 1);
			}

			if (count == 5) {
				for (var i = 1; i <= 5; i++) {
					tableCaro.getCellAt(from.id.x + i, from.id.y + i).hightlight = true;
				}
				return true;
			}

			// ============ check cheo phai sang trai ============
			count = -1;

			// count to top-right
			from = cell;
			while (from.stage == cell.stage) {
				count++;
				from = tableCaro.getCellAt(from.id.x + 1, from.id.y - 1);
			}

			// count to bottom-left
			to = cell;
			while (to.stage == cell.stage) {
				count++;
				to = tableCaro.getCellAt(to.id.x - 1, to.id.y + 1);
			}

			if (count == 5) {
				for (var i = 1; i <= 5; i++) {
					tableCaro.getCellAt(from.id.x - i, from.id.y + i).hightlight = true;
				}
				return true;
			}
			return false;
		}
	}
}