var main = {};
var sprites;
main.keys = {}

main.canvas = document.createElement('canvas');
main.cxt = main.canvas.getContext('2d');
main.canvas.width = 640;
main.canvas.height = 360;
document.body.appendChild(main.canvas);
main.handleId = null;

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
	var v = vendors[i];
	window.requestAnimationFrame = window[v+'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[v+'CancelAnimationFrame'] ||
	    window[v+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = function(callback, element) {
	    var curTime = new Date().getTime();
	    var timeToCall = Math.max(0, 16 - (curTime - lastTime));
	    var id = window.setTimeout(
		function() { callback(curTime + timeToCall); },
		timeToCall);
	    lastTCime = curTime + timeToCall;
	    return id;
	};

	window.cancelAnimationFrame = function(id) {
	    clearTimeout(id);
	}
    }
})();

function isObjectEmpty(obj) {
    for (var prop in obj)
	if (obj.hasOwnProperty(prop))
	    return false;
    return true;
}

main.newGame = function() {
    state = new State();
    main.screen = new MainMenu();
}

main.gameLoop = function() {
    window.requestAnimationFrame(main.gameLoop);
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
    if (main.handleId !== null)
	return;
    console.log('start');
    main.frametime = Date.now();
    main.handleId = window.requestAnimationFrame(main.gameLoop);
}

main.stop = function() {
    if (main.handleId === null)
	return;
    window.cancelAnimationFrame(main.handleId);
    main.handleId = null;
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
    if (main.handleId !== null && key) {
	main.screen.keydown(key);
	e.preventDefault();
	return false;
    }
}, false)

addEventListener('keyup', function (e) {
    var key = KEYS[e.keyCode];
    if (main.handleId !== null && key) {
	main.screen.keyup(key);
	e.preventDefault();
    }
    return false;
}, false)
