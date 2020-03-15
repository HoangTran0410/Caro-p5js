var port = process.env.PORT || 3000;
var express = require("express");
var app = express();
app.use(express.static("public"));
// app.set("view engine", "ejs");
// app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(port);

// ========================== Classes =====================
function arrayRemove(arr, value) {

    return arr.filter(function(ele) {
        return ele != value;
    });

}

class User {
    constructor(_id, _name) {
        this.id = _id;
        this.name = _name;
        this.isViewer = false;
        this.roomName = null;
    }

    setRoomName(_roomName) {
        this.roomName = _roomName;
    }

    getRoomName() {
        return this.roomName;
    }
}

class ListUsers {
    constructor() {
        this.users = [];
    }

    getUsersCount() {
        return this.users.length;
    }

    addUser(u) {
        this.users.push(u);
    }

    removeUser(u) {
        var index = this.users.indexOf(u);
        if (index >= 0) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    findUserName(userName) {
        for (var user of this.users) {
            if (user.name == userName) {
                return user;
            }
        }
        return null;
    }

    findUserID(userID) {
        for (var user of this.users) {
            if (user.id == userID) {
                return user;
            }
        }
        return null;
    }
}

class Room {
    constructor(_owner, _name, _pass, _preview, _apceptViewer, _maxPlayers) {
        this.owner = _owner;
        this.name = _name;
        this.pass = _pass;
        this.preview = _preview;
        this.apceptViewer = _apceptViewer;
        this.maxPlayers = _maxPlayers || 2;
        this.maxUsers = 10; // test

        this.users = [];
        this.chat = [];
        this.history = [];
    }

    getUsersCount() {
        return this.users.length;
    }

    addUser(u) {
        if (this.users.length < this.maxUsers) {
            u.setRoomName(this.name);

            if (this.users.length < this.maxPlayer) {
                this.users.push(u);

            } else if (this.apceptViewer) {
                u.isViewer = true;
                this.users.push(u);
            }
            return true;
        }
        return false;
    }

