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
	this.x, this.y, this.width, 32 * (self.items.length + 1),
	16, 'Box', 1)
    for (var i = 0; i < this.items.length; i++) {
	var item = this.items[i];
	this.font.drawLine(this.x + 32, this.y + 16 + 32*i + 24,
			   item.title, 2);
    }
    if (this.active) {
	this.sprites.draw(this.x-4, this.y + 16 + this.selected * 32,
			  'Hand', 2);
    }
}

Menu.prototype.keydown = function(code) {
    console.log(code);
    switch (code) {
    case 40:
	this.selected++;
	if (this.selected >= this.items.length)
	    this.selected = 0;
	break;

    case 38:
	this.selected--;
	if (this.selected < 0)
	    this.selected = this.items.length - 1;
	break;
    }
}
