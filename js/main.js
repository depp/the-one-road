var canvas = document.createElement('canvas');
var cxt = canvas.getContext('2d');
var frame = 0;

canvas.width = 1280;
canvas.height = 720;
document.body.appendChild(canvas);

var frame = 0;
function update() {
    frame++;
}

function redraw() {
    cxt.fillStyle = 'rgb(0, 0, 0)';
    cxt.fillRect(0, 0, 1280, 720);

    cxt.fillStyle = 'rgb(255, 255, 255)';
    cxt.font = '24px Helvetica';
    cxt.textAlign = 'left';
    cxt.textBaseline = 'top';
    cxt.fillText('Frame ' + frame, 32, 32);
}

function main() {
    var now = Date.now();
    var delta = now - frametime;
    var nframes = Math.floor(delta * (30 / 1000));
    if (nframes <= 0) {
	if (nframes < 0)
	    frametime = now;
	return;
    }
    if (nframes >= 10) {
	nframes = 10;
	frametime = now;
    } else {
	frametime += nframes / (30 / 1000);
    }
    for (var i = 0; i < nframes; i++)
	update();
    redraw();
}

var frametime = Date.now();
setInterval(main, 10);
