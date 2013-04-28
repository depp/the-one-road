function BaseMenu() { }

BaseMenu.prototype.keydown = function(code) {
    switch (code) {
    case 'down':
	this.selected++;
	if (this.selected >= this.count)
	    this.selected = 0;
	sfxPlay('menu_click');
	break;

    case 'up':
	this.selected--;
	if (this.selected < 0)
	    this.selected = this.count - 1;
	sfxPlay('menu_click');
	break;

    case 'enter':
	this.do_action();
	sfxPlay('menu_click');
	break;

    case 'esc':
	this.obj.menu_pop();
	break;
    }
}

function Menu(obj, items, x, y, width) {
    this.obj = obj
    this.items = items;
    this.x = x;
    this.y = y;
    this.width = width;
    this.selected = 0;
    this.active = true;
    this.lines = [];
    this.reload();
}

Menu.prototype = new BaseMenu();

Menu.prototype.draw = function(active) {
    drawTextBox(this.x, this.y, this.width,
		this.lines, active ? this.selected : null);
}

Menu.prototype.do_action = function() {
    var idx = this.selected;
    for (var i = 0; i < this.items.length; i++) {
	var item = this.items[i];
	if ('hidden' in item)
	    continue;
	if (!idx--) {
	    item.action.call(this.obj);
	    return;
	}
    }
}

Menu.prototype.reload = function() {
    this.lines = [];
    this.idxs = [];
    for (var i = 0; i < this.items.length; i++) {
	var item = this.items[i];
	if (!('hidden' in item)) {
	    this.lines.push(item.title);
	    this.idxs.push(i);
	}
    }
    if (this.selected >= this.lines.length)
	this.selected = this.lines.length - 1;
    this.count = this.lines.length;
}

Menu.prototype.hide_item = function(idx, flag) {
    if (flag) {
	if ('hidden' in this.items[idx])
	    return;
	this.items[idx].hidden = true;
    } else {
	if (!('hidden' in this.items[idx]))
	    return;
	delete this.items[idx].hidden;
    }
    this.reload();
}

Menu.prototype.set_item_name = function(idx, name) {
    this.items[idx].title = name;
    this.reload();
}

function BSTransitionMenu(target, reverse) {
    this.target = target;
    this.reverse = reverse;
}

BSTransitionMenu.prototype.keydown = function(code) {
    if (code == 'enter')
	main.screen = new Transition(main.screen, this.target, this.reverse);
}

BSTransitionMenu.prototype.draw = function(active) { }
