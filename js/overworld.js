var OVERWORLD_WIDTH = 968;
var OVERWORLD_SPEED = 2;

function Overworld() {
    if (state.next_encounter <= 0)
	state.gen_next_encounter();

    this.background = new Image();
    this.background.src = 'img/overworld.png';

    this.move_left = false;
    this.move_right = false;
}

Overworld.prototype.move = function() {
    var move = (this.move_left ? 1 : 0) + (this.move_right ? -1 : 0);
    if (!move || state.next_encounter <= 0)
	return;
    var pos = state.pos, enc = state.next_encounter;
    var rate = move > 0 ? 2 : 1;
    for (var i = 0; i < OVERWORLD_SPEED; i++) {
	if (move > 0 && pos == OVERWORLD_WIDTH)
	    break;
	if (move < 0 && pos == 0)
	    break;
	pos += move;
	if (pos > 64)
	    enc -= rate;
	if (enc <= 0)
	    break;
    }
    state.pos = pos;
    state.next_encounter = enc;
}

Overworld.prototype.update = function() {
    this.move();
    if (state.next_encounter <= 0) {
	main.screen = new Transition(
	    this, new BattleScreen('gremlin1'), false);
	return;
    }
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
