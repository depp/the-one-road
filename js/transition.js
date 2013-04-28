var TRANSITION_TIME = 25;

function Transition(src, dest, reverse) {
    this.src = src;
    this.dest = dest;
    this.frame = 0;
    this.reverse = reverse;
}

Transition.prototype.draw = function() {
    var t, reverse = this.reverse;
    if (this.frame < TRANSITION_TIME) {
	t = this.frame / TRANSITION_TIME;
	this.src.draw();
    } else {
	t = (2 * TRANSITION_TIME - this.frame) / TRANSITION_TIME;
	this.dest.draw();
	reverse = !reverse;
    }
    if (t < 0)
	t = 0;
    if (t > 1)
	t = 1;
    var w = t * 320;
    var cxt = main.cxt;
    cxt.fillStyle = 'rgb(0, 0, 0)';
    if (reverse) {
	cxt.fillRect(0, 0, w, 360);
	cxt.fillRect(640 - w, 0, w, 360);
    } else {
	cxt.fillRect(320 - w, 0, w * 2, 360);
    }
}

Transition.prototype.update = function() {
    this.frame++;
    if (this.frame == TRANSITION_TIME * 2)
	main.screen = this.dest;
}

Transition.prototype.keydown = function(key) { }
Transition.prototype.keyup = function(key) { }
