function applyTheme(t) {
    theme = themes[t];

    document.body.style.backgroundColor = theme.body_bg_color;
    document.body.style.color = theme.body_text_color;

    var btns = document.getElementsByClassName('control')[0].getElementsByTagName('button');
    for (var btn of btns) {

        btn.style.backgroundColor = theme.btn_bg_color;
        btn.style.color = theme.btn_text_color;

        btn.onmouseout = function () {
            this.style.backgroundColor = theme.btn_bg_color;
            this.style.color = theme.btn_text_color;
        }

        btn.onmouseover = function () {
            this.style.backgroundColor = theme.btn_hover_bg_color;
            this.style.color = theme.btn_hover_text_color;
        }
    }
}

function addToSelect() {
    var select = document.getElementsByName('chooseTheme')[0];
    var s = '';
    for (var i in themes) {
        s += `<option value="` + i + `">` + i + `</option>`;
    }
    select.innerHTML = s;
}

var themes = {
    dark: {
        canvas_bg_color: "#111",
        table_bg_color: "#0000",
        table_stroke_color: "#7777",
        x_color: "#e00",
        o_color: "#0e0",
        x_hover_color: "#e007",
        o_hover_color: "#0e07",
        hightlight_cell_bg_color: "#8887",
        hightlight_cell_stroke_color: "#bbb",
        cell_hover_bg_color: "#111",
        cell_hover_stroke_color: "#777",
        focus_cell_bg_color: "#6661",
        focus_cell_stroke_color: "#0000",

        body_bg_color: "#111",
        body_text_color: "#eee",
        btn_bg_color: "#222",
        btn_text_color: "#eee",
        btn_hover_bg_color: "#333",
        btn_hover_text_color: "#fff"
    },
    light: {
        canvas_bg_color: "#eee",
        table_bg_color: "#eee0",
        table_stroke_color: "#7777",
        x_color: "#e00",
        o_color: "#0e0",
        x_hover_color: "#e007",
        o_hover_color: "#0e07",
        hightlight_cell_bg_color: "#fff",
        hightlight_cell_stroke_color: "#bbb",
        cell_hover_bg_color: "#fff",
        cell_hover_stroke_color: "#777",
        focus_cell_bg_color: "#6661",
        focus_cell_stroke_color: "#0000",

        body_bg_color: "#888",
        body_text_color: "#111",
        btn_bg_color: "#ddd",
        btn_text_color: "#111",
        btn_hover_bg_color: "#999",
        btn_hover_text_color: "#000"
    }
}