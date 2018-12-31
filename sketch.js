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
		constructor(x, y, w, h) {
			this.pos = p.createVector(x, y);
			this.size = p.createVector(w, h);

			this.stage = '';
		}

		show() {
			if (this.mouseIsHover()) {
				p.fill(0);
				p.stroke(150);
				p.game.currentCell = this;
			} else {
				p.noFill();
				p.stroke(70);
			}
			
			p.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

			if (this.stage != '') {
				var strWei = 3;

				p.noFill();
				p.strokeWeight(strWei);

				switch (this.stage) {
					case 'X':
						p.stroke(255, 0, 0);
						p.line(this.pos.x + strWei / 2, this.pos.y + strWei / 2, this.pos.x + this.size.x - strWei / 2, this.pos.y + this.size.y - strWei / 2);
						p.line(this.pos.x + this.size.x - strWei / 2, this.pos.y + strWei / 2, this.pos.x + strWei / 2, this.pos.y + this.size.y - strWei / 2);
						break;

					case 'O':
						p.stroke(0, 255, 0);
						p.ellipse(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x - strWei / 2, this.size.y - strWei / 2);
						break;
				}

				p.strokeWeight(1);
			}
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
			this.sizeCell = p.createVector(wCell, hCell);
			this.cells = [];

			this.createTable(rows, cols);
		}

		createTable(rows, cols) {
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					this.cells.push(new Cell(this.pos.x + j * this.sizeCell.x,
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
			if(this.currentCell && this.currentCell.stage == '') {
				this.currentCell.stage = this.currentMove;
				this.history.push(p.table.cells.indexOf(this.currentCell));

				if (this.currentMove == "X") this.currentMove = "O";
				else this.currentMove = "X";
				
				document.getElementById('luotdi').innerHTML = `<p style="display:inline; color: ` + (this.currentMove == "X" ? "#f00" : "#0f0") + `">` + this.currentMove + `</p>`;
			}
		}

		undo() {
			if(this.history.length) {
				var beforeMove = this.history.pop();
				p.table.cells[beforeMove].stage = '';
			}
		}
	}
}