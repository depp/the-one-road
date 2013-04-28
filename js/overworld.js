var OVERWORLD_WIDTH = 968;
var OVERWORLD_SPEED = 2;

function Overworld() {
    if (state.next_encounter <= 0)
	state.gen_next_encounter();

    this.background = new Image();
    this.background.src = 'img/overworld.png';

    this.move_left = false;
    this.move_right = false;

    var items = [
	{ 'title': 'Menu',
	  'action': this.do_menu, },
	{ 'title': 'Shop',
	  'action': this.do_store }
    ]
    this.menu = [new Menu(this, items, 16*35, 16*19, 16*4)];
}

Overworld.prototype.menu_pop = function() {
    if (this.menu.length > 1)
	this.menu.pop();
}

Overworld.prototype.move = function() {
    var move = (this.move_left ? 1 : 0) + (this.move_right ? -1 : 0);
    if (!move || state.next_encounter <= 0)
	return;
    var pos = state.pos, enc = state.next_encounter;
    var rate = move > 0 ? 2 : 1;
    for (var i = 0; i < OVERWORLD_SPEED; i++) {
	if (move > 0 && pos == OVERWORLD_WIDTH) {
	    enc = 0;
	    break;
	}
	if (move < 0 && pos == 0)
	    break;
	pos += move;
	if (pos >= 64)
	    enc -= rate;
	if (enc <= 0)
	    break;
    }
    state.pos = pos;
    state.next_encounter = enc;
}

Overworld.prototype.do_encounter = function() {
    var frac = (state.pos - 64) / (OVERWORLD_WIDTH - 64);
    var enc = Math.floor(frac * (ENCOUNTERS.length - 1));
    main.screen = new Transition(
	this, new BattleScreen(ENCOUNTERS[enc]), false);
}

Overworld.prototype.update = function() {
    this.move();
    if (state.next_encounter <= 0) {
	this.do_encounter();
	return;
    }
    this.menu[0].hide_item(1, state.pos >= 64);
    var frac = state.pos / OVERWORLD_WIDTH;
    if (frac < 0.3)
	music_play(0)
    else if (frac > 0.4 && frac < 0.6)
	music_play(1);
    else if (frac > 0.7)
	music_play(2);
}

Overworld.prototype.draw = function() {
    var cxt = main.cxt;
    var FAR_RIGHT = 1136, MARGIN = 128;
    var px = 1136 - state.pos;
    var fracx = (OVERWORLD_WIDTH - MARGIN - state.pos) /
	(OVERWORLD_WIDTH - 2*MARGIN);
    if (fracx < 0) fracx = 0;
    if (fracx > 1) fracx = 1;
    var bgpos = 640 * fracx;
    cxt.drawImage(this.background, -bgpos, 0);

    drawSprite(px - bgpos + 2 * Math.abs(Math.sin(px / 10)),
	       230 + 2 * Math.abs(Math.sin(px / 10)),
	       'player_overworld', 1);

    this.menu[this.menu.length-1].draw(true);
}

Overworld.prototype.keydown = function(key) {
    if (this.menu.length <= 1) {
	switch (key) {
	case 'left': this.move_left = true; return;
	case 'right': this.move_right = true; return;
	default:
	    break;
	}
    }
    this.menu[this.menu.length - 1].keydown(key);
}

Overworld.prototype.keyup = function(key) {
    if (this.menu.length <= 1) {
	switch (key) {
	case 'left': this.move_left = false; break;
	case 'right': this.move_right = false; break;
	default:
	    break;
	}
    }
}
Overworld.prototype.do_store = function() {
    this.move_left = false;
    this.move_right = false;
    this.menu.push(new StoreMenu(this));
}

Overworld.prototype.do_menu = function() {
    this.move_left = false;
    this.move_right = false;
    this.menu.push(new StatMenu(this));
}

function StoreMenu(obj) {
    this.obj = obj;
    var items = [
	{ 'title': 'Swords', 'action': this.do_swords },
	{ 'title': 'Armor', 'action': this.do_armor },
	{ 'title': 'Spells', 'action': this.do_spells },
	{ 'title': 'Items', 'action': this.do_items },
    ]
    var mw = 16*8;
    this.menu = [new Menu(this, items, 320 - mw / 2, 64, mw)];
    this.msg = null;
}

