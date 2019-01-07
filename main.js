var game;

var caro = function(p) {
    p.timeClick = 0;

    p.setup = function() {
        swal({
            title: "Xin chào!",
            text: "Tên của bạn là?",
            closeOnClickOutside: false,
            closeOnEsc: false,
            content: {
                element: "input",
                attributes: {
                    placeholder: "Nhập tên....",
                    type: "text",
                },
            }
        }).then((name) => {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.pixelDensity(1);

            applyTheme("dark");

            name = name || "-khách-";
            game = new CaroTable(30, 30, 30, name);
            game.moveToCenterPage();

            socket = io("localhost:8080");

            socket.on('newConnect', function(d) {
                console.log('new connect: ' + d);
            })
            socket.on('disConnect', function(d) {
                console.log('disconnect: ' + d);
            })

            // message
            socket.on('server_send_message', function(data) {
                p.addMessage(data.mes, (data.id == socket.id ? 'Bạn' : data.from), true);
                if (document.getElementById('showHideChat').value == 'Chat') {
                    var thongbao = document.getElementById('mesChuaDoc');
                    thongbao.innerHTML = Number(thongbao.innerHTML) + 1;
                    thongbao.style.display = 'block';
                }
            })


            // playing
            socket.on('server_send_clicked', function(d) {
                game.setDataAt(d.col, d.row, d.data);
                game.history.push(d);
            })
            socket.on('server_send_history', function(d) {
                game.reset();
                game.history = d;
                game.applyDataToTable();
                game.drawGrid();
                game.drawData();
            })

            // đánh lại (undo)
            socket.on('server_send_want_undo', function(name) {
                swal({
                        title: "Đánh lại 1 bước?",
                        text: name + " muốn đi lại bước vừa đánh. \nBạn có đồng ý không?",
                        icon: "info",
                        buttons: ["Không", "Đồng ý"]
                            // dangerMode: true
                    })
                    .then((isOke) => {
                        socket.emit('client_apcept_undo', {
                            "apcepted": isOke,
                            "from": game.name
                        });
                    });
            })
            socket.on('server_send_undo', function() {
                game.undo();
                swal("Đã chấp nhận đánh lại 1 bước.", {
                    icon: "success",
                });
            })
            socket.on('server_send_deny_undo', function(name) {
                swal({
                    title: 'Hủy đánh lại',
                    text: name + " không đồng ý cho bạn đánh lại!",
                    icon: "warning"
                })
            })

            // ván mới
            socket.on('server_send_want_reset', function(name) {
                swal({
                        title: "Ván mới?",
                        text: name + " muốn tạo ván mới. \nBạn có đồng ý không?",
                        icon: "info",
                        buttons: ["Không", "Đồng ý"]
                            // dangerMode: true
                    })
                    .then((isOke) => {
                        socket.emit('client_apcept_reset', {
                            "apcepted": isOke,
                            "from": game.name
                        });
                        if (!isOke) {
                            swal({
                                title: "Đã hủy",
                                text: "Đã hủy tạo ván mới.",
                                icon: "success"
                            })
                        }
                    });
            }) 
            socket.on('server_send_reset', function() {
                game.reset();
                swal("Đã tạo ván mới.", {
                    icon: "success",
                });
            }) 
            socket.on('server_send_deny_reset', function(name) {
                swal({
                    title: 'Hủy tạo ván mới',
                    text: name + " không đồng ý tạo ván mới!",
                    icon: "warning"
                })
            })


            socket.on('server_send_turn', function(data) {
                game.turn = (data != 'off');
            }) 
            socket.on('server_send_win', function(data) {
                if (socket.id == data.id) {
                    swal({
                        title: 'Chúc mừng!',
                        text: "Bạn đã thắng ván chơi này.",
                        icon: "info"
                    });
                } else {
                    swal({
                        title: 'Bạn thua!',
                        text: data.name + ' đã thắng ván chơi này',
                        icon: "warning"
                    });
                }
            })
        })

    }

    p.draw = function() {
        if (game) {
            p.background(theme.canvas_bg_color);
            game.run();
        }
    }

    p.mousePressed = function(e) {
        if (e.target.matches('canvas'))
            p.timeClick = p.millis();
    }

    p.mouseReleased = function(e) {
        if (e.target.matches('canvas'))
            if (p.millis() - p.timeClick < 200) {
                game.clicked();
            }
    }

    p.mouseDragged = function() {
        if (game) {
            game.focusTarget = false;
            game.pos.add(p.mouseX - p.pmouseX, p.mouseY - p.pmouseY);
        }
    }

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight, true);
    }

    p.addMessage = function(mes, from, withTime, color, onclickFunc) {
        var newMes = document.createElement('p');
        if (color) {
            newMes.style.backgroundColor = color;
        }

        if (withTime) {
            var timeNode = document.createElement('span');
            timeNode.style.color = '#ddd9';
            var t = new Date();
            timeNode.textContent = (withTime ? (t.getHours() + ':' + t.getMinutes() + ' ') : "");
            newMes.appendChild(timeNode);
        }

        if (from) {
            var fromNode = document.createElement('span');
            // fromNode.style.fontWeight = 'bold';
            fromNode.textContent = (from ? ('(' + from + ") ") : "");
            newMes.appendChild(fromNode);
        }

        if (mes) {
            var mesNode = document.createTextNode(mes);
            newMes.appendChild(mesNode);
        }

        if (onclickFunc) {
            newMes.addEventListener("mouseover", function() {
                newMes.style.cursor = 'pointer';
                newMes.style.borderWidth = "1px 0 1px 0";
                newMes.style.borderColor = "white";
                newMes.style.borderStyle = "dashed";
            });
            newMes.addEventListener("mouseout", function() {
                newMes.style.border = "none";
            });
            newMes.addEventListener("click", onclickFunc);
        }

        document.getElementById('conversation').appendChild(newMes);
        newMes.scrollIntoView();
    }

    class CaroTable {
        constructor(rows, cols, cSize, name) {
            this.pos = p.createVector(0, 0); // corner position
            this.rows = rows;
            this.cols = cols;
            this.cellSize = cSize;
            this.gra = p.createGraphics(cols * cSize, rows * cSize);
            this.tableData = [];
            this.history = [];
            this.name = name;

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
            this.tableData = [];
            for (var y = 0; y < this.rows; y++) {
                var s = [];
                for (var x = 0; x < this.cols; x++) {
                    s.push(' ');
                }
                this.tableData.push(s);
            }
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

        applyDataToTable() {
            for (var d of this.history) {
                this.setDataAt(d.col, d.row, d.data);
            }
        }

        moveToCenterPage() {
            this.pos = p.createVector(-game.gra.width / 2 + p.width / 2, -game.gra.height / 2 + p.height / 2);
        }

        getDataAt(col, row) {
            if (this.tableData[row]) return this.tableData[row][col];
            return '';
        }

        setDataAt(col, row, data) {
            this.tableData[row][col] = data;
            if (data != ' ') {
                this.printChar(data, col, row);
            }
        }

        getIndexCellAt(posx, posy) {
            var col = p.floor((posx - this.pos.x) / this.cellSize);
            var row = p.floor((posy - this.pos.y) / this.cellSize);

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

        getPreMove() {
            return this.history[this.history.length - 1];
        }

        focusToCell(col, row) {
            var pos = this.getPosCellAt(col, row);
            this.target = p.createVector(this.pos.x - pos.x + p.width / 2, this.pos.y - pos.y + p.height / 3);
            this.focusTarget = true;
        }

        focusToPreMove() {
            var premove = this.getPreMove();
            if (premove) this.focusToCell(premove.col, premove.row);
        }

        clicked() {
            if (this.turn && p.mouseX < p.width && p.mouseX > 0 && p.mouseY < p.height && p.mouseY > 0) {
                var index = this.getIndexCellAt(p.mouseX, p.mouseY);
                if (index.col != -1 && index.row != -1) {
                    if (this.getDataAt(index.col, index.row) == ' ') {
                        var preMove = this.getPreMove();
                        if (!preMove) preMove = {
                            data: 'X'
                        };

                        var nextChar = this.switchChar(preMove.data);
                        this.setDataAt(index.col, index.row, nextChar);
                        var dataClicked = {
                            col: index.col,
                            row: index.row,
                            data: nextChar
                        };
                        this.history.push(dataClicked);
                        socket.emit('client_clicked', dataClicked);

                        // this.focusToCell(index.col, index.row);
                        var isWin = this.checkWin(index.col, index.row)
                        if (isWin) {

                            socket.emit('client_send_win', game.name);
                        }
                    }
                }
            }
        }

        undo() {
            if (this.history.length) {
                var preMove = this.history.pop();
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
            var cell = this.getCellAtPos(p.mouseX, p.mouseY);
            var index = this.getIndexCellAt(p.mouseX, p.mouseY);
            if (index.col != -1 && index.row != -1) {

                if (this.turn) {
                    // hightlight row-col cells
                    p.fill(theme.focus_cells_bg_color);
                    p.stroke(theme.focus_cells_stroke_color);
                    p.rect(cell.x, this.pos.y, this.cellSize, this.gra.height);
                    p.rect(this.pos.x, cell.y, this.gra.width, this.cellSize);
                }

                if (this.getDataAt(index.col, index.row) == ' ') {
                    // hightlight focus mouse cell
                    p.fill(theme.hover_cell_bg_color);
                    p.stroke(theme.hover_cell_stroke_color);
                    p.rect(cell.x, cell.y, this.cellSize, this.cellSize);

                    var preMove = this.getPreMove();
                    if (!preMove) preMove = {
                        data: 'X'
                    };

                    var nextChar = this.switchChar(preMove.data);
                    if (this.turn) this.printChar(nextChar, index.col, index.row, true, p);

                    // if (index != this.preCellHover) {
                    //     this.preCellHover = index;
                    //     socket.emit('client_send_hover', this.preCellHover);
                    // }
                }
            }
        }

        showOtherPlayerMousePos() {
            if (this.otherPlayerPos) {
                this.printChar('X')
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

                this.printChar(preMove.data, preMove.col, preMove.row, false, p);
            }
        }

        printChar(char, col, row, alpha, cnv) {
            var c;
            if (cnv) c = this.getPosCellAt(col, row);
            else c = {
                "x": col * this.cellSize,
                "y": row * this.cellSize
            };
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

        checkWin(col, row) {
            var currentData = this.getDataAt(col, row);
            var cell = {
                "col": col,
                "row": row,
                "data": currentData
            };

            // ============ check chieu ngang =============
            var ngangFrom = {
                delcol: -1,
                delrow: 0
            };
            var ngangTo = {
                delcol: 1,
                delrow: 0
            }
            if (this.check(cell, ngangFrom, ngangTo)) return true;

            // ============ check chieu doc ============
            var docFrom = {
                delcol: 0,
                delrow: -1
            };
            var docTo = {
                delcol: 0,
                delrow: 1
            }

            if (this.check(cell, docFrom, docTo)) return true;

            // ============ check cheo trai sang phai ============
            var cheoTPFrom = {
                delcol: -1,
                delrow: -1
            };
            var cheoTPTo = {
                delcol: 1,
                delrow: 1
            };
            if (this.check(cell, cheoTPFrom, cheoTPTo)) return true;

            // ============ check cheo phai sang trai ============
            var cheoPTFrom = {
                delcol: 1,
                delrow: -1
            }
            var cheoPTTO = {
                delcol: -1,
                delrow: 1
            }
            if (this.check(cell, cheoPTFrom, cheoPTTO)) return true;
            return false;
        }

        check(currentCell, deltaFrom, deltaTo) {
            var currentData = currentCell.data;
            var count = 1;
            var from, to, temp, data;

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

function resetGame() {
    swal({
            title: "Chắc chắn?",
            text: "Bạn có chắc muốn tạo ván mới?",
            icon: "warning",
            buttons: ["Hủy", "Tạo"]
        })
        .then((isOke) => {
            if (isOke) {
                socket.emit('client_send_want_reset', game.name);

                swal({
                    title: "Đang chờ...",
                    text: "Đang chờ người kia đồng ý tạo ván mới.",
                    icon: "success",
                })
            }
        })
}

function undoGame() {
    socket.emit('client_send_want_undo', game.name);

    swal({
        title: "Đang chờ...",
        text: "Đang chờ người kia đồng ý cho đánh lại",
        icon: "success"
    })
}