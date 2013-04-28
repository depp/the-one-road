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

function sfx_anim(name) {
    return function(frame) {
	sfxPlay(name);
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

BSSprite.prototype.number_anim = function(x, y, text) {
    x += this.x + this.nx;
    y += this.y + this.ny;
    var sprite = new BSText(x, y, text);
    return [
	sprite.insert_anim(),
	sprite.interp_anim(x, y + 20, x, y - 8, 20, 'decel'),
	pause_anim(20),
	sprite.remove_anim()
    ]
}

BSSprite.prototype.sparkle_anim = function(type) {
    var ax = this.x, ay = this.y;
    var sparkle = new BSEffect(ax, ay + 16, type + '_1')
    return [
	sparkle.insert_anim(),
	parallel_anim([
	    sparkle.interp_anim(ax, ay + 16, ax, ay - 8, 30),
	    sparkle.remove_anim()
	]),
	parallel_anim([
	    sparkle.sprite_anim(-1, 6, [type + '_1', type + '_2'])
	])
    ]
}

function BSImage() { }

BSImage.prototype = new BSSprite();

BSImage.prototype.draw = function() {
    drawSprite(this.x, this.y, this.sprite, 1);
}

BSImage.prototype.sprite_anim = function(count, speed, sprites) {
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

function BSEffect(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.layer = 1;
}

BSEffect.prototype = new BSImage();

function BSText(x, y, text) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.layer = 1;
}

BSText.prototype = new BSSprite();

BSText.prototype.draw = function() {
    font.drawLine(this.x, this.y, this.text, 1);
}

function BSBox(x, y, width, lines, align) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.lines = lines;
    this.layer = 1;
    this.align = align;
}

BSBox.prototype = new BSSprite();

BSBox.prototype.draw = function() {
    drawTextBox(this.x, this.y, this.width,
		this.lines, null, this.align);
}

function BSPlayer(x, y) {
    this.x = x;
    this.y = y;
    this.layer = 0;
    this.sprite = 'player_battle';
    this.nx = 8;
    this.ny = 0;
}

BSPlayer.prototype = new BSImage();

function BSMonster(x, y, type) {
    this.info = MONSTER_INFO[type];
    this.x = x;
    this.y = y;
    this.layer = 0;
    this.sprite = this.info.sprite;
    this.hp = this.info.hp;
    this.nx = 'nx' in this.info ? this.info.nx : 0;
    this.ny = 'ny' in this.info ? this.info.ny : 0;
}

BSMonster.prototype = new BSImage();

// Battle Screen class

function BattleScreen(encounter) {
    var einfo = ENCOUNTER_INFO[encounter];

    this.encounter = einfo;
    this.menu = [];
    this.setBackground('mountain');
    this.animations = [];
    this.animation_finished = []

    this.sprite = {};
    this.addSprite(new BSPlayer(485, 195), 'player');
    for (var i = 0; i < einfo.monsters.length; i++) {
	var m = einfo.monsters[i];
	this.addSprite(new BSMonster(m[1], m[2], m[0]), 'monster' + i);
    }
    this.monster_count = einfo.monsters.length;
    this.monster_alive = einfo.monsters.length;

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
    for (var i = 0; i < 2; i++) {
	for (var name in this.sprite) {
	    var sp = this.sprite[name];
	    if (sp.layer == i)
		sp.draw();
	}
    }
    for (var i = 0; i < this.menu.length; i++) {
	this.menu[i].draw(i == this.menu.length - 1);
    }
    var infow = 9*16, infox = 640 - 16 - infow;
    var info = [];
    info.push('Level ' + state.level);
    info.push('Health ' + state.hp + '/' + level_hp(state.level));
    if (!isObjectEmpty(state.spells))
	info.push('Mana ' + state.mp + '/' + level_mp(state.level));
    drawTextBox(infox, 16*17, infow, info);
}

BattleScreen.prototype.keydown = function(code) {
    if (this.menu.length && !this.animations.length)
	this.menu[this.menu.length-1].keydown(code);
}

BattleScreen.prototype.keyup = function(code) { }

BattleScreen.prototype.menu_pop = function() {
    this.menu.pop();
}

BattleScreen.prototype.do_attack1 = function(actor, target, amt) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    tx += (ax < tx) ? -40 : +40;
    return [
	actor.interp_anim(ax, ay, tx, ty, 30, 'jump,smooth'),
	sfx_anim('hit'),
	parallel_anim([target.damage(this, amt)]),
	pause_anim(10),
	actor.interp_anim(tx, ty, ax, ay, 10)
    ]
}