StoreMenu.prototype.menu_pop = function() {
    this.menu.pop();
    if (!this.menu.length)
	this.obj.menu_pop();
}

StoreMenu.prototype.draw = function(active) {
    var tw = 16 * 10;
    drawTextBox(320 - tw / 2, 16, tw,
		['Shopping District',
		 'You have: ' + state.gp + ' GP'], null, 'center');
    for (var i = 0; i < this.menu.length; i++)
	this.menu[i].draw(active && i == this.menu.length - 1);
    var mw = 16 * 16;
    if (this.msg)
	drawTextBox(320 - mw / 2, 16*9, mw, this.msg, null, 'center');
}

StoreMenu.prototype.keydown = function(key) {
    this.menu[this.menu.length-1].keydown(key);
}

StoreMenu.prototype.missing_spells = function() {
    var missing = [];
    return missing;
}

StoreMenu.prototype.do_swords = function() {
    var items = [];
    for (var i = state.sword + 1; i < SWORD_INFO.length; i++) {
	var sword = SWORD_INFO[i];
	items.push({
	    'title': sword.name + ' \u2014 ' + sword.gp + ' GP',
	    'action': (function(idx) {
		return function() { this.do_swords1(idx); };
	    })(i)
	})
    }
    if (items.length) {
	this.do_submenu(items);
    } else {
	this.msg = ['You already have the best sword.'];
    }
}

StoreMenu.prototype.do_armor = function() {
    var items = [];
    for (var i = state.armor + 1; i < ARMOR_INFO.length; i++) {
	var armor = ARMOR_INFO[i];
	items.push({
	    'title': armor.name + ' \u2014 ' + armor.gp + ' GP',
	    'action': (function(idx) {
		return function() { this.do_armor1(idx); };
	    })(i)
	})
    }
    if (items.length) {
	this.do_submenu(items);
    } else {
	this.msg = ['You already have the best armor.'];
    }
}

StoreMenu.prototype.do_spells = function() {
    var items = [];
    for (var i = 0; i < SPELLS.length; i++) {
	var spell = SPELLS[i];
	if (spell in state.spells)
	    continue;
	var info = SPELL_INFO[spell];
	items.push({
	    'title': info.name + ' \u2014 ' + info.gp + ' GP',
	    'action': (function(name) {
		return function() { this.do_spell1(name); };
	    })(spell)
	})
    }
    if (items.length) {
	this.do_submenu(items);
    } else {
	this.msg = ['You already know all the spells.'];
    }
}

StoreMenu.prototype.do_items = function() {
    var items = [];
    for (var i = 0; i < ITEMS.length; i++) {
	var item = ITEMS[i];
	var info = ITEM_INFO[item];
	items.push({
	    'title': (state.items[item] || 0).toString() + '  ' +
		info.name + ' \u2014 ' + info.gp + ' GP',
	    'action': (function(name) {
		return function() { this.do_item1(name); };
	    })(item)
	})
    }
    this.do_submenu(items);
}

StoreMenu.prototype.do_submenu = function(items) {
    this.msg = null;
    var mw = 16*12;
    this.menu.push(new Menu(this, items, 320 - mw / 2, 16*11, mw));
}

StoreMenu.prototype.pay = function(gp) {
    if (state.gp < gp) {
	this.msg = [rand_message(MSG_CANTBUY)];
	return false;
    } else {
	this.msg = [rand_message(MSG_DIDBUY)];
	sfxPlay('money');
	state.gp -= gp;
	return true;
    }
}

StoreMenu.prototype.do_swords1 = function(idx) {
    var info = SWORD_INFO[idx];
    if (!this.pay(info.gp))
	return;
    this.menu_pop();
    state.sword = idx;
}

StoreMenu.prototype.do_armor1 = function(idx) {
    var info = ARMOR_INFO[idx];
    if (!this.pay(info.gp))
	return;
    this.menu_pop();
    state.armor = idx;
}

StoreMenu.prototype.do_spell1 = function(name) {
    var info = SPELL_INFO[name];
    if (!this.pay(info.gp))
	return;
    this.menu_pop();
    state.spells[name] = true;
}

