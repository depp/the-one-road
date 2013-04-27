function BattleScreen() {
    this.frame = 0;
    this.font = new Font('font1', '7x9sharp');
}

BattleScreen.prototype.update = function () {
    this.frame++;
}

BattleScreen.prototype.draw = function() {
    var cxt = main.cxt;
    cxt.fillStyle = 'rgb(0, 0, 0)';
    cxt.fillRect(0, 0, 1280, 720);

    /*
    cxt.fillStyle = 'rgb(255, 255, 255)';
    cxt.font = '24px Helvetica';
    cxt.textAlign = 'left';
    cxt.textBaseline = 'top';
    cxt.fillText('Frame ' + this.frame, 32, 32);
    */

    this.font.drawLine(10, 100, "Hello, world! Frame " + this.frame);
}
