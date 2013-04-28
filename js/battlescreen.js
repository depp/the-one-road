// Sprite classes

function pause_anim(time) {
    return function(frame) { return frame >= time; }
}

function parallel_anim(funcs) {
    return function(frame) {
	this.animate(funcs);
	return true;
    }
}

function format_number(x) {
    if (x < 0)
	return '\u2013' + (-x);
    if (x > 0)
	return '+' + x;
    return '0';
}

function number_anim(x, y, text) {
    var sprite = new BSText(x, y, text);
    return [
	sprite.insert_anim(),
	sprite.interp_anim(x, y + 20, x, y - 8, 20, 'decel'),
	pause_anim(20),
	sprite.remove_anim()
    ]
}

function BSSprite() { }

BSSprite.prototype.interp = function(x1, y1, x2, y2, t, type) {
    var types = {};
    if (type) {
	var arr = type.split(',');
	for (var i = 0; i < arr.length; i++)
	    types[arr[i]] = true;
    }
    if (t <= 0) {
	t = 0;
    } else if (t >= 1) {
	t = 1;
    } else {
	if (types.decel) {
	    t = Math.sin(0.5 * Math.PI * t);
	} else if (types.accel) {
	    t = 1 - Math.cos(0.5 * Math.PI * t);
	} else if (types.smooth) {
	    t = 0.5 * (1 - Math.cos(Math.PI * t));
	}
    }
    var x = t * x2 + (1 - t) * x1;
    var y = t * y2 + (1 - t) * y1;
    if (types.jump) {
	var dx = x2 - x1, dy = y2 - y2;
	var dist = Math.sqrt(dx*dx + dy*dy);
	y -= dist * t * (1 - t);
    }
    this.x = x;
    this.y = y;
}

BSSprite.prototype.insert_anim = function() {
    var spr = this;
    return function(frame) {
	this.addSprite(spr);
	return true;
    }
}

BSSprite.prototype.interp_anim = function(x1, y1, x2, y2, time, type) {
    var spr = this;
    return function(frame) {
	var t = frame / time;
	spr.interp(x1, y1, x2, y2, t, type);
	return frame >= time;
    }
}

BSSprite.prototype.remove_anim = function() {
    var spr = this;
    return function(frame) {
	this.removeSprite(spr);
	return true;
    }
}

function BSEffect(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.layer = 1;
}

BSEffect.prototype = new BSSprite();

BSEffect.prototype.draw = function(bs) {
    bs.sprites.draw(this.x, this.y, this.sprite, 1);
}

BSEffect.prototype.sprite_anim = function(count, speed, sprites) {
    var spr = this;
    return function(frame) {
	if (!('name' in spr))
	    return true;
	if (count >= 0) {
	    if (frame >= count * speed)
		return true;
	}
	var spnum = Math.floor(frame / speed) % sprites.length;
	spr.sprite = sprites[spnum];
	return false;
    }
}

function BSText(x, y, text) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.layer = 1;
}

BSText.prototype = new BSSprite();

BSText.prototype.draw = function(bs) {
    bs.font.drawLine(this.x, this.y, this.text, 1);
}

function BSPlayer(x, y) {
    this.x = x;
    this.y = y;
    this.layer = 0;
}

BSPlayer.prototype = new BSSprite();

BSPlayer.prototype.draw = function(bs) {
    bs.sprites.draw(this.x, this.y, 'player_battle', 1);
}

function BSMonster(x, y) {
    this.x = x;
    this.y = y;
    this.layer = 0;
}

BSMonster.prototype = new BSSprite();

BSMonster.prototype.draw = function(bs) {
    bs.sprites.draw(this.x, this.y, 'gremlin', 1);
}

// Battle Screen class

function BattleScreen(state) {
    this.state = state;

    this.font = new Font('font1', '7x9sharp');
    this.sprites = new Sprites('sprites');
    this.menu = null;
    this.setBackground('mountain');
    this.animations = [];
    this.animation_finished = []

    this.sprite = {};
    this.addSprite(new BSPlayer(485, 195), 'player');
    this.addSprite(new BSMonster(82, 190), 'monster0');

    this.player_action();
}

BattleScreen.prototype.addSprite = function(obj, name) {
    if ('name' in obj) {
	console.log('not adding sprite again: ' + obj.name);
	return;
    }
    if (!name) {
	for (var i = 0; ; i++) {
	    name = 'temp_' + i;
	    if (!(name in this.sprite))
		break;
	}
    }
    this.sprite[name] = obj;
    obj.name = name;
}

BattleScreen.prototype.removeSprite = function(obj) {
    if (!('name' in obj)) {
	console.log('cannot remove sprite that does not exist');
	console.log(obj);
	return;
    }
    delete this.sprite[obj.name];
    delete obj.name;
}

BattleScreen.prototype.setBackground = function(name) {
    var img = new Image();
    img.src = 'img/' + name + '.png';
    self.background = img;
}

