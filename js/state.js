var state = null;

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

SPELLS = ['arcane', 'fire', 'holy']
SPELL_INFO = {
    'arcane': {
	'name': 'Arcane Bolt',
	'cost': 2,
	'attack': 4,
	'penetration': 4,
	'area': false
    },
    'fire': {
	'name': 'Fireball',
	'cost': 5,
	'attack': 3,
	'penetration': 0,
	'area': true
    },
    'holy': {
	'name': 'Light of Heaven',
	'cost': 25,
	'attack': 12,
	'penetration': 8,
	'area': false
    },
}

MONSTER_INFO = {
    'gremlin': {
	'sprite': 'gremlin',
	'hp': 30,
	'level': 0,
	'attack': 2,
	'defense': 0
    }
}

ENCOUNTER_INFO = {
    'gremlin1': [
	['gremlin', 82, 190]
    ],
    'gremlin2': [
	['gremlin', 82, 160],
	['gremlin', 100, 210]
    ],
}

var DIFFICULTY_INFO = [
    { 'plevel': 15, 'mlevel': 5 },
    { 'plevel': 10, 'mlevel': 5 },
    { 'plevel': 5, 'mlevel': 5 }
]

function State() {
    this.difficulty = 1;
    this.level = 1;
    this.hp = level_hp(1);
    this.mp = level_mp(1);
    this.sword = 0;
    this.armor = 0;
    this.spells = {'arcane': true, 'fire': true, 'holy': true};
    this.items = {'potion': 5, 'elixir': 1, 'potato': 1};
    this.shield = false;
}
