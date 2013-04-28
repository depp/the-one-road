var sprite_img = new Image();
sprite_img.src = 'img/sprites.png';

function drawSprite(x, y, name, scale) {
    x = Math.round(x);
    y = Math.round(y);
    var img = sprite_img;
    var desc = JSON_sprites;
    var cxt = main.cxt;
    var sp = desc[name];
    cxt.drawImage(
	img, sp[0], sp[1], sp[2], sp[3],
	x, y, sp[2] * scale, sp[3] * scale);
}

function drawBox(x, y, w, h, edge, name, scale) {
    x = Math.round(x);
    y = Math.round(y);
    var img = sprite_img;
    var desc = JSON_sprites;

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
	    img, sx + sw - edge, sy + edge, edge, fh,
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
	    img, sx + edge, sy + sh - edge, fw, edge,
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
	img, sx, sy + sh - edge, edge, edge,
	x,
	y + (edge + fh * nh) * scale,
	fw * scale, edge * scale);
    cxt.drawImage(
	img, sx + sw - edge, sy, edge, edge,
	x + (edge + fw * nw) * scale,
	y,
	fw * scale, edge * scale);
    cxt.drawImage(
	img, sx + sw - edge, sy + sh - edge, edge, edge,
	x + (edge + fw * nw) * scale,
	y + (edge + fh * nh) * scale,
	fw * scale, edge * scale);
}

function drawTextBox(x, y, w, lines, selection, align)
{
    var xpos;
    switch (align) {
    default:
    case 'left':
	xpos = x + 16;
	break;

    case 'center':
	xpos = x + Math.floor(w / 2);
	break;

    case 'right':
	xpos = x + w - 16;
	break;
    }

    drawBox(x, y, w, 16 * (lines.length + 1), 16, 'Box', 1);
    for (var i = 0; i < lines.length; i++) {
	var line = lines[i];
	font.drawLine(xpos, y + 20 + i*16, line, 1, align);
    }
    if (selection || selection === 0)
	drawSprite(x - 2, y + 8 + selection*16, 'Hand', 1);
}
