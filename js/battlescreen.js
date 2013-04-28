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

BSSprite.prototype.damage_anim = function(amt) {
    var spr = this;
    var tx = spr.x, ty = spr.y;
    if (amt > 0)
	text = '+' + amt.toString();
    else if (amt < 0)
	text = amt.toString();
    else
	return null;
    var sprite = new BSText(tx, ty, text);
    return [
	sprite.insert_anim(),
	sprite.interp_anim(tx, ty, tx, ty - 12, 20, 'decel'),
	sprite.remove_anim()
    ]
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
    bs.font_small.drawLine(this.x, this.y, this.text, 1);
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
    this.animation_finished = []

    this.sprite = {};
    this.addSprite(new BSPlayer(485, 195), 'player');
    this.addSprite(new BSMonster(82, 190), 'monster0');
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
    this.frame++;
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
    if (this.show_menu)
	this.menu.draw();
    for (var i = 0; i < 2; i++) {
	for (var name in this.sprite) {
	    var sp = this.sprite[name];
	    if (sp.layer == i)
		sp.draw(this);
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

BattleScreen.prototype.do_attack = function(actor, target) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    tx += (ax < tx) ? -40 : +40;
    this.animate([
	actor.interp_anim(ax, ay, tx, ty, 30, 'jump,smooth'),
	target.damage_anim(-50),
	actor.interp_anim(tx, ty, ax, ay, 10),
    ])
}

BattleScreen.prototype.do_spell = function(actor, target) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    ax += (ax < tx) ? +16 : -16;
    var effect = new BSEffect(ax, ay, 'fire_1');
    this.animate([
	effect.insert_anim(),
	pause_anim(20),
	effect.interp_anim(ax, ay, tx, ty, 30, 'accel'),
	effect.sprite_anim(2, 10, ['fire_2', 'fire_3']),
	effect.remove_anim(),
	target.damage_anim(-50)
    ])
}

BattleScreen.prototype.do_item = function(actor) {
    var ax = actor.x, ay = actor.y;
    var sparkle = new BSEffect(ax, ay + 24, 'sparkle_1')
    this.animate([
	sparkle.insert_anim(),
	parallel_anim([
	    sparkle.interp_anim(ax, ay + 24, ax, ay - 8, 30),
	    sparkle.remove_anim()
	]),
	parallel_anim([
	    sparkle.sprite_anim(-1, 6, ['sparkle_1', 'sparkle_2'])
	]),
	actor.damage_anim(50)
    ])
}

BattleScreen.prototype.act_attack = function() {
    this.show_menu = false;
    this.do_attack(this.sprite.player, this.sprite.monster0);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_spell = function() {
    this.show_menu = false;
    this.do_spell(this.sprite.player, this.sprite.monster0);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_item = function() {
    this.show_menu = false;
    this.do_item(this.sprite.player);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.monster_action = function() {
    this.do_attack(this.sprite.monster0, this.sprite.player);
    this.queue_func(function() { this.show_menu = true; });
}