    removeUser(u) {
        var index = this.users.indexOf(u);
        if (index >= 0) {
            this.users[index].setRoomName(null);
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    removeAllUsers() {
        this.users = [];
    }

    addHistory(h) {
        this.history.push(h);
    }

    getHistory() {
        return this.history;
    }

    undo() {
        this.history.pop();
    }

    clearHistory() {
        this.history = [];
    }
}

class ListRooms {
    constructor() {
        this.rooms = [];
    }

    getRoomsCount() {
        return this.rooms.length;
    }

    addRoom(r) {
        this.rooms.push(r);
    }

    removeRoom(r) {
        var index = this.rooms.indexOf(r);
        if (index >= 0) {
            this.rooms.splice(index, 1);
            return true;
        }
        return false;
    }

    findRoom(roomName) {
        for (var room of this.rooms) {
            if (room.name == roomName) {
                return room;
            }
        }
        return null;
    }
}

function sendListRooms(somesoc) {
    // send list rooms
    var data = [];
    for (var r of list_rooms.rooms) {
        data.push({
            "owner": r.owner,
            "name": r.name,
            "pass": r.pass,
            "preview": r.preview,
            "apceptViewer": r.apceptViewer,
            "users_inroom": r.users.length
        })
    }
    if (somesoc) {
        somesoc.emit('server_send_list_rooms', data);
    } else {
        io.sockets.emit('server_send_list_rooms', data);
    }
}

function sendOnlineCount(somesoc) {
    if (somesoc) {
        somesoc.emit('server_send_online_count', list_users.getUsersCount());
    } else {
        io.sockets.emit('server_send_online_count', list_users.getUsersCount());
    }
}

// ======================== Socket io ==========================
var list_rooms = new ListRooms();
var list_users = new ListUsers()

io.on("connection", function(soc) {

    // init
    soc.on('client_send_new_connect', function(name, onSuccess) {
        if (!name) {
            onSuccess(false, 'Vui lòng nhập tên');
            return;
        }

        var find = list_users.findUserName(name);
        if (find) {
            onSuccess(false, 'Tên đã có người sử dụng');
            return;
        }

        var user = new User(soc.id, name);
        soc.caro_user = user;
        list_users.addUser(user);

        sendOnlineCount();
        onSuccess(true);

        // soc.emit('server_send_io', io);
    })

    soc.on("disconnect", function() {
        if (!soc.caro_user) return;

        var nameRoom = soc.caro_user.getRoomName();
        if (!nameRoom) {
            io.sockets.emit('server_message_disconnect', soc.caro_user.name);

        } else {
            var room = list_rooms.findRoom(nameRoom);
            room.removeUser(soc.caro_user);
            soc.leave(nameRoom);
            io.sockets.to(nameRoom).emit('server_message_disconnect', soc.caro_user.name);
        }
        list_users.removeUser(soc.caro_user);

        // console.log('--- Xoa ' + soc.caro_user.name + ': ' + list_users.removeUser(soc.caro_user));
        // console.log('xxx ' + soc.caro_user.name + ' đã thoát.');
        sendOnlineCount();
        sendListRooms();
    })

    // rooms
    soc.on('client_create_room', function(data, onSuccess) {
        var room = new Room(soc.caro_user, data.name, data.pass, data.preview, data.apceptViewer);
        list_rooms.addRoom(room);

        // console.log(soc.caro_user.name + " Created room " + data.name);

        sendListRooms();
        onSuccess(true);
    })

    soc.on('client_join_room', function(nameRoom, onSuccess) {
        var room = list_rooms.findRoom(nameRoom);
        if (!room) return;

        room.addUser(soc.caro_user);

        soc.join(nameRoom);
        soc.caro_user.setRoomName(nameRoom);

        io.sockets.to(nameRoom).emit('server_message_join_room', {
            "id": soc.caro_user.id,
            "player_name": soc.caro_user.name,
            "room_name": nameRoom
        })

        // console.log(soc.caro_user.name + " Joined room " + nameRoom);
        sendListRooms();
        onSuccess(true);
    })

    soc.on('client_leave_room', function(onSuccess) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) {
            onSuccess(false, 'Không tìm thấy tên phòng');
            return;
        }

        var room = list_rooms.findRoom(roomName);
        if (!room) {
            onSuccess(false, 'Không tìm thấy phòng');
            return;
        }

        room.removeUser(soc.caro_user);
        soc.leave(roomName);

        // thông báo
        io.sockets.emit('server_message_leave_room', {
            "id": soc.caro_user.id,
            "player_name": soc.caro_user.name,
            "room_name": roomName
        });

        // thực hiện xóa phòng nếu không còn ai
        if (room.getUsersCount() == 0) {

            list_rooms.removeRoom(room);
        }

        // console.log(soc.caro_user.name + " Leaved room " + roomName);
        sendListRooms();
        onSuccess(true);
    })

    soc.on('client_required_join_room', function(nameRoom, inpPass, onSuccess) {
        var room = list_rooms.findRoom(nameRoom);
        if (!room) {
            onSuccess(false);
            return;
        }

        onSuccess(inpPass == room.pass);
    })

    soc.on('client_close_room', function(nameRoom) {
        var room = list_rooms.findRoom(nameRoom);
        if (!room) {
            onSuccess(false, 'Không tìm thấy phòng ' + nameRoom);
            return;
        }

        if(room.owner != soc.caro_user) {
            onSuccess(false, 'Bạn không phải chủ phòng nên không thể đóng phòng ' + nameRoom);
            return;
        }

        io.sockets.to(room.name).emit('server_send_leave_room', 'Phòng đã bị đóng, bạn được đưa ra sảnh!');

        // sau khi tất cả được đưa ra ngoài sảnh => số người trong phòng = 0 => tự động xóa
        // xóa phòng thật sự sẽ ở 'client_leave_room'
    });

    soc.on('client_required_list_rooms', function(onSuccess) {
        var data = [];
        for (var r of list_rooms.rooms) {
            data.push({
                "owner": r.owner,
                "name": r.name,
                "pass": r.pass,
                "preview": r.preview,
                "apceptViewer": r.apceptViewer,
                "users_inroom": r.users.length
            })
        }
        onSuccess(data);
    })

    // online count
    soc.on('client_required_online_count', function(onSuccess) {
        onSuccess(list_users.getUsersCount());
    })

    // messages
    soc.on('client_send_message', function(data) {
        var roomName = soc.caro_user.getRoomName();
        if (roomName) {
            io.sockets.to(roomName).emit('server_send_message', {
                'id': soc.id,
                "from": data.from,
                'mes': data.mes
            });
        } else {
            io.sockets.emit('server_send_message', {
                'id': soc.id,
                "from": data.from,
                'mes': data.mes
            });
        }
    })

    // ============================ Caro Area =============================
    soc.on('client_required_history_game', function(onSuccess) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) {
            onSuccess(false);
            return;
        }

        var room = list_rooms.findRoom(roomName);
        if (!room) {
            onSuccess(false);
            return;
        }

        onSuccess(room.getHistory());
    })

    soc.on("client_clicked", function(data) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        var room = list_rooms.findRoom(roomName);
        if (!room) return;

        room.addHistory(data);
        soc.broadcast.to(roomName).emit('server_send_clicked', data);
        soc.broadcast.to(roomName).emit('server_send_turn', 'on');
        soc.emit('server_send_turn', 'off');
    })

    soc.on('client_send_want_reset', function(name) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        soc.broadcast.to(roomName).emit('server_send_want_reset', name);
    })

    soc.on('client_apcept_reset', function(data) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        var room = list_rooms.findRoom(roomName);
        if (!room) return;

        if (data.apcepted) {
            io.sockets.to(roomName).emit('server_send_reset');
            room.history = [];
        } else {
            soc.broadcast.to(roomName).emit('server_send_deny_reset', data.from);
        }
    })

    soc.on('client_send_want_undo', function(data) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        soc.broadcast.to(roomName).emit('server_send_want_undo', data);
    })

    soc.on('client_apcept_undo', function(data) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        var room = list_rooms.findRoom(roomName);
        if (!room) return;

        if (data.apcepted) {
            io.sockets.emit('server_send_undo', data);
            for (var i = 0; i < data.soBuoc; i++) {
                room.history.pop();
            }

        } else {
            soc.broadcast.emit('server_send_deny_undo', data.from);
        }
    })

    soc.on('client_send_win', function(name) {
        var roomName = soc.caro_user.getRoomName();
        if (!roomName) return;

        io.sockets.to(roomName).emit('server_send_win', {
            "id": soc.id,
            "name": name
        })
    })

    // ============================== END Caro =============================


    // io.sockets.emit()        // to all
    // soc.emit()               // to this
    // soc.broadcast.emit()     // to all another
    // io.to("socketid").emit() // to another
})

// app.get("/", function (req, res) {
//     res.render("trangchu");
// });