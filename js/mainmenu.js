function MainMenu() {
    this.background = new Image();
    this.background.src = 'img/overworld.png';

    var items = [
	{ 'title': 'Easy',
	  'action': function() { this.begin(0); } },
	{ 'title': 'Hard',
	  'action': function() { this.begin(1); } },
	{ 'title': 'Impossible',
	  'action': function() { this.begin(2); } }
    ];
    var mw = 16 * 8;
    this.menu = new Menu(this, items, 320 - mw/2, 64, mw);
    this.frame = 0;
}

MainMenu.prototype.update = function() {
    if (!this.frame)
	music_play(null, false);
    this.frame++;
    if (this.frame == 1280)
	this.frame = 0;
}

MainMenu.prototype.keydown = function(key) {
    this.menu.keydown(key);
}

MainMenu.prototype.keyup = function(key) {}

MainMenu.prototype.menu_pop = function() { }

MainMenu.prototype.draw = function() {
    main.cxt.drawImage(this.background, -Math.abs(this.frame - 640), 0);
    var tw = 16 * 10;
    drawTextBox(320 - tw / 2, 16, tw,
		['The One Road'], null, 'center');
    this.menu.draw(true);
    font.drawLine(16, 340, 'Copyright 2013 Dietrich Epp', 1);
    font.drawLine(16, 320, 'Ludum Dare, April 2013', 1);
}

MainMenu.prototype.begin = function(difficulty) {
    state = new State(difficulty);
    main.screen = new Transition(this, new Overworld(), false);
}
