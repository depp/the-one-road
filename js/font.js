var font_images = {};
var font_desc = {};

function Font(imgname, descname) {
    var img;

    if (imgname in font_images) {
	img = font_images[imgname];
    } else {
	img = new Image();
	img.src = 'font/' + imgname + '.png';
	font_images[imgname] = img;
    }

    if (descname in font_desc) {
	desc = font_desc[descname];
    } else {
	console
	font_desc[descname] = null
	var req = new XMLHttpRequest();
	req.open('GET', 'font/' + descname + '.json', true);
	req.onreadystatechange = function() {
	    if (req.readyState != 4)
		return
	    font_desc[descname] = JSON.parse(req.responseText);
	}
	req.send(null);
    }

    this.imgname = imgname;
    this.descname = descname;
}

Font.prototype.drawLine = function(x, y, text, scale) {
    var img = font_images[this.imgname];
    var desc = font_desc[this.descname];
    if (img === null || desc === null)
	return;
    var cxt = main.cxt;
    var glyphs = desc.glyphs;
    var charmap = desc.charmap;
    var xpos = x;
    var kern = null;
    for (var i = 0; i < text.length; i++) {
	var c = text[i];
	if (!(c in charmap))
	    continue;
	var g = charmap[c];
	if (kern && g in kern)
	    xpos += kern[g] * scale;
	var gd = glyphs[g];
	if (gd[3]) {
	    var b = gd[4];
	    cxt.drawImage(
		img, gd[0], gd[1], gd[2], gd[3],
		xpos, y - gd[4] * scale, gd[2] * scale, gd[3] * scale)
	}
	kern = gd[5];
	xpos += (gd[2] + 1) * scale;
    }
}
