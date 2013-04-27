function BSSprite(name) {
    this.name = name;
}
BSSprite.prototype.draw = function(bs, x, y) {
    bs.sprites.draw(x, y, this.name, 1);
}

function BSText(text) {
    this.text = text;
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
    this.show_menu = true;
    this.setBackground('mountain');
    this.animations = [];
    this.animation_queue = []

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
	},
	'effect': {
	    'sprite': null,
	    'layer': 1
	},
    };
}

BattleScreen.prototype.setBackground = function(name) {
    var img = new Image();
    img.src = 'img/' + name + '.png';
    self.background = img;
}

BattleScreen.prototype.update = function() {
    this.frame++;
    if (this.animations.length > 0) {
	var changed = false;
	for (var i = 0; i < this.animations.length; i++) {
	    var anim = this.animations[i];
	    var frame = this.frame - anim.start;
	    if (anim.funcs[0].call(this, frame)) {
		anim.funcs.shift();
		anim.start = this.frame;
		if (!anim.funcs.length)
		    changed = true;
	    }
	}
	if (changed) {
	    var nanims = [];
	    for (var i = 0; i < this.animations.length; i++) {
		var anim = this.animations[i];
		if (anim.funcs.length)
		    nanims.push(anim);
	    }
	    this.animations = nanims;
	    if (!nanims.length && this.animation_queue.length) {
		this.animate(false, this.animation_queue.shift())
	    }
	}
    }
}

BattleScreen.prototype.animate = function(queue, funcs) {
    if (queue && this.animations.length) {
	this.animation_queue.push(funcs);
    } else {
	this.animations.push({
	    'start': this.frame,
	    'funcs': funcs
	})
    }
}

BattleScreen.prototype.queue_func = function(func) {
    funcs = [
	function(frame) {
	    func.call(this);
	    return true;
	}
    ]
    this.animate(true, funcs);
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.drawImage(self.background, 0, 0);
    if (this.show_menu)
	this.menu.draw();
    for (var i = 0; i < 2; i++) {
	for (var name in this.sprite) {
	    var sp = this.sprite[name];
	    if (sp.layer == i && sp.sprite !== null)
		sp.sprite.draw(this, sp.pos[0], sp.pos[1]);
	}
    }
    var infow = 9, infox = 640 - (infow+1)*16;
    this.sprites.drawBox(infox, 16*17, 16*infow, 16*4,
			 16, 'Box', 1);
    this.font.drawLine(infox + 16, 16*17 + 20,
		       "Health 100/100", 1);
    this.font.drawLine(infox + 16, 16*17 + 20 + 16,
		       "Magic 100/100", 1);
    this.font.drawLine(infox + 16, 16*17 + 20 + 16*2,
		       "Level 1  Potions 5", 1);
}

BattleScreen.prototype.keydown = function(code) {
    if (this.show_menu && !this.animations.length)
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

BattleScreen.prototype.do_damage = function(target, amt) {
    var tpos = this.sprite[target].pos;
    var text;
    if (amt > 0)
	text = '+' + amt.toString();
    else if (amt < 0)
	text = amt.toString();
    else
	return;
    this.sprite.stat.sprite = new BSText(text);
    this.animate(false, [
	function(frame) {
	    var t = frame > 10 ? 1 : frame / 10;
	    this.sprite.stat.pos = [
		tpos[0], tpos[1] - 12 * t];
	    return frame >= 20;
	},
	function(frame) {
	    this.sprite.stat.sprite = null;
	    return true;
	}
    ])
}

BattleScreen.prototype.do_attack = function(actor, target) {
    var apos = this.sprite[actor].pos;
    var tpos = this.sprite[target].pos;
    var fpos = [
	tpos[0] + (apos[0] < tpos[0] ? -40 : +40),
	tpos[1]
    ]
    this.animate(false, [
	function(frame) {
	    var t = frame / 30;
	    t = battle_smooth(t);
	    this.sprite[actor].pos = battle_interp(apos, fpos, t, 'jump');
	    return frame >= 30;
	},
	function(frame) {
	    this.do_damage(target, -50);
	    return true;
	},
	function(frame) {
	    var t = battle_smooth(frame / 10);
	    this.sprite[actor].pos = battle_interp(fpos, apos, t, 'linear');
	    return frame >= 10;
	},
	function(frame) {
	    this.sprite[actor].pos = apos;
	    return true;
	}
    ])
}

BattleScreen.prototype.do_spell = function(actor, target) {
    var apos = this.sprite[actor].pos;
    var tpos = this.sprite[target].pos;
    var spos = [apos[0], apos[1]]
    var fpos = [tpos[0], tpos[1]]
    if (apos[0] < tpos[0])
	spos[0] += 16;
    else
	spos[0] -= 16;
    this.animate(false, [
	function(frame) {
	    if (!this.sprite.effect.sprite)
		this.sprite.effect.sprite = new BSSprite('fire_1');
	    this.sprite.effect.pos = spos;
	    return frame >= 20;
	},
	function(frame) {
	    var t = frame / 30;
	    t = battle_smooth(t*0.5) * 2.0;
	    this.sprite.effect.pos = battle_interp(spos, fpos, t, 'linear');
	    return frame >= 30;
	},
	function(frame) {
	    this.sprite.effect.pos = fpos;
	    this.sprite.effect.sprite.name = (
		frame <= 10 ? 'fire_2' : 'fire_3');
	    return frame >= 20;
	},
	function(frame) {
	    this.sprite.effect.sprite = null;
	    this.do_damage(target, -50);
	    return true;
	}
    ])
}

BattleScreen.prototype.do_item = function(actor) {
    var sp = new BSSprite('sparkle_1');
    var apos = this.sprite[actor].pos
    var dist = 24;
    var pos = [apos[0], apos[1]];
    this.sprite.effect.sprite = sp;
    this.sprite.effect.pos = pos;
    this.do_damage(actor, 50);
    this.animate(false, [
	function(frame) {
	    var f = Math.floor(frame / 6) & 1;
	    var t = frame / 30;
	    pos[1] = apos[1] - 8 + (1-t) * 32;
	    sp.name = 'sparkle_' + (f + 1);
	    return frame >= 30;
	},
	function(frame) {
	    this.sprite.effect.sprite = null;
	    return true;
	}
    ])
}

BattleScreen.prototype.act_attack = function() {
    this.show_menu = false;
    this.do_attack('player', 'monster0');
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_spell = function() {
    this.show_menu = false;
    this.do_spell('player', 'monster0');
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_item = function() {
    this.show_menu = false;
    this.do_item('player');
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.monster_action = function() {
    this.do_attack('monster0', 'player');
    this.animate(true, [function() { this.show_menu = true; return true; }]);
}
