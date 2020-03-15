let player_name, socket, _p5Instance;

$(document).ready(function() {

    setupMyChatBox();

    // https://carop5js.herokuapp.com/
    connect('https://carop5js.herokuapp.com/');
    setTooltip();
    init();

    $(document).on("keyup", "#inpSearch", function() {
        var value = $(this).val().toLowerCase();
        $("#tbRooms tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).bind('keyup', 'shift+c', function(event) {
        $('#btnShowHideChat').click();
    })

    $('#inpMes').bind('keyup', 'shift+c', function(event) {
        $('#btnShowHideChat').click();
    })

    $(document).on('keyup', '#inpMes', function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#btnSendMes').click();
        }
    })

    $(document).on('click', '#btnShowHideChat', function() {
        let chatbox = $('#chatBox');

        if (chatIsClosing()) {
            $(this).val('Hide');
            chatbox.css('width', '300px');

            $('#mesChuaDoc').html('').css('display', 'none');
            cancelFlashTitle();

            $('#inpMes').focus();
            focusToLastMessage(1000);
            $('#btnClearChat').css('display', 'block');

        } else {
            $(this).val('Chat');
            chatbox.css('width', '0');
            $('#btnClearChat').css('display', 'none');
        }
    });

    $(document).on('click', '#btnSendMes', function() {
        let inp = $('#inpMes');
        if (inp.val().trim() != '') {
            socket.emit('client_send_message', {
                "mes": inp.val(),
                "from": player_name
            });
            inp.val('');
        }
    })

    $(document).on('click', '#btnClearChat', function() {
        $('#conversation').html('');
    })

    $(document).on('click', '#btnLeaveRoom', function() {
        xacNhanRoiPhong();
    })

    $(document).on('click', '#btnTaoPhong', function() {
        taoPhong();
    })
});

// window.onunload = function() {
//     socket.emit('client_send_disconnect', player_name);
// }

function setTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
}

function init() {
    Swal.fire({
        title: "Xin chào!",
        text: "Tên của bạn là?",
        allowEscapeKey: false,
        allowOutsideClick: false,
        input: 'text',
        inputValue: localStorage.getItem('caro-player-name') || '',
        inputPlaceholder: 'Nhập tên...',
        preConfirm: (name) => {
            socket.emit('client_send_new_connect', name, function(isSuccess, errorText) {

                if (isSuccess) {
                    setupEventSocket();

                    player_name = name;
                    localStorage.setItem('caro-player-name', player_name);

                    $('#player_name').append(document.createTextNode(player_name));
                    openGame(false);

                    getOnlineCount();
                    getListRooms();

                    Swal.close();

                } else {
                    Swal.showValidationMessage(errorText);
                }
            })

            return false;
        }
    })
}


// =============== Flash chat ================
(function() {

    let original = document.title;
    let timeout;

    window.flashTitle = function(newMsg, howManyTimes) {
        function step() {
            document.title = (document.title == original) ? newMsg : original;

            if (--howManyTimes > 0) {
                timeout = setTimeout(step, 2000);
            };
        };

        howManyTimes = parseInt(howManyTimes);

        if (isNaN(howManyTimes)) {
            howManyTimes = 5;
        };

        cancelFlashTitle(timeout);
        step();
    };

    window.cancelFlashTitle = function() {
        clearTimeout(timeout);
        document.title = original;
    };
}());