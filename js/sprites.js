var sprite_images = {};
var sprite_desc = {};

function Sprites(name) {
    var img, desc;

    if (name in sprite_images) {
	img = sprite_images[name];
    } else {
	img = new Image();
	img.src = 'sprite/' + name + '.png';
	sprite_images[name] = img;
    }

    if (name in sprite_desc) {
	desc = sprite_desc[name];
    } else {
	console
	sprite_desc[name] = null
	var req = new XMLHttpRequest();
	req.open('GET', 'sprite/' + name + '.json', true);
	req.onreadystatechange = function() {
	    if (req.readyState != 4)
		return
	    sprite_desc[name] = JSON.parse(req.responseText);
	}
	req.send(null);
    }

    this.name = name;
}

Sprites.prototype.draw = function(x, y, name, scale) {
    var img = sprite_images[this.name];
    var desc = sprite_desc[this.name];
    if (img == null || desc == null)
	return;
    var cxt = main.cxt;
    var sp = desc[name];
    cxt.drawImage(
	img, sp[0], sp[1], sp[2], sp[3],
	x, y, sp[2] * scale, sp[3] * scale);
}

Sprites.prototype.drawBox = function(x, y, w, h, edge, name, scale) {
    var img = sprite_images[this.name];
    var desc = sprite_desc[this.name];
    if (img == null || desc == null)
	return;

    var cxt = main.cxt;
    var sp = desc[name];
    var sx = sp[0], sy = sp[1], sw = sp[2], sh = sp[3];
    var fw = sw - edge * 2, fh = sh - edge * 2;
    var nw = Math.ceil((w/scale - edge * 2) / fw);
    var nh = Math.ceil((h/scale - edge * 2) / fh);

    for (var yi = 0; yi < nh; yi++) {
	for (var xi = 0; xi < nw; xi++) {
	    cxt.drawImage(
		img, sx + edge, sy + edge, fw, fh,
		x + (edge + fw * xi) * scale,
		y + (edge + fh * yi) * scale,
		fw * scale, fh * scale);
	}
    }
    for (var yi = 0; yi < nh; yi++) {
	cxt.drawImage(
	    img, sx, sy + edge, edge, fh,
	    x,
	    y + (edge + fh * yi) * scale,
	    edge, fh * scale);
	cxt.drawImage(
	    img, sw - edge, sy + edge, edge, fh,
	    x + (edge + fw * nw) * scale,
	    y + (edge + fh * yi) * scale,
	    edge * scale, fh * scale);
    }
    for (var xi = 0; xi < nw; xi++) {
	cxt.drawImage(
	    img, sx + edge, sy, fw, edge,
	    x + (edge + fw * xi) * scale,
	    y,
	    fw * scale, edge * scale);
	cxt.drawImage(
	    img, sx + edge, sh - edge, fw, edge,
	    x + (edge + fw * xi) * scale,
	    y + (edge + fh * nh) * scale,
	    fw * scale, edge * scale);
    }
    cxt.drawImage(
	img, sx, sy, edge, edge,
	x,
	y,
	fw * scale, edge * scale);
    cxt.drawImage(
	img, sx, sh - edge, edge, edge,
	x,
	y + (edge + fh * nh) * scale,
	fw * scale, edge * scale);
    cxt.drawImage(
	img, sw - edge, sy, edge, edge,
	x + (edge + fw * nw) * scale,
	y,
	fw * scale, edge * scale);
    cxt.drawImage(
	img, sw - edge, sh - edge, edge, edge,
	x + (edge + fw * nw) * scale,
	y + (edge + fh * nh) * scale,
	fw * scale, edge * scale);
}
