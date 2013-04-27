function BSSprite(name) {
    this.name = name;
}
BSSprite.prototype.draw = function(bs, x, y) {
    bs.sprites.draw(x, y, this.name, 1);
}

function BSText(text) {
    this.text = text;
    console.log('new');
}
BSText.prototype.draw = function(bs, x, y) {
    bs.font_small.drawLine(x, y, this.text, 1);
}

function BattleScreen() {
    this.frame = 0;
    this.font = new Font('font1', '7x9sharp');
    this.font_small = new Font('font1', '5x7slant');
    this.sprites = new Sprites('sprites');
    items = [
	{'title': 'Attack',
	 'action': 'act_attack' },
	{'title': 'Spell',
	 'action': 'act_spell' },
	{'title': 'Item',
	 'action': 'act_item' },
    ]
    this.menu = new Menu(this, items, this.sprites,
			 this.font, 16, 16*17, 16*5);
    this.setBackground('mountain');
    this.animation = [];

    this.sprite = {
	'player': {
	    'sprite': new BSSprite('player_battle'),
	    'pos': [485, 195],
	    'layer': 0
	},
	'monster0': {
	    'sprite': new BSSprite('gremlin'),
	    'pos': [82, 190],
	    'layer': 0
	},
	'stat': {
	    'sprite': null,
	    'layer': 1
	}
    };
}

BattleScreen.prototype.setBackground = function(name) {
    var img = new Image();
    img.src = 'img/' + name + '.png';
    self.background = img;
}

BattleScreen.prototype.update = function() {
    this.frame++;
    if (this.animation.length > 0) {
	var frame = this.frame - this.animation_start;
	if (this.animation[0].call(this, frame)) {
	    this.animation.shift()
	    this.animation_start = this.frame;
	}
    }
}

BattleScreen.prototype.animate = function() {
    if (!this.animation.length)
	this.animation_start = this.frame;
    for (var i = 0; i < arguments.length; i++)
	this.animation.push(arguments[i]);
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.drawImage(self.background, 0, 0);
    this.menu.draw();
    for (var i = 0; i < 2; i++) {
	for (var name in this.sprite) {
	    var sp = this.sprite[name];
	    if (sp.layer == i && sp.sprite !== null)
		sp.sprite.draw(this, sp.pos[0], sp.pos[1]);
	}
    }
}

BattleScreen.prototype.keydown = function(code) {
    if (this.menu && !this.animation.length)
	this.menu.keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }

function battle_smooth(t) {
    if (t < 0)
	return 0;
    if (t > 1)
	return 1;
    return 0.5 * (1 - Math.cos(t * Math.PI));
}

function battle_dist(pos1, pos2) {
    var dx = pos1[0] - pos2[0];
    var dy = pos1[1] - pos2[1];
    return Math.sqrt(dx*dx + dy*dy);
}

function battle_interp(p1, p2, t, type) {
    var x1 = p1[0], x2 = p2[0], y1 = p1[1], y2 = p2[1];
    var x = t * x2 + (1 - t) * x1;
    var y = t * y2 + (1 - t) * y1;
    switch (type) {
    case 'jump':
	y -= battle_dist(p1, p2) * t * (1 - t);
	break;

    default:
	break;
    }
    return [x, y];
}

BattleScreen.prototype.do_attack = function(actor, target) {
    var apos = this.sprite[actor].pos;
    var tpos = this.sprite[target].pos;
    var fpos = [
	tpos[0] + (apos[0] < tpos[0] ? -40 : +40),
	tpos[1]
    ]
    this.animate(
	function(frame) {
	    var t = frame / 15;
	    t = battle_smooth(t);
	    this.sprite[actor].pos = battle_interp(apos, fpos, t, 'jump');
	    return frame >= 15;
	},
	function(frame) {
	    var t = frame / 5;
	    if (!this.sprite['stat'].sprite)
		this.sprite['stat'].sprite = new BSText('-50')
	    this.sprite['stat'].pos = [
		tpos[0], tpos[1] - 12 * t];
	    return frame >= 5;
	},
	function(frame) {
	    var t = battle_smooth(frame / 5);
	    this.sprite[actor].pos = battle_interp(fpos, apos, t, 'linear');
	    return frame >= 5;
	},
	function(frame) {
	    this.sprite['stat'].sprite = null;
	    this.sprite[actor].pos = apos;
	    return true;
	}
    )
}

BattleScreen.prototype.act_attack = function() {
    this.do_attack('player', 'monster0');
}
BattleScreen.prototype.act_spell = function() {
}
BattleScreen.prototype.act_item = function() {
}
