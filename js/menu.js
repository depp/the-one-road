function Menu(items, sprites, font, x, y, width) {
    this.items = items;
    this.sprites = sprites;
    this.font = font;
    this.x = x;
    this.y = y;
    this.width = width;
    this.selected = 0;
    this.active = true;
}

Menu.prototype.draw = function() {
    this.sprites.drawBox(
	this.x, this.y, this.width, 16 * (self.items.length + 1),
	16, 'Box', 1)
    for (var i = 0; i < this.items.length; i++) {
	var item = this.items[i];
	this.font.drawLine(this.x + 16, this.y + 8 + 16*i + 12,
			   item.title, 1);
    }
    if (this.active) {
	this.sprites.draw(this.x-2, this.y + 8 + this.selected * 16,
			  'Hand', 1);
    }
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
    }
}
