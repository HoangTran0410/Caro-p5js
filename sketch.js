var caro = function (p) {
	p.table;
	p.rows = 20;
	p.cols = 20;

	p.currentCell;
	p.pre = "X";

	p.setup = function () {
		p.createCanvas(650, 650);
		p.rectMode(p.CORNER); // all position is CORNER , top-left

		var wCell = p.width / p.rows;
		var hCell = p.height / p.cols;
		table = new Table(0, 0, p.rows, p.cols, wCell, hCell);

		p.nextMove();
	}

	p.draw = function () {
		p.background(30);

		table.run();
	}

	p.mousePressed = function () {
		if (p.currentCell && p.mouseIsInside(0, p.height, 0, p.width)) {
			if (p.currentCell.stage == '') {
				p.currentCell.stage = (p.pre == "X" ? "O" : "X");
				p.nextMove();
			}
		}
	}

	p.mouseIsInside = function (top, bottom, left, right) {
		return p.mouseX > left && p.mouseX < right && p.mouseY > top && p.mouseY < bottom;
	}

	p.nextMove = function () {
		document.getElementById('luotdi').innerHTML = `<p style="display:inline; color: ` + (p.pre == "X" ? "#f00" : "#0f0") + `">` + p.pre + `</p>`;
		if (p.pre == "X") p.pre = "O";
		else p.pre = "X";
	}

	// ======================== DOM html ==============================



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
				p.currentCell = this;
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

	class Player {
		constructor() {

		}
	}
}