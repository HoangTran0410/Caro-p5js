var caro = function (p) {
    p.setup = function () {
        p.createCanvas(30 * 30, 20 * 30);
        p.pixelDensity(1);

        applyTheme("dark");
        addToSelect();

        game = new CaroTable(20, 30, 30);
        // socket = new SocketIO("http://localhost:8080");
    }

    p.draw = function () {
        p.background(theme.canvas_bg_color);
        game.run();
    }

    p.mouseClicked = function () {
        game.clicked();
    }

    class CaroTable {
        constructor(rows, cols, cSize) {
            this.pos = {
                x: 0,
                y: 0
            }; // corner position
            this.rows = rows;
            this.cols = cols;
            this.cellSize = cSize;
            this.gra = p.createGraphics(cols * cSize, rows * cSize);
            this.tableData = [];
            this.history = [];

            this.drawGrid();
            this.resetData();
        }

        createTable(rows, cols, cSize) {
            this.rows = rows;
            this.cols = cols;
            this.cellSize = cSize;
            this.gra.resizeCanvas(this.cols * this.cellSize, this.rows * this.cellSize);
            this.drawGrid();
            this.resetData();
        }

        resetData() {
            for (var y = 0; y < this.rows; y++) {
                var s = [];
                for (var x = 0; x < this.cols; x++) {
                    s.push(' ');
                }
                this.tableData.push(s);
            }
        }

        reset() {
            this.history = [];
            this.createTable(this.rows, this.cols, this.cellSize);
            this.resetData();
        }

        drawGrid() {
            this.gra.clear();
            this.gra.background(theme.table_bg_color);
            this.gra.stroke(theme.table_stroke_color);
            for (var x = -.5; x < this.gra.width; x += this.cellSize) {
                this.gra.line(x, 0, x, this.gra.height);
            }
            for (var y = -.5; y < this.gra.height; y += this.cellSize) {
                this.gra.line(0, y, this.gra.width, y);
            }
        }

        drawData() {
            for (var d of this.history) {
                this.printChar(d.data, d.col, d.row);
            }
        }

        getDataAt(x, y) {
            if (this.tableData[y]) return this.tableData[y][x];
            return '';
        }

        setDataAt(col, row, data) {
            this.tableData[row][col] = data;
            if (data != ' ') {
                this.printChar(data, col, row);
            }
        }

        getIndexCellAt(posx, posy) {
            var col = p.floor(posx / this.cellSize);
            var row = p.floor(posy / this.cellSize);

            if (col < 0 || col >= this.cols) col = -1;
            if (row < 0 || row >= this.rows) row = -1;

            return {
                "col": col,
                "row": row
            };
        }

        getCellAtPos(posx, posy) {
            var index = this.getIndexCellAt(posx, posy);
            return this.getCellAtIndex(index.col, index.row);
        }

        getPosCellAt(col, row) {
            return {
                "x": col * this.cellSize,
                "y": row * this.cellSize
            }
        }

        getCellAtIndex(col, row) {
            return {
                "x": col * this.cellSize,
                "y": row * this.cellSize,
                "data": this.getDataAt(col, row)
            };
        }

        switchChat(char) {
            return (char == 'X' ? 'O' : 'X');
        }

        getPreMove() {
            return this.history[this.history.length - 1];
        }

        clicked() {
            var index = this.getIndexCellAt(p.mouseX, p.mouseY);
            if (index.col != -1 && index.row != -1) {
                if (this.getDataAt(index.col, index.row) == ' ') {
                    var preMove = this.getPreMove();
                    if (!preMove) preMove = {
                        data: 'X'
                    };

                    var nextChar = this.switchChat(preMove.data);
                    this.setDataAt(index.col, index.row, nextChar);
                    this.history.push({
                        col: index.col,
                        row: index.row,
                        data: nextChar
                    });
                }
            }
        }

        undo() {
            if (this.history.length) {
                var preMove = this.history.pop();
                this.setDataAt(preMove.col, preMove.row, ' ');
                this.drawGrid();
                this.drawData();
            }
        }

        show() {
            p.image(this.gra, 0, 0, p.width, p.height);
        }

        showMousePos() {
            var cell = this.getCellAtPos(p.mouseX, p.mouseY);
            p.fill(theme.cell_hover_bg_color);
            p.stroke(theme.cell_hover_stroke_color);
            p.rect(cell.x, cell.y, this.cellSize, this.cellSize);

            var index = this.getIndexCellAt(p.mouseX, p.mouseY);
            if (index.col != -1 && index.row != -1) {
                var left = cell.x - index.col * this.cellSize,
                    right = cell.x + (this.cols - index.col) * this.cellSize,
                    top = cell.y - index.row * this.cellSize,
                    bottom = cell.y + (this.rows - index.row) * this.cellSize;
                p.fill(theme.focus_cell_bg_color);
                p.stroke(theme.focus_cell_stroke_color);
                p.rect(cell.x, top, this.cellSize, bottom);
                p.rect(left, cell.y, right, this.cellSize);

                if (this.getDataAt(index.col, index.row) == ' ') {
                    var preMove = this.getPreMove();
                    if (!preMove) preMove = {
                        data: 'X'
                    };

                    p.fill(theme.cell_hover_bg_color);
                    p.rect(cell.x, cell.y, this.cellSize, this.cellSize);

                    var nextChar = this.switchChat(preMove.data);
                    this.printChar(nextChar, index.col, index.row, true, p);
                }
            }
        }

        hightlightPreMove() {
            var preMove = this.getPreMove();
            if (preMove) {
                var pos = this.getPosCellAt(preMove.col, preMove.row);
                p.strokeWeight(2);
                p.fill(theme.hightlight_cell_bg_color);
                p.stroke(theme.hightlight_cell_stroke_color);
                p.rect(pos.x, pos.y, this.cellSize, this.cellSize);
            }
        }

        printChar(char, col, row, alpha, cnv) {
            var c = this.getPosCellAt(col, row);
            var strWei = 3;
            var del = strWei * 3;

            cnv = cnv || this.gra;
            cnv.noFill();
            cnv.strokeWeight(strWei);

            if (char == 'X') {
                cnv.stroke(alpha ? theme.x_hover_color : theme.x_color);
                cnv.line(c.x + del, c.y + del, c.x + this.cellSize - del, c.y + this.cellSize - del);
                cnv.line(c.x + this.cellSize - del, c.y + del, c.x + del, c.y + this.cellSize - del);
            } else {
                cnv.stroke(alpha ? theme.o_hover_color : theme.o_color);
                cnv.ellipse(c.x + this.cellSize / 2, c.y + this.cellSize / 2, this.cellSize - del * 1.5, this.cellSize - del * 1.5);
            }
            cnv.strokeWeight(1);
        }

        run() {
            this.showMousePos();
            this.hightlightPreMove();
            this.show();
        }
    }

    class SocketIO {
        constructor(link) {
            this.socket = io(link); //"http://localhost:8080"
        }

        sendToServer(name, data) {
            this.socket.emit(name, data);
        }

        addActionOn(name, func) {
            this.socket.on(name, function (data) {
                func(data);
            })
        }
    }
}