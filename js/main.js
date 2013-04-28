var main = {};
main.keys = {}

function isObjectEmpty(obj) {
    for (var prop in obj)
	if (obj.hasOwnProperty(prop))
	    return false;
    return true;
}

function initGame() {
    var scripts = [
	'font',
	'sprites',
	'menu',
	'audio',
	'state',
	'battlescreen'
    ];
    var count = scripts.length;
    function callback() {
	count--;
	if (count > 0)
	    return;
	console.log('starting game...');

	main.canvas = document.createElement('canvas');
	main.cxt = main.canvas.getContext('2d');
	main.canvas.width = 640;
	main.canvas.height = 360;
	document.body.appendChild(main.canvas);
	main.intervalid = null;
	main.start();
	main.newGame();
    }
    var head = document.getElementsByTagName('head')[0];
    for (var i = 0; i < scripts.length; i++) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'js/' + scripts[i] + '.js';
	script.onreadystatechange = callback;
	script.onload = callback;
	head.appendChild(script);
    }
}

main.newGame = function() {
    state = new State();
    main.screen = new BattleScreen('gremlin2');
}

main.gameLoop = function() {
    var now = Date.now();
    var delta = now - main.frametime;
    var nframes = Math.floor(delta * (60 / 1000));
    if (nframes <= 0) {
	if (nframes < 0)
	    main.frametime = now;
	return;
    }
    if (nframes >= 10) {
	nframes = 10;
	main.frametime = now;
    } else {
	main.frametime += nframes / (60 / 1000);
    }
    for (var i = 0; i < nframes; i++)
	main.screen.update();
    main.screen.draw();
}

main.start = function() {
    if (main.intervalid !== null)
	return;
    main.frametime = Date.now();
    main.intervalid = setInterval(main.gameLoop, 5);
}

main.stop = function() {
    if (main.intervalid === null)
	return;
    clearInterval(main.intervalid);
    main.intervalid = null;
}

var KEYS = {
    '40': 'down',
    '38': 'up',
    '39': 'right',
    '37': 'left',
    '13': 'enter',
    '32': 'enter',
    '27': 'esc'
}

addEventListener('keydown', function (e) {
    var key = KEYS[e.keyCode];
    if (main.intervalid !== null && key) {
	main.screen.keydown(key);
	e.preventDefault();
	return false;
    }
}, false)

addEventListener('keyup', function (e) {
    var key = KEYS[e.keyCode];
    if (main.intervalid !== null && key) {
	main.screen.keyup(key);
	e.preventDefault();
    }
    return false;
}, false)

initGame();
