function BattleScreen() {
    this.frame = 0;
    this.font = new Font('font1', '7x9sharp');
    this.sprites = new Sprites('sprites');
    items = [
	{'title': 'Attack'},
	{'title': 'Spell'},
	{'title': 'Item'},
    ]
    this.menu = new Menu(items, this.sprites, this.font, 16, 16*17, 16*5);
    this.setBackground('mountain');
}

BattleScreen.prototype.setBackground = function (name) {
    var img = new Image();
    img.src = 'img/' + name + '.png';
    self.background = img;
}

BattleScreen.prototype.update = function () {
    this.frame++;
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.drawImage(self.background, 0, 0);
    this.menu.draw();
}

BattleScreen.prototype.keydown = function(code) {
    this.menu.keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }
