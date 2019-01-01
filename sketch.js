var caro = function (p) {
	p.table;
	p.cols = 30;
	p.rows = 20;
	p.game;

	p.setup = function () {
		p.createCanvas(900, 600);
		p.rectMode(p.CORNER); // all position is CORNER , top-left

		var wCell = p.width / p.cols;
		var hCell = p.height / p.rows;
		p.table = new Table(0, 0, p.rows, p.cols, wCell, hCell);
		p.game = new Game('O');
	}

	p.draw = function () {
		p.background(30);
		p.table.run();
	}

	p.mousePressed = function () {
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
		}

		show() {
			if (this.mouseIsHover()) {
				p.game.currentCell = this;

				if(this.stage == '') {
					var c = p.game.currentMove;
					var col = (c=="X"?"#700":"#070");
					this.print(c, col, 3);
				}

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
			if(char == 'X') {
				p.stroke(col);
				p.line(this.pos.x + strWei / 2, this.pos.y + strWei / 2, this.pos.x + this.size.x - strWei / 2, this.pos.y + this.size.y - strWei / 2);
				p.line(this.pos.x + this.size.x - strWei / 2, this.pos.y + strWei / 2, this.pos.x + strWei / 2, this.pos.y + this.size.y - strWei / 2);
			} else {
				p.stroke(col);
				p.ellipse(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x - strWei / 2, this.size.y - strWei / 2);
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
					this.cells.push(new Cell(p.createVector(i, j), this.pos.x + j * this.sizeCell.x,
						this.pos.y + i * this.sizeCell.y,
						this.sizeCell.x,
						this.sizeCell.y));
				}
			}
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
			}
		}

		changePlayer() {
			if (this.currentMove == "X") this.currentMove = "O";
			else this.currentMove = "X";
		}

		undo() {
			if (this.history.length) {
				var id = this.history.pop();
				var beforeMove = id.x*p.table.size.x + id.y;
				p.table.cells[beforeMove].stage = '';
				this.changePlayer();
			}
		}
	}
}