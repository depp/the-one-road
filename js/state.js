function random(min, max) {
    var x = Math.floor(Math.random() * (max + 1 - min)) + min;
    return x >= max ? max : x;
}

function level_hp(level) {
    return 20 + 9*level + level*level;
}

function level_mp(level) {
    return 5 * level;
}

function level_xp(level) {
    return 120 + 25 * level + 5 * level * level;
}

function State() {
    this.level = 1;
    this.hp = level_hp(1);
    this.mp = level_mp(1);
    this.sword = 0;
    this.armor = 0;
    this.spells = {};
    this.items = {};
    this.shield = false;
}

State.prototype.has_spells = function() {
    return !isObjectEmpty(this.spells);
}

State.prototype.has_items = function() {
    return !isObjectEmpty(this.items);
}

State.prototype.get_attack_level = function() {
    return this.level + 10;
}
