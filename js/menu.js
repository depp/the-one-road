function BaseMenu() { }

BaseMenu.prototype.keydown = function(code) {
    switch (code) {
    case 'down':
	this.selected++;
	if (this.selected >= this.items.length)
	    this.selected = 0;
	break;

    case 'up':
	this.selected--;
	if (this.selected < 0)
	    this.selected = this.items.length - 1;
	break;

    case 'enter':
	this.do_action();
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
    for (var i = 0; i < this.items.length; i++)
	this.lines.push(this.items[i].title);
}

Menu.prototype = new BaseMenu();

Menu.prototype.draw = function(active) {
    text_box(this.x, this.y, this.width,
	     this.lines, active ? this.selected : null);
}

Menu.prototype.do_action = function() {
    this.items[this.selected].action.call(this.obj);
}
