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

    this.party = [
	{ 'sprite': 'player_battle',
	  'pos': [485, 195] }
    ];
    this.enemy = [
	{ 'sprite': 'gremlin',
	  'pos': [82, 190] }
    ];
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
    for (var i = 0; i < this.party.length; i++) {
	var c = this.party[i];
	this.sprites.draw(c.pos[0], c.pos[1], c.sprite, 1);
    }
    for(var i = 0; i < this.enemy.length; i++) {
	var c = this.enemy[i];
	this.sprites.draw(c.pos[0], c.pos[1], c.sprite, 1);
    }
}

BattleScreen.prototype.keydown = function(code) {
    this.menu.keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }
