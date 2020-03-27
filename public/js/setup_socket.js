function connect(server_url) {
  socket = io.connect(server_url, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
    forceNew: true
  });
  socket.on("connect", function() {
    console.log("Connected to " + server_url);
  });
  socket.on("disconnect", reason => {
    addMessage("Mất kết nối", "Server", true, "#f00b");
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    // else the socket will automatically try to reconnect
  });
  socket.on("reconnect", attemptNumber => {
    addMessage("Kết nối lại thành công", "Server", true, "#0f0b");
    Swal.fire({
      type: "success",
      title: "Đã kết nối lại thành công..",
      text: "Sau " + attemptNumber + " lần cố gắng."
    }).then(result => {
      window.location.reload();
    });
  });
  socket.on("reconnecting", attemptNumber => {
    Swal.fire({
      type: "error",
      title: "Mất kết nối",
      text: "Đang thử kết nối lại... " + attemptNumber,
      grow: "row",
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false
    });
  });
  socket.on("server_send_io", function(data) {
    console.log(data);
  });
}

function setupEventSocket() {
  socket.on("server_message_disconnect", function(name) {
    // let playerName = "<i><u>" + name + "</u></i>";
    let playerName = name;
    addMessage(playerName + " đã thoát.", "Server", true, "#9559");
  });

  // list rooms
  socket.on("server_send_list_rooms", function(data) {
    showListRooms(data);
  });

  socket.on("server_message_join_room", function(data) {
    // let playerName = "<i><u>" + data.player_name + "</u></i>";
    // let roomName = "<i><u>" + data.room_name + "</u></i>";
    let playerName = data.player_name;
    let roomName = data.room_name;

    if (data.id == socket.id) {
      addMessage("Bạn đã vào phòng " + roomName, "Server", true, "#5d59");
    } else {
      addMessage(
        playerName + " đã vào phòng " + roomName,
        "Server",
        true,
        "#5958"
      );
    }
  });

  socket.on("server_message_leave_room", function(data) {
    // let playerName = "<i><u>" + data.player_name + "</u></i>";
    // let roomName = "<i><u>" + data.room_name + "</u></i>";
    let playerName = data.player_name;
    let roomName = data.room_name;

    if (data.id == socket.id) {
      addMessage("Bạn đã rời phòng " + roomName, "Server", true, "#d559");
    } else {
      addMessage(
        playerName + " đã rời phòng " + roomName,
        "Server",
        true,
        "#9558"
      );
    }
  });

  // message
  socket.on("server_send_message", function(data) {
    addMessage(data.mes, data.from, true);
    if (data.id != socket.id && chatIsClosing()) {
      flashTitle(data.from + " đã nhắn tin..", 1000);
    }
  });

  // online count
  socket.on("server_send_online_count", function(online_count) {
    $("#online_count").html(online_count);
  });

  // exit room
  socket.on("server_send_leave_room", function(reasonText) {
    roiPhong();
    Swal.fire({
      type: "info",
      title: reasonText
    });
  });
}

let Rooms = [];
let currentRoom = null;

function refreshData() {
  getOnlineCount();
  getListRooms();
}

function getOnlineCount() {
  socket.emit("client_required_online_count", function(online_count) {
    $("#online_count").html(
      '<i class="fas fa-globe-americas"></i> ' + online_count
    );
  });
}

function getListRooms() {
  socket.emit("client_required_list_rooms", function(listRooms) {
    showListRooms(listRooms);
  });
}

function showListRooms(listRooms) {
  Rooms = listRooms;

  if (!listRooms.length) {
    $("#tbRooms tbody").html(`
                        <tr> 
                            <td colspan="5">
                                <div class="alert alert-danger">
                                    <strong>Trống!</strong> Hiện chưa có Phòng nào được tạo.
                                </div>
                            </td>
                        </tr>
                            `);
    return;
  }

  let s = "";

  for (let d of listRooms) {
    let btnVaoPhong = "";
    let btnXoa = "";

    if (d.pass) {
      btnVaoPhong =
        `<button class="btn-sm btn-warning" onclick="checkVaoPhong('` +
        d.name +
        `')">
                <i class="fas fa-key" ></i>
            </button>`;
    } else {
      btnVaoPhong =
        `<button class="btn-sm btn-success" onclick="vaoPhong('` +
        d.name +
        `')">
                <i class="fas fa-sign-in-alt"></i>
            </button>`;
    }

    if (d.owner.name == player_name) {
      btnXoa =
        `<button class="btn-sm btn-danger" onclick="xoaPhong('` +
        d.name +
        `')">
                <i class="fas fa-trash-alt"></i>
            </button>`;
    }

    s +=
      `<tr>
            <td><b>` +
      d.name +
      `</b></td>
            <td>` +
      d.owner.name +
      `</td>
            <td><i>` +
      d.preview +
      `</i></td>
            <td><b>` +
      d.users_inroom +
      `</b></td>
            <td> 
                <div class="btn-group">
                ` +
      btnVaoPhong +
      `
                ` +
      btnXoa +
      `
                </div>
            </td>
        </tr>`;
  }

  $("#tbRooms tbody").html(s);
}

function taoPhong() {
  Swal.mixin({
    allowEscapeKey: false,
    allowOutsideClick: false,
    showCloseButton: true,
    showCancelButton: true,
    cancelButtonColor: "#d33",
    reverseButtons: true,
    confirmButtonText: "Tiếp &rarr;",
    cancelButtonText: "Hủy tạo",
    progressSteps: ["1", "2", "3", "4"]
  })
    .queue([
      {
        input: "password",
        title: "Mật khẩu vào phòng?",
        text: "Để trống nếu không muốn tạo mật khẩu."
      },
      {
        input: "text",
        title: "Thông điệp?",
        text:
          "Thông điệp xem trước ngắn gọn giúp mọi người dễ dàng tìm thấy phòng của bạn."
      },
      {
        title: "Cho phép Khách?",
        text: "Tích vào ô bên dưới để cho phép hoặc hủy",
        input: "checkbox",
        inputValue: 1,
        inputPlaceholder: "Cho phép khách vào xem lượt đang chơi?"
      },
      {
        input: "text",
        title: "Tên phòng?",
        text: "Nhập vào tên phòng muốn tạo.",
        preConfirm: name => {
          if (name == "") {
            return Swal.showValidationMessage(`Tên phòng không được để trống!`);
          } else if (name.indexOf("'") >= 0 || name.indexOf('"') >= 0) {
            return Swal.showValidationMessage(
              `Tên phòng không được chứa kí tự nháy " '`
            );
          }
          for (let r of Rooms) {
            if (r.name == name) {
              return Swal.showValidationMessage(`Tên phòng bị trùng!`);
            }
            // Rooms.push(name);
          }
          return name;
        }
      }
    ])
    .then(result => {
      if (result.value) {
        requestTaoPhong(
          result.value[3],
          result.value[0],
          result.value[1],
          result.value[2]
        );
      }
    });
}

function requestTaoPhong(_name, _pass, _preview, _apceptViewer) {
  socket.emit(
    "client_create_room",
    {
      name: _name,
      pass: _pass,
      preview: _preview,
      apceptViewer: _apceptViewer
    },
    function(isSuccess) {
      if (isSuccess) {
        Swal({
          title: "Tạo thành công!",
          html: "Phòng: " + _name + " <br> Mật khẩu: " + (_pass || "Không"),
          confirmButtonText: "Vào ngay",
          showCancelButton: true,
          cancelButtonText: "Trở về"
        }).then(vaophong => {
          if (vaophong.value) {
            vaoPhong(_name);
          }
        });
      }
    }
  );
}

function checkVaoPhong(name) {
  Swal.fire({
    type: "warning",
    title: "Yêu cầu mật khẩu",
    text: "Vui lòng nhập mật khẩu",
    input: "password",
    confirmButtonText: "Vào Phòng",
    showCancelButton: true,
    cancelButtonText: "Trở về",
    reverseButtons: true,
    preConfirm: pass => {
      socket.emit("client_required_join_room", name, pass, function(isSuccess) {
        if (isSuccess) {
          vaoPhong(name);
          Swal.close();
        } else {
          Swal.showValidationMessage("Sai mật khẩu");
        }
      });
      return false;
    }
  });
}

function vaoPhong(name) {
  socket.emit("client_join_room", name, function(isSuccess) {
    if (isSuccess) {
      if (_p5Instance) _p5Instance.remove();

      _p5Instance = new p5(caro, "cnv");
      openGame(true);

      for (let r of Rooms) {
        if (r.name == name) {
          currentRoom = r;
        }
      }
    } else {
      Swal.fire({
        type: "error",
        title: "Lỗi",
        text: "Không thể vào phòng " + name
      });
    }
  });
}

function xacNhanRoiPhong() {
  Swal.fire({
    type: "warning",
    title: "Rời phòng ?",
    html: "Bạn có chắc muốn rời phòng " + currentRoom.name,
    showCancelButton: true,
    cancelButtonText: "Hủy",
    confirmButtonText: "Rời"
  }).then(result => {
    if (result.value) {
      roiPhong();
    }
  });
}

function roiPhong() {
  socket.emit("client_leave_room", function(isSuccess, errorText) {
    if (isSuccess) {
      if (_p5Instance) _p5Instance.remove();
      currentRoom = null;
      openGame(false);
    } else {
      Swal.fire({
        type: "error",
        title: errorText
      });
    }
  });
}

function xoaPhong(nameRoom) {
  Swal.fire({
    type: "warning",
    title: "Bạn có chắc muốn xóa phòng " + nameRoom,
    text: "Mọi người chơi trong phòng này sẽ bị chuyển ra sảnh",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    reverseButtons: true
  }).then(result => {
    if (result.value) {
      socket.emit("client_close_room", nameRoom, function(
        isSuccess,
        errorText
      ) {
        if (isSuccess) {
          Swal.fire({
            type: "success",
            title: "Đang đóng phòng.."
          });
        } else {
          Swal.fire({
            type: "info",
            text: errorText
          });
        }
      });
    }
  });
}

function openGame(trueFalse) {
  $(".game").css("display", trueFalse ? "block" : "none");
  $(".before-game").css("display", trueFalse ? "none" : "block");
}

// ======================= Chat ======================
function addMessage(mes, from, withTime, color, onclickFunc) {
  Swal.fire({
    toast: true,
    position: "top-end",
    text: mes,
    timer: 3000
  });

  let newMes = $("<p></p>");
  if (color) {
    newMes.css("background-color", color);
  }

  if (withTime) {
    let t = new Date();
    let spanTime = $("<span></span>")
      .css({
        "font-weight": "bold",
        color: "#ddd9"
      })
      .text(withTime ? t.getHours() + ":" + t.getMinutes() + " " : "");
    newMes.append(spanTime);
  }

  if (from) {
    let spanFrom = $("<span></span>")
      .css({
        "font-weight": "bold",
        color: "#eee9"
      })
      .text(from ? "(" + from + ") " : "");

    newMes.append(spanFrom);
  }

  if (mes) {
    newMes.append(removeCurseWord(mes));
    // newMes.append(document.createTextNode(mes));
  }

  if (onclickFunc) {
    newMes.click(onclickFunc);
  }

  $("#conversation").append(newMes);

  if (!chatIsClosing()) {
    focusToLastMessage();
  }

  if ($("#btnShowHideChat").val() == "Chat") {
    let thongbao = $("#mesChuaDoc");
    thongbao.html(Number(thongbao.text()) + 1);
    thongbao.css("display", "block");
  }
}

function removeCurseWord(w) {
  let words =
    "đĩ,địt,lồn,buồi,fuck,cặc,cứt,đụ,đù,đéo,bú,vãi,chó,fucker,bitch,damn,má mày,mẹ mày,tổ cha";
  let arrWords = words.split(",");

  for (let word of arrWords) {
    if (w.toLowerCase().indexOf(word.toLowerCase()) >= 0) {
      let hidden = "";
      for (let i = 0; i < word.length; i++) hidden += "*";

      w = replaceAll(w, word, hidden);
    }
  }
  return w;
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

function focusToLastMessage(delay) {
  let conversation = $("#conversation");
  conversation.animate(
    {
      scrollTop: conversation.prop("scrollHeight")
    },
    delay || 500
  );
}

function chatIsClosing() {
  return $("#btnShowHideChat").val() == "Chat";
}

function isTyping() {
  return $("#inpMes").is(":focus");
}
