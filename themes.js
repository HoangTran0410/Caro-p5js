function applyTheme(name) {
    for (var i of themes) {
        if (i.name == name) {
            theme = i;
        }
    }

    document.body.style.backgroundColor = theme.body_bg_color;
    document.body.style.color = theme.body_text_color;

    var btns = document.getElementsByClassName('control')[0].getElementsByTagName('button');
    for (var btn of btns) {

        btn.style.backgroundColor = theme.btn_bg_color;
        btn.style.color = theme.btn_text_color;

        btn.onmouseout = function() {
            this.style.backgroundColor = theme.btn_bg_color;
            this.style.color = theme.btn_text_color;
        }

        btn.onmouseover = function() {
            this.style.backgroundColor = theme.btn_hover_bg_color;
            this.style.color = theme.btn_hover_text_color;
        }
    }
}

function switchTheme() {
    var index = themes.indexOf(theme);
    index++;
    if (index >= themes.length) index = 0;

    applyTheme(themes[index].name);

    game.drawGrid();
    game.drawData();
}

var themes = [{
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

    body_bg_color: "#111",
    body_text_color: "#eee",
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

    body_bg_color: "#888",
    body_text_color: "#111",
    btn_bg_color: "#ddd",
    btn_text_color: "#111",
    btn_hover_bg_color: "#999",
    btn_hover_text_color: "#000"
}]