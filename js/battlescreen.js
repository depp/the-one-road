function BattleScreen() {
    this.frame = 0;
    this.font = new Font('font1', '7x9sharp');
    this.sprites = new Sprites('sprites');
    items = [
	{'title': 'Attack'},
	{'title': 'Spell'},
	{'title': 'Item'},
    ]
    this.menu = new Menu(items, this.sprites, this.font, 32, 32*17, 32*5);
}

BattleScreen.prototype.update = function () {
    this.frame++;
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.fillStyle = 'rgb(0, 0, 0)';
    cxt.fillRect(0, 0, 1280, 720);

    /*
    this.sprites.drawBox(50, 50, 128, 256, 16, 'Box', 1);

    this.font.drawLine(42, 100, "Hello, world! Frame " + this.frame, 2);
    this.sprites.draw(10, 100-24, 'Hand', 2);
    */
    this.menu.draw();
}

BattleScreen.prototype.keydown = function(code) {
    this.menu.keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }
