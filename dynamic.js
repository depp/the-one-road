
function dynLoad() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'const.js';
    script.onreadystatechange = dynLoad2;
    script.onload = dynLoad2;
    document.getElementsByTagName('head')[0].appendChild(script);
}

function dynLoad2() {
    var scripts = [
	'font',
	'sprites',
	'menu',
	'audio',
	'state',
	'overworld',
	'transition',
	'mainmenu',
	'main',
	'battlescreen'
    ];
    var count = scripts.length;
    function callback() {
	count--;
	if (count > 0)
	    return;
	console.log('starting game...');

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

dynLoad();
