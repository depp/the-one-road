var OVERWORLD_WIDTH = 968;
var OVERWORLD_SPEED = 2;

function Overworld() {
    this.background = new Image();
    this.background.src = 'img/overworld.png';

    this.pos = 0;

    this.move_left = false;
    this.move_right = false;
}

Overworld.prototype.update = function() {
    var move = (this.move_left ? 1 : 0) + (this.move_right ? -1 : 0);
    if (move) {
	this.pos += move * OVERWORLD_SPEED;
	if (this.pos < 0)
	    this.pos = 0;
	else if (this.pos > OVERWORLD_WIDTH)
	    this.pos = OVERWORLD_WIDTH;
    }
}

Overworld.prototype.draw = function() {
    var cxt = main.cxt;
    var FAR_RIGHT = 1136, MARGIN = 128;
    var px = 1136 - this.pos;
    var fracx = (OVERWORLD_WIDTH - MARGIN - this.pos) /
	(OVERWORLD_WIDTH - 2*MARGIN);
    if (fracx < 0) fracx = 0;
    if (fracx > 1) fracx = 1;
    var bgpos = 640 * fracx;
    cxt.drawImage(this.background, -bgpos, 0);

    sprites.draw(px - bgpos + 2 * Math.abs(Math.sin(px / 10)),
		 230 + 2 * Math.abs(Math.sin(px / 10)),
		 'player_overworld', 1);
}

Overworld.prototype.keydown = function(key) {
    switch (key) {
    case 'left': this.move_left = true; break;
    case 'right': this.move_right = true; break;
    default:
	break;
    }
}

Overworld.prototype.keyup = function(key) {
    switch (key) {
    case 'left': this.move_left = false; break;
    case 'right': this.move_right = false; break;
    default:
	break;
    }
}