BattleScreen.prototype.update = function() {
    while (true) {
	var changed = false;
	for (var i = 0; i < this.animations.length; i++) {
	    var anim = this.animations[i];
	    while (anim.funcs.length) {
		var item = anim.funcs[0];
		if (item instanceof Function) {
		    if (item.call(this, anim.frame)) {
			anim.funcs.shift();
			anim.frame = 0;
		    } else {
			anim.frame++;
			break;
		    }
		} else if (item === null) {
		    anim.funcs.shift();
		    anim.frame = 0;
		} else if (item instanceof Array) {
		    anim.funcs.shift();
		    anim.funcs = item.concat(anim.funcs);
		    anim.frame = 0;
		} else {
		    console.log('bad animation');
		    console.log(item);
		    anim.funcs.shift();
		    anim.frame = 0;
		}
	    }
	    if (!anim.funcs.length)
		changed = true;
	}
	if (changed) {
	    var nanims = [];
	    for (var i = 0; i < this.animations.length; i++) {
		var anim = this.animations[i];
		if (anim.funcs.length)
		    nanims.push(anim);
	    }
	    this.animations = nanims;
	}
	if (this.animations.length)
	    return;
	while (true) {
	    if (!this.animation_finished.length)
		return;
	    this.animation_finished.shift().call(this);
	    if (this.animations.length)
		break;
	}
    }
}

BattleScreen.prototype.animate = function(funcs) {
    this.animations.push({'frame': 0, 'funcs': funcs})
}

BattleScreen.prototype.queue_func = function(func) {
    this.animation_finished.push(func);
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.drawImage(self.background, 0, 0);
    if (this.menu)
	this.menu.draw();
    for (var i = 0; i < 2; i++) {
	for (var name in this.sprite) {
	    var sp = this.sprite[name];
	    if (sp.layer == i)
		sp.draw(this);
	}
    }
    var infow = 9*16, infox = 640 - 16 - infow;
    var info = [];
    info.push('Level ' + this.state.level);
    info.push('Health ' + this.state.hp + '/' + level_hp(this.state.level));
    if (this.state.has_spells())
	info.push('Mana ' + this.state.mp + '/' + level_mp(this.state.level));
    text_box(this.sprites, this.font, infox, 16*17, infow, info);
}

BattleScreen.prototype.keydown = function(code) {
    if (this.menu && !this.animations.length)
	this.menu.keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }

BattleScreen.prototype.anim_attack = function(actor, target, amt) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    tx += (ax < tx) ? -40 : +40;
    return [
	actor.interp_anim(ax, ay, tx, ty, 30, 'jump,smooth'),
	parallel_anim([target.damage(this, amt)]),
	pause_anim(10),
	actor.interp_anim(tx, ty, ax, ay, 10)
    ]
}

BattleScreen.prototype.anim_fireball = function(actor, target, amt) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    ax += (ax < tx) ? +16 : -16;
    var effect = new BSEffect(ax, ay, 'fire_1');
    this.animate([
	effect.insert_anim(),
	pause_anim(10),
	effect.interp_anim(ax, ay, tx, ty, 30, 'accel'),
	effect.sprite_anim(2, 10, ['fire_2', 'fire_3']),
	effect.remove_anim(),
	target.damage(this, -amt)
    ])
}

BattleScreen.prototype.anim_sparkle = function(actor, amt) {
    var ax = actor.x, ay = actor.y;
    var sparkle = new BSEffect(ax, ay + 24, 'sparkle_1')
    return [
	sparkle.insert_anim(),
	parallel_anim([
	    sparkle.interp_anim(ax, ay + 24, ax, ay - 8, 30),
	    sparkle.remove_anim()
	]),
	parallel_anim([
	    sparkle.sprite_anim(-1, 6, ['sparkle_1', 'sparkle_2'])
	])
    ]
}

BattleScreen.prototype.act_attack = function() {
    this.menu = null;
    this.sprite.player.do_attack(this, this.sprite.monster0);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_spell = function() {
    this.menu = null;
    this.sprite.player.do_spell(this, this.sprite.monster0);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_item = function() {
    this.menu = null;
    this.sprite.player.do_heal(this, this.sprite.player);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.monster_action = function() {
    this.sprite.monster0.do_attack(this, this.sprite.player);
    this.queue_func(this.player_action);
}

BattleScreen.prototype.player_action = function() {
    items = [];
    items.push({'title': 'Attack', 'action': this.act_attack});
    if (this.state.has_spells())
	items.push({'title': 'Spell', 'action': this.act_spell});
    if (this.state.has_items())
	items.push({'title': 'Item', 'action': this.act_item});
    this.menu = new Menu(this, items, this.sprites,
			 this.font, 16*24, 16*17, 16*5);
}

var SWORD_ATTACK = [2, 4, 6, 10];
var ARMOR_DEFENSE = [0, 2, 5, 8];

function atk_damage(atk, def, level) {
    if (def >= atk)
	return 0;
    return random(Math.ceil(level/2), level) * (atk - def);    
}

// Player actions

BSPlayer.prototype.get_defense = function(bs) {
    return ARMOR_DEFENSE[bs.state.armor];
}

BSPlayer.prototype.damage = function(bs, amt) {
    return [
	number_anim(this.x+8, this.y, format_number(-amt)),
	function (frame) {
	    this.state.hp -= amt;
	    if (this.state.hp <= 0)
		this.state.hp = 0;
	    return true;
	}
    ]
}

BSPlayer.prototype.do_attack = function(bs, target) {
    amt = atk_damage(SWORD_ATTACK[bs.state.sword],
		     target.get_defense(bs),
		     bs.state.get_attack_level());
    bs.animate(bs.anim_attack(this, target, amt));
}

// Monster actions

BSMonster.prototype.get_defense = function(bs) {
    return 0;
}

BSMonster.prototype.damage = function(bs, amt) {
    return number_anim(this.x, this.y, format_number(-amt));
}

BSMonster.prototype.do_attack = function(bs, target) {
    amt = atk_damage(2, target.get_defense(bs), 5);
    bs.animate(bs.anim_attack(this, target, amt));
}
