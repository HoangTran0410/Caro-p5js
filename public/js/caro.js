let isSetupSocketEventCaro = false;

let caro = function(p) {
    let game, theme, timeClick = 0,
        tableSize = 60;

    p.setup = function() {
        if (!isSetupSocketEventCaro) setupSocketEvent();
        setupBtnEvent();

        p.createCanvas(p.windowWidth, p.windowHeight);
        p.pixelDensity(1);

        applyTheme("dark");

        game = new CaroTable(tableSize, tableSize, 30);
        game.moveToCenterPage();

        socket.emit('client_required_history_game', function(dataHistory) {
            if (dataHistory) {
                game.reset();
                game.history = dataHistory;
                game.drawGrid();
                game.drawData();

            } else {
                Swal.fire({
                    type: 'error',
                    title: 'Không thể lấy dữ liệu trò chơi'
                })
            }
        })

        // document.getElementById('turnName').innerHTML = 'cả 2';
    }

    p.draw = function() {
        if (game) {
            p.background(theme.canvas_bg_color);
            game.run();
        }
    }

    p.mousePressed = function(e) {
        if (e.target.matches('canvas'))
            timeClick = p.millis();
    }

    p.mouseReleased = function(e) {
        if (e.target.matches('canvas'))
            if (p.millis() - timeClick < 200) {
                game.clicked();
            }
    }

    p.mouseDragged = function(e) {
        if (game && e.target.matches('canvas')) {
            e.preventDefault();
            game.focusTarget = false;
            game.pos.add(p.mouseX - p.pmouseX, p.mouseY - p.pmouseY);
        }
    }

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight, true);
    }

    //--------------------- setup event for caro game -------
    function resetGame() {
        Swal({
            title: "Chắc chắn?",
            text: "Bạn có chắc muốn tạo ván mới?",
            type: "warning",
            confirmButtonText: 'Tạo',
            focusCancel: true,
            cancelButtonText: 'Hủy',
            showCancelButton: true,
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.value) {
                socket.emit('client_send_want_reset', player_name);

                Swal({
                    title: "Đang chờ...",
                    text: "Đang chờ người kia đồng ý tạo ván mới.",
                    type: "success"
                })
            }
        })
    }

    function undoGame() {
        socket.emit('client_send_want_undo', {
            "from": player_name,
            "isTurn": game.turn,
            "id": socket.id
        });

        Swal({
            title: "Đang chờ...",
            text: "Đang chờ người kia đồng ý cho đánh lại",
            type: "success"
        })
    }

    function setupBtnEvent() {
        $('#btnNewGame').click(() => {
            resetGame()
        });
        $('#btnUndoGame').click(() => {
            undoGame()
        });
        $('#btnFocusPreMove').click(() => {
            game.focusToPreMove();
        });
        $('#btnSwitchTheme').click(() => {
            switchTheme()
        });
    }

    function setupSocketEvent() {
        // playing
        socket.on('server_send_clicked', function(data) {
            game.history.push(data);
            game.drawData();
            game.focusToPreMove();
        })
        socket.on('server_send_history', function(data) {
            game.reset();
            game.history = data;
            game.drawGrid();
            game.drawData();

            console.log(data, game);
        })

        // đánh lại (undo)
        socket.on('server_send_want_undo', function(data) {
            Swal({
                allowEscapeKey: false,
                allowOutsideClick: false,
                title: "Đánh lại 1 bước?",
                text: data.from + " muốn đi lại bước vừa đánh. \nBạn có đồng ý không?",
                type: "question",
                cancelButtonText: 'Không',
                confirmButtonText: 'Đồng ý',
                showCancelButton: true,
                reverseButtons: true

            }).then((isOke) => {
                let sobuoc = (data.isTurn ? 2 : 1);
                socket.emit('client_apcept_undo', {
                    "apcepted": isOke.value,
                    "soBuoc": sobuoc,
                    "from": player_name,
                    "id": data.id
                });
            })
        })
        socket.on('server_send_undo', function(data) {
            for (let i = 0; i < data.soBuoc; i++) {
                game.undo();
            }

            if (data.id == socket.id) {
                game.turn = true;
            } else {
                game.turn = false;
            }

            Swal({
                title: 'Đánh lại thành công!',
                text: (data.from + " đã chấp nhận đánh lại 1 bước."),
                type: "success"
            });
        })
        socket.on('server_send_deny_undo', function(name) {
            Swal({
                title: 'Hủy đánh lại',
                text: name + " không đồng ý cho bạn đánh lại!",
                type: "warning"
            })
        })

        // ván mới
        socket.on('server_send_want_reset', function(name) {
            Swal({
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    title: "Ván mới?",
                    text: name + " muốn tạo ván mới. \nBạn có đồng ý không?",
                    type: "question",
                    cancelButtonText: 'Không',
                    confirmButtonText: 'Đồng ý',
                    showCancelButton: true,
                    reverseButtons: true
                })
                .then((isOke) => {
                    socket.emit('client_apcept_reset', {
                        "apcepted": isOke.value,
                        "from": player_name
                    });
                    if (!isOke) {
                        Swal({
                            title: "Đã hủy",
                            text: "Đã hủy tạo ván mới.",
                            type: "success"
                        })
                    }
                });
        })
        socket.on('server_send_reset', function() {
            game.reset();
            Swal({
                title: "Tạo thành công",
                text: "Đã tạo ván mới.",
                type: "success",
            });
        })
        socket.on('server_send_deny_reset', function(name) {
            Swal({
                title: 'Hủy tạo ván mới',
                text: name + " không đồng ý tạo ván mới!",
                type: "warning"
            })
        })

        // check lượt, check win
        socket.on('server_send_turn', function(data) {
            let spanTurn = document.getElementById('turnName');
            if (data == 'off') {
                game.turn = false;
                spanTurn.innerHTML = ' đối thủ: ' + game.getNextChar();
            } else {
                game.turn = true;
                spanTurn.innerHTML = ' Bạn: ' + game.getNextChar();
            }
        })
        socket.on('server_send_win', function(data) {
            if (socket.id == data.id) {
                Swal({
                    title: 'Chúc mừng!',
                    text: "Bạn đã thắng ván chơi này.",
                    type: "info"
                });
            } else {
                Swal({
                    title: 'Bạn thua!',
                    text: data.name + ' đã thắng ván chơi này',
                    type: "warning"
                });
            }
        })

        isSetupSocketEventCaro = true;
    }

    // --------------- Themes for caro game -------------
    function applyTheme(name) {
        for (let i of themes) {
            if (i.name == name) {
                theme = i;
            }
        }

        $('.control-game button').css({
            'background-color': theme.btn_bg_color,
            'color': theme.btn_text_color

        }).hover(() => {
            $(this).css({
                'background-color': theme.btn_hover_bg_color,
                'color': theme.btn_hover_text_color
            })
        });
    }

    function switchTheme() {
        let index = themes.indexOf(theme);
        index++;
        if (index >= themes.length) index = 0;

        applyTheme(themes[index].name);

        game.drawGrid();
        game.drawData();
    }

    let themes = [{
        name: "dark",
        canvas_bg_color: "#111",
        table_bg_color: "#0001",
        table_stroke_color: "#7777",
        x_color: "#e00",
        o_color: "#0e0",
        x_hover_color: "#e007",
        o_hover_color: "#0e07",
        hightlight_cell_bg_color: "#5557",
        hightlight_cell_stroke_color: "#bbb",
        hover_cell_bg_color: "#111",
        hover_cell_stroke_color: "#777",
        focus_cells_bg_color: "#6661",
        focus_cells_stroke_color: "#0000",

        btn_bg_color: "#222",
        btn_text_color: "#eee",
        btn_hover_bg_color: "#555",
        btn_hover_text_color: "#fff"
    }, {
        name: "light",
        canvas_bg_color: "#fff",
        table_bg_color: "#eee9",
        table_stroke_color: "#7777",
        x_color: "#e00",
        o_color: "#0e0",
        x_hover_color: "#e007",
        o_hover_color: "#0e07",
        hightlight_cell_bg_color: "#fff",
        hightlight_cell_stroke_color: "#555",
        hover_cell_bg_color: "#fff",
        hover_cell_stroke_color: "#777",
        focus_cells_bg_color: "#ccc5",
        focus_cells_stroke_color: "#0000",

        btn_bg_color: "#ddd",
        btn_text_color: "#111",
        btn_hover_bg_color: "#999",
        btn_hover_text_color: "#000"
    }]

    // ---------------- Class Caro game ------------------
    class CaroTable {
        constructor(rows, cols, cSize) {
            this.pos = p.createVector(0, 0); // corner position
            this.rows = rows;
            this.cols = cols;
            this.cellSize = cSize;
            this.gra = p.createGraphics(cols * cSize, rows * cSize);
            this.tableData = {};
            this.history = [];

            this.target = p.createVector(0, 0);
            this.focusTarget = false;
            this.turn = true;

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
            this.tableData = {};
            // for (let y = 0; y < this.rows; y++) {
            //     let s = [];
            //     for (let x = 0; x < this.cols; x++) {
            //         s.push(' ');
            //     }
            //     this.tableData.push(s);
            // }
        }

        reset() {
            this.focusTarget = false;
            this.history = [];
            this.createTable(this.rows, this.cols, this.cellSize);
            this.moveToCenterPage();
        }

        drawGrid() {
            this.gra.clear();
            this.gra.background(theme.table_bg_color);
            this.gra.stroke(theme.table_stroke_color);
            for (let x = -.5; x < this.gra.width; x += this.cellSize) {
                this.gra.line(x, 0, x, this.gra.height);
            }
            for (let y = -.5; y < this.gra.height; y += this.cellSize) {
                this.gra.line(0, y, this.gra.width, y);
            }
        }

        drawData() {
            for (let d of this.history) {
                this.setDataAt(d.col, d.row, d.data);
            }
        }

        moveToCenterPage() {
            this.pos = p.createVector(-game.gra.width / 2 + p.width / 2, -game.gra.height / 2 + p.height / 2);
        }

        getDataAt(col, row) {
            if (this.tableData[row])
                return this.tableData[row][col] || ' ';
            else return ' ';
        }

        setDataAt(col, row, data) {
            if (!this.tableData[row]) this.tableData[row] = {};

            if (data != ' ') {
                this.tableData[row][col] = data;
                this.printChar(data, col, row);
            } else {
                delete this.tableData[row][col];
            }
        }

        getIndexCellAt(posx, posy) {
            let col = p.floor((posx - this.pos.x) / this.cellSize);
            let row = p.floor((posy - this.pos.y) / this.cellSize);

            if (col < 0 || col >= this.cols) col = -1;
            if (row < 0 || row >= this.rows) row = -1;

            return {
                "col": col,
                "row": row
            };
        }

        getCellAtPos(posx, posy) {
            let index = this.getIndexCellAt(posx, posy);
            return this.getCellAtIndex(index.col, index.row);
        }

        getPosCellAt(col, row) {
            return {
                "x": col * this.cellSize + this.pos.x,
                "y": row * this.cellSize + this.pos.y
            };
        }

        getCellAtIndex(col, row) {
            return {
                "x": col * this.cellSize + this.pos.x,
                "y": row * this.cellSize + this.pos.y,
                "data": this.getDataAt(col, row)
            };
        }

        switchChar(char) {
            return (char == 'X' ? 'O' : 'X');
        }

        getNextChar() {
            let preMove = this.getPreMove();
            if (!preMove) preMove = {
                data: 'X'
            }

            return this.switchChar(preMove.data);
        }

        getPreMove() {
            return this.history[this.history.length - 1];
        }

        focusToCell(col, row) {
            let pos = this.getPosCellAt(col, row);
            this.target = p.createVector(this.pos.x - pos.x + p.width / 2, this.pos.y - pos.y + p.height / 3);
            this.focusTarget = true;
        }

        focusToPreMove() {
            let premove = this.getPreMove();
            if (premove) this.focusToCell(premove.col, premove.row);
        }

        clicked() {
            if (this.turn && p.mouseX < p.width && p.mouseX > 0 && p.mouseY < p.height && p.mouseY > 0) {
                let index = this.getIndexCellAt(p.mouseX, p.mouseY);
                if (index.col != -1 && index.row != -1) {
                    if (this.getDataAt(index.col, index.row) == ' ') {

                        let nextChar = this.getNextChar();
                        this.setDataAt(index.col, index.row, nextChar);
                        let dataClicked = {
                            col: index.col,
                            row: index.row,
                            data: nextChar
                        };
                        this.history.push(dataClicked);
                        socket.emit('client_clicked', dataClicked);

                        // this.focusToCell(index.col, index.row);
                        let isWin = this.checkWin(index.col, index.row)
                        if (isWin) {
                            socket.emit('client_send_win', player_name);
                        }
                    }
                }
            }
        }

        undo() {
            if (this.history.length) {
                let preMove = this.history.pop();
                this.setDataAt(preMove.col, preMove.row, ' ');
                this.drawGrid();
                this.drawData();
                this.focusToPreMove();
            }
        }

        show() {
            p.image(this.gra, this.pos.x, this.pos.y, this.gra.width, this.gra.height);
        }

        showMousePos() {
            let cell = this.getCellAtPos(p.mouseX, p.mouseY);
            let index = this.getIndexCellAt(p.mouseX, p.mouseY);
            if (index.col != -1 && index.row != -1) {

                if (this.turn) {
                    // hightlight row-col cells
                    p.fill(theme.focus_cells_bg_color);
                    p.stroke(theme.focus_cells_stroke_color);
                    p.rect(cell.x, this.pos.y, this.cellSize, this.gra.height);
                    p.rect(this.pos.x, cell.y, this.gra.width, this.cellSize);

                    if (this.getDataAt(index.col, index.row) == ' ') {
                        // hightlight focus mouse cell
                        p.fill(theme.hover_cell_bg_color);
                        p.stroke(theme.hover_cell_stroke_color);
                        p.rect(cell.x, cell.y, this.cellSize, this.cellSize);

                        let preMove = this.getPreMove();
                        if (!preMove) preMove = {
                            data: 'X'
                        };

                        let nextChar = this.switchChar(preMove.data);
                        if (this.turn) this.printChar(nextChar, index.col, index.row, true, p);

                        // if (index != this.preCellHover) {
                        //     this.preCellHover = index;
                        //     socket.emit('client_send_hover', this.preCellHover);
                        // }
                    }
                    p.cursor(p.HAND);

                } else {
                    p.cursor(p.ARROW);
                }

            } else {
                p.cursor(p.ARROW);
            }
        }

        showOtherPlayerMousePos() {
            if (this.otherPlayerPos) {
                this.printChar('X')
            }
        }

        hightlightPreMove() {
            let preMove = this.getPreMove();
            if (preMove) {
                let pos = this.getPosCellAt(preMove.col, preMove.row);
                p.strokeWeight(2);
                p.fill(theme.hightlight_cell_bg_color);
                p.stroke(theme.hightlight_cell_stroke_color);
                p.rect(pos.x, pos.y, this.cellSize, this.cellSize);

                this.printChar(preMove.data, preMove.col, preMove.row, false, p);
            }
        }

        printChar(char, col, row, alpha, cnv) {
            let c;
            if (cnv) c = this.getPosCellAt(col, row);
            else c = {
                "x": col * this.cellSize,
                "y": row * this.cellSize
            };
            let strWei = 3;
            let del = strWei * 3;

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

        checkWin(col, row) {
            let currentData = this.getDataAt(col, row);
            let cell = {
                "col": col,
                "row": row,
                "data": currentData
            };

            // ============ check chieu ngang =============
            let ngangFrom = {
                delcol: -1,
                delrow: 0
            };
            let ngangTo = {
                delcol: 1,
                delrow: 0
            }
            if (this.check(cell, ngangFrom, ngangTo)) return true;

            // ============ check chieu doc ============
            let docFrom = {
                delcol: 0,
                delrow: -1
            };
            let docTo = {
                delcol: 0,
                delrow: 1
            }

            if (this.check(cell, docFrom, docTo)) return true;

            // ============ check cheo trai sang phai ============
            let cheoTPFrom = {
                delcol: -1,
                delrow: -1
            };
            let cheoTPTo = {
                delcol: 1,
                delrow: 1
            };
            if (this.check(cell, cheoTPFrom, cheoTPTo)) return true;

            // ============ check cheo phai sang trai ============
            let cheoPTFrom = {
                delcol: 1,
                delrow: -1
            }
            let cheoPTTO = {
                delcol: -1,
                delrow: 1
            }
            if (this.check(cell, cheoPTFrom, cheoPTTO)) return true;
            return false;
        }

        check(currentCell, deltaFrom, deltaTo) {
            let currentData = currentCell.data;
            let count = 1;
            let from, to, temp, data;

            // count to pre
            from = currentCell;
            while (true) {
                temp = {
                    col: from.col + deltaFrom.delcol,
                    row: from.row + deltaFrom.delrow
                };
                data = this.getDataAt(temp.col, temp.row);

                if (data != currentData) break;
                from = temp;
                count++;
            }

            // count to next
            to = currentCell;
            while (true) {
                temp = {
                    col: to.col + deltaTo.delcol,
                    row: to.row + deltaTo.delrow
                }
                data = this.getDataAt(temp.col, temp.row);

                if (data != currentData) break;
                to = temp;
                count++;
            }

            if (count == 5) return {
                "from": from,
                "to": to
            };
            return false;
        }

        control_move() {
            if (p.keyIsDown(p.LEFT_ARROW)) {
                this.pos.add(5, 0);
                this.focusTarget = false;
            }
            if (p.keyIsDown(p.RIGHT_ARROW)) {
                this.pos.add(-5, 0);
                this.focusTarget = false;
            }
            if (p.keyIsDown(p.UP_ARROW)) {
                this.pos.add(0, 5);
                this.focusTarget = false;
            }
            if (p.keyIsDown(p.DOWN_ARROW)) {
                this.pos.add(0, -5);
                this.focusTarget = false;
            }
        }

        run() {
            this.show();
            this.showMousePos();
            this.hightlightPreMove();
            this.control_move();

            if (this.focusTarget) {
                this.pos = p5.Vector.lerp(this.pos, this.target || this.pos, 0.05);
            }

            this.pos.x = p.constrain(this.pos.x, -this.gra.width + this.cellSize, p.width - this.cellSize);
            this.pos.y = p.constrain(this.pos.y, -this.gra.height + this.cellSize, p.height - this.cellSize);
        }
    }
}