BattleScreen.prototype.do_bolt = function(actor, target, type, amt, dy) {
    var ax = actor.x, ay = actor.y;
    var tx = target.x, ty = target.y;
    ay += dy * 8;
    ax += (ax < tx) ? +16 : -16;
    var effect = new BSEffect(ax, ay, type + '_1');
    return [
	effect.insert_anim(),
	pause_anim(10),
	effect.interp_anim(ax, ay, tx, ty, 30, 'accel'),
	effect.sprite_anim(2, 10, [type + '_2', type + '_3']),
	effect.remove_anim(),
	target.damage(this, amt)
    ]
}

BattleScreen.prototype.list_targets = function() {
    var targets = [];
    for (var i = 0; i < this.monster_count; i++) {
	var name = 'monster' + i;
	if (!(name in this.sprite))
	    continue;
	targets.push(this.sprite[name]);
    }
    return targets;
}

BattleScreen.prototype.act_attack = function() {
    var targets = this.list_targets();
    if (targets.length > 1) {
	this.menu.push(new BSTargetSelect(this, this.act_attack1, targets));
    } else {
	this.act_attack1(targets[0]);
    }
}

BattleScreen.prototype.act_attack1 = function(target) {
    this.menu = [];
    this.animate(this.do_attack(this.sprite.player, target));
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_spell = function() {
    var spells = state.spells;
    var items = [];
    for (var i = 0; i < SPELLS.length; i++) {
	var name = SPELLS[i];
	if (!spells[name])
	    continue;
	var info = SPELL_INFO[name];
	items.push({
	    'title': info.name + ' [' + info.cost + ']',
	    'action': (function(name) {
		return function() { this.act_spell_cast(name); }
	    })(name)
	})
    }
    if (items.length == 1) {
	items[0].action.call(this);
    } else {
	this.menu.push(new Menu(this, items, 16*19, 16*17 + 8, 16*10));
    }
}

BattleScreen.prototype.act_spell_cast = function(name) {
    var info = SPELL_INFO[name];
    if (info.cost > state.mp) {
	var sprite = this.big_msg(["Not enough mana"]);
	var menu = this.menu;
	this.animate([
	    function (frame) { this.menu = []; return true; },
	    sprite.insert_anim(),
	    pause_anim(60),
	    sprite.remove_anim(),
	    function (frame) { this.menu = menu; return true; }
	])
	return;
    }
    var targets = this.list_targets();
    if (info.area || targets.length <= 1) {
	this.act_spell_cast1(name, targets);
    } else {
	this.menu.push(new BSTargetSelect(
	    this,
	    function (target) { this.act_spell_cast1(name, [target]); },
	    targets));
    }
}

BattleScreen.prototype.act_spell_cast1 = function(name, targets) {
    var info = SPELL_INFO[name];
    state.mp -= info.cost;
    this.menu = [];
    this.animate(this.do_spell(name, this.sprite.player, targets));
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.act_item = function() {
    var items = state.items;
    var mitems = [];
    for (var i = 0; i < ITEMS.length; i++) {
	var name = ITEMS[i];
	if (!items[name])
	    continue;
	var info = ITEM_INFO[name];
	mitems.push({
	    'title': items[name].toString() + '  ' + info.name,
	    'action': (function(name) {
		return function() { this.act_item1(name); }
	    })(name)
	})
    }
    if (mitems.length == 1) {
	mitems[0].action.call(this);
    } else {
	this.menu.push(new Menu(this, mitems, 16*19, 16*17 + 8, 16*6));
    }
}

BattleScreen.prototype.act_item1 = function(name) {
    var info = ITEM_INFO[name];
    this.menu = [];
    var anim = [this.attack_msg([info.name]),
		sfx_anim('drink')];
    if (!--state.items[name])
	delete state.items[name];
    var player = this.sprite.player;
    var both = info.hp && info.mp;

    if (info.hp) {
	state.hp = Math.min(level_hp(state.level), info.hp);
	anim.push(parallel_anim([
	    player.number_anim(
		0, both ? -12 : 0,
		format_number(info.hp) + (both ? ' HP' : ''))
	]));
	anim.push(parallel_anim([
	    player.sparkle_anim('sparkle')
	]));
    }
    if (info.mp) {
	state.mp = Math.min(level_mp(state.level), info.mp);
	anim.push(parallel_anim([
	    pause_anim(both ? 5 : 0),
	    player.number_anim(
		0, 0, format_number(info.mp) + ' MP')
	]))
	anim.push(parallel_anim([
	    pause_anim(both ? 15 : 0),
	    player.sparkle_anim('sparklemp')
	]));
    }
    if (name == 'potato') {
	anim.push(this.do_spell('holy', player, this.list_targets()));
    }
    this.animate(anim);
    this.queue_func(this.monster_action);
}

BattleScreen.prototype.monster_action = function() {
    var monsters = [];
    for (var i = 0; i < this.monster_count; i++) {
	var name = 'monster' + i;
	if (!(name in this.sprite))
	    continue;
	monsters.push(this.sprite[name]);
    }
    var actor = monsters[random(0, monsters.length - 1)];
    this.animate(this.do_attack(actor, this.sprite.player));
    this.queue_func(this.player_action);
}

BattleScreen.prototype.player_action = function() {
    items = [];
    items.push({'title': 'Attack', 'action': this.act_attack});
    if (!isObjectEmpty(state.spells))
	items.push({'title': 'Spell', 'action': this.act_spell});
    if (!isObjectEmpty(state.items))
	items.push({'title': 'Item', 'action': this.act_item});
    this.menu = [new Menu(this, items, 16*19-8, 16*17, 16*5)];
}

BattleScreen.prototype.big_msg = function(lines) {
    var w = 320, h = 32, y = 16*17;
    return new BSBox((640 - w) / 2, y, w, lines, 'center');
}

BattleScreen.prototype.attack_msg = function(lines) {
    var sprite = this.big_msg(lines);
    return parallel_anim([
	sprite.insert_anim(),
	pause_anim(60),
	sprite.remove_anim()
    ])
}

BattleScreen.prototype.end = function(did_win) {
    this.menu = [];
    this.animation_finished = [];
    if (did_win) {
	var sprite = this.big_msg([rand_message(MSG_BATTLEWIN)]);
	var msgs = []
	if (state.level < MAX_LEVEL) {
	    var curlevel = state.level;
	    state.xp += this.encounter.xp;
	    while (state.level < MAX_LEVEL &&
		   state.xp >= level_xp(state.level)) {
		state.xp -= level_xp(state.level);
		state.level++;
	    }
	    if (state.level == MAX_LEVEL)
		state.xp = 0;
	    var text = '+' + this.encounter.xp + ' XP';
	    if (state.level > curlevel) {
		state.hp += level_hp(state.level) - level_hp(curlevel);
		state.mp += level_mp(state.level) - level_mp(curlevel);
		text += ', Level Up!';
	    }
	    msgs.push(text);
	}
	var w = 320, h = 32, y = 16*19+8;
	var sprite2 = new BSBox((640 - w) / 2, y, w, msgs, 'left');	
	this.animate([
	    sprite.insert_anim(),
	    pause_anim(10),
	    sprite2.insert_anim(),
	    pause_anim(30)
	]);
	this.queue_func(function() {
	    this.menu = [new BSTransitionMenu(new Overworld(), true)];
	});
    } else {
	var sprite = this.big_msg([rand_message(MSG_BATTLELOSE)]);
	this.sprite.player.sprite = 'player_dead';
	this.animate([
	    sfx_anim('deathmusic'),
	    sprite.insert_anim(),
	])
    }
}

BattleScreen.prototype.do_attack = function(actor, target) {
    var amt = atk_damage(actor.get_attack(),
			 target.get_defense(),
			 actor.get_attack_level());
    return this.do_attack1(actor, target, amt);
}

BattleScreen.prototype.do_spell = function(name, actor, targets) {
    targets.sort(function(x, y) {
	if (x.y < y.y)
	    return -1;
	if (x.y > y.y)
	    return 1;
	return x.name < y.name ? -1 : 1;
    })
    var info = SPELL_INFO[name];
    var anim = [this.attack_msg([info.name]),
		sfx_anim(name)];
    for (var i = 0; i < targets.length; i++) {
	var target = targets[i];
	var amt = atk_damage(
	    info.attack,
	    target.get_defense() - info.penetration,
	    actor.get_attack_level());
	anim.push(parallel_anim([
	    pause_anim(i * 8),
	    this.do_bolt(actor, target, name, amt, 2*i - targets.length),
	]))
    }
    return anim;
}

function atk_damage(atk, def, level) {
    // console.log('attack: ATK=' + atk + ', DEF=' + def + ', LEVEL=' + level);
    if (atk < 0)
	atk = 0;
    if (def < 0)
	def = 0;
    if (def >= atk)
	return 0;
    return random(Math.ceil(level/2), level) * (atk - def);    
}

// Player actions

BSPlayer.prototype.get_attack = function() {
    return SWORD_ATTACK[state.sword];
}

BSPlayer.prototype.get_defense = function() {
    return ARMOR_DEFENSE[state.armor];
}

BSPlayer.prototype.get_attack_level = function() {
    return state.level + DIFFICULTY_INFO[state.difficulty].plevel;
}

BSPlayer.prototype.damage = function(bs, amt) {
    return [
	this.number_anim(0, 0, format_number(-amt)),
	function (frame) {
	    state.hp -= amt;
	    if (state.hp <= 0) {
		state.hp = 0;
		bs.queue_func(function() { this.end(false); });
	    }
	    return true;
	}
    ]
}

// Monster actions

BSMonster.prototype.get_attack = function() {
    return this.info.attack;
}

BSMonster.prototype.get_defense = function() {
    return this.info.defense;
}

BSMonster.prototype.get_attack_level = function() {
    return this.info.level + DIFFICULTY_INFO[state.difficulty].mlevel;
}

BSMonster.prototype.damage = function(bs, amt) {
    var anim = [this.number_anim(0, 0, format_number(-amt))];
    this.hp -= amt;
    if (this.hp <= 0) {
	anim.push(this.remove_anim());
	bs.monster_alive--;
	if (!bs.monster_alive)
	    bs.queue_func(function() { this.end(true); });
    } else if (amt < 0 && this.hp >= this.info.hp) {
	this.hp = this.info.hp;
    }
    return anim;
}

// Target selection menu

function BSTargetSelect(obj, action, targets) {
    this.obj = obj;
    this.action = action;
    this.items = targets;
    this.selected = 0;
    this.count = targets.length;
}

BSTargetSelect.prototype = new BaseMenu();

BSTargetSelect.prototype.draw = function(active) {
    if (!active)
	return;
    var target = this.items[this.selected];
    drawSprite(target.x - 12, target.y + 16, 'Hand', 1);
}

BSTargetSelect.prototype.do_action = function() {
    this.action.call(this.obj, this.items[this.selected]);
}
