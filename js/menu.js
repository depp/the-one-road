function Menu(obj, items, sprites, font, x, y, width) {
    this.obj = obj
    this.items = items;
    this.sprites = sprites;
    this.font = font;
    this.x = x;
    this.y = y;
    this.width = width;
    this.selected = 0;
    this.active = true;
    this.lines = [];
    for (var i = 0; i < this.items.length; i++)
	this.lines.push(this.items[i].title);
}

Menu.prototype.draw = function() {
    text_box(this.sprites, this.font, this.x, this.y, this.width,
	     this.lines, this.selected);
}

Menu.prototype.keydown = function(code) {
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
	this.items[this.selected].action.call(this.obj);
	break;
    }
}