StoreMenu.prototype.do_item1 = function(name) {
    var info = ITEM_INFO[name];
    if (!this.pay(info.gp))
	return;
    state.items[name] = (state.items[name] || 0) + 1;
    var menu = this.menu[this.menu.length-1];
    menu.set_item_name(menu.selected, 
		       state.items[name].toString() + '  ' +
		       info.name + ' \u2014 ' + info.gp + ' GP');
}

function StatMenu(obj) {
    this.obj = obj;
    var items = [
	{ 'title': 'Return to Game', 'action': this.menu_pop },
	{ 'title': 'Quit to Menu', 'action': this.do_quit },
	{ 'title': 'Use Item', 'action': this.do_item }
    ]
    var mw = 16*10;
    this.menu = [new Menu(this, items, 480 - mw / 2, 64, mw)];
    this.msg = null;
}

StatMenu.prototype.menu_pop = function() {
    this.menu.pop();
    if (!this.menu.length)
	this.obj.menu_pop();
}

StatMenu.prototype.draw = function(active) {
    var tw = 16 * 10;
    drawTextBox(480 - tw / 2, 16, tw, ['Game Menu'], null, 'center');
    for (var i = 0; i < this.menu.length; i++)
	this.menu[i].draw(active && i == this.menu.length - 1);
    if (this.msg)
	drawTextBox(480 - tw / 2, 16*8, tw, this.msg, null, 'center');

    tw = 16 * 12;
    drawTextBox(160 - tw / 2, 16, tw, ['Character Info'], null, 'center');
    var info = [
	'Equipment:',
	'  Left Hand: ' + SWORD_INFO[state.sword].name,
	'  Right Hand: \u2014',
	'  Armor: ' + ARMOR_INFO[state.armor].name
    ]
    drawTextBox(160 - tw / 2, 64, tw, info, null, 'left');
    info = [
	'Level: ' + state.level +
	    (state.level == MAX_LEVEL ? ' (Max)' :
	     ' (' + state.xp + '/' + level_xp(state.level) + ' XP)'),
	'HP: ' + state.hp + '/' + level_hp(state.level),
	'MP: ' + state.mp + '/' + level_mp(state.level),
	'ATK: ' + SWORD_ATTACK[state.sword],
	'DEF: ' + ARMOR_DEFENSE[state.armor],
	'GP: ' + state.gp
    ];
    drawTextBox(160 - tw / 2, 16*10, tw, info, null, 'left');
}

StatMenu.prototype.keydown = function(key) {
    this.msg = null;
    this.menu[this.menu.length-1].keydown(key);
}

StatMenu.prototype.do_quit = function() {
    var items = [
	{ 'title': 'Continue Playing', 'action': this.menu_pop },
	{ 'title': 'End Game', 'action': this.do_quit1 }
    ]
    this.do_submenu(items);
}

StatMenu.prototype.do_item = function() {
    var items = [];
    for (var i = 0; i < ITEMS.length; i++) {
	var item = ITEMS[i];
	if (!(item in state.items))
	    continue;
	var info = ITEM_INFO[item];
	items.push({
	    'title': state.items[item].toString() + '  ' + info.name,
	    'action': (function(name) {
		return function() { this.do_item1(name); };
	    })(item)
	})
    }
    if (items.length) {
	this.do_submenu(items);
    } else {
	this.msg = ['No items.'];
    }
}

StatMenu.prototype.do_item1 = function(name) {
    var info = ITEM_INFO[name];
    state.hp += info.hp || 0;
    state.mp += info.mp || 0;
    var menu = this.menu[this.menu.length-1];
    var sel = menu.idxs[menu.selected];
    if (--state.items[name]) {
	menu.set_item_name(
	    sel, state.items[name].toString() + '  ' + info.name);
    } else {
	delete state.items[name];
	menu.hide_item(sel, true);
	if (!menu.count)
	    this.menu_pop();
    }
}

StatMenu.prototype.do_submenu = function(items) {
    this.msg = null;
    var mw = 16*10;
    this.menu.push(new Menu(this, items, 480 - mw / 2 + 8, 72, mw));
}
