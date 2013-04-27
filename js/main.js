var main = {};
main.keys = {}

function initGame() {
    var scripts = [
	'font',
	'sprites',
	'menu',
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
	main.canvas.width = 1280;
	main.canvas.height = 720;
	document.body.appendChild(main.canvas);
	main.screen = new BattleScreen();
	main.intervalid = null;
	main.start();
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

main.gameLoop = function() {
    var now = Date.now();
    var delta = now - main.frametime;
    var nframes = Math.floor(delta * (30 / 1000));
    if (nframes <= 0) {
	if (nframes < 0)
	    main.frametime = now;
	return;
    }
    if (nframes >= 10) {
	nframes = 10;
	main.frametime = now;
    } else {
	main.frametime += nframes / (30 / 1000);
    }
    for (var i = 0; i < nframes; i++)
	main.screen.update();
    main.screen.draw();
}

main.start = function() {
    if (main.intervalid !== null)
	return;
    main.frametime = Date.now();
    main.intervalid = setInterval(main.gameLoop, 10);
}

main.stop = function() {
    if (main.intervalid === null)
	return;
    clearInterval(main.intervalid);
    main.intervalid = null;
}

addEventListener('keydown', function (e) {
    if (main.intervalid !== null) {
	main.screen.keydown(e.keyCode);
	e.preventDefault();
    }
    return false;
}, false)

addEventListener('keyup', function (e) {
    if (main.intervalid !== null) {
	main.screen.keyup(e.keyCode);
	e.preventDefault();
    }
    return false;
}, false)

initGame();
