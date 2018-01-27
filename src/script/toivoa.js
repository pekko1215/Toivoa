const { remote } = require('electron')
const { Menu } = remote;
const { MenuItem } = remote;
var contextMenu = new Menu();
contextMenu.append(new MenuItem({
    label: '追加',
    click: function() {
        console.log();
    }
}))

window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.popup(remote.getCurrentWindow());
}, false);

window.addEventListener('load', () => {})