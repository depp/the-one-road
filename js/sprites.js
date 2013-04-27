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
