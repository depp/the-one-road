var state = null;

function random(min, max) {
    var x = Math.floor(Math.random() * (max + 1 - min)) + min;
    return x >= max ? max : x;
}

function rand_message(list) {
    if (list.length <= 1)
	return list[0];
    var x = Math.floor(Math.random() * list.length);
    if (x >= list.length )
	 x = list.length - 1;
    return list[x];
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

ITEMS = ['potion', 'ether', 'elixir', 'potato']
ITEM_INFO = {
    'potion': {
	'name': 'Potion',
	'hp': 50
    },
    'ether': {
	'name': 'Ether',
	'mp': 40
    },
    'elixir': {
	'name': 'Elixir',
	'hp': 200,
	'mp': 75
    },
    'potato': {
	'name': 'Potato',
	'hp': 100
    }
}

MONSTER_INFO = {
    'gremlin': {
	'sprite': 'gremlin',
	'hp': 30,
	'level': 0,
	'attack': 2,
	'defense': 0,
	'nx': 8,
	'xp': 75
    }
}

ENCOUNTERS = ['gremlin1', 'gremlin2']
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
    { 'plevel': 15, 'mlevel': 5, 'encounter': 180 },
    { 'plevel': 10, 'mlevel': 5, 'encounter': 120 },
    { 'plevel': 5,  'mlevel': 5, 'encounter': 80 }
]

function State() {
    this.difficulty = 1;
    this.level = 1;
    this.hp = level_hp(1);
    this.mp = level_mp(1);
    this.sword = 0;
    this.armor = 0;
    this.spells = {'arcane': true, 'fire': true, 'holy': true};
    this.items = {'potion': 5, 'ether': 2, 'elixir': 1, 'potato': 1};
    this.shield = false;
    this.next_encounter = 0;
    this.pos = 0;
}

State.prototype.gen_next_encounter = function() {
    var encounter = DIFFICULTY_INFO[state.difficulty].encounter;
    encounter = random(encounter, encounter * 2);
    this.next_encounter = encounter;
}

MSG_BATTLEWIN = [
    "Victory is yours!",
    "Monsters were defeated!",
    "Onward ho!",
    "That was easy enough!",
    "You\u2013re a legend!",
    "The hero marches on!"
];

MSG_BATTLELOSE = [
    "Hero was defeated!",
    "And so ends your story.",
    "Another hero vanquished.",
    "Try again in the next life.",
    "Today was a good day to die.",
    "It all ended right there."
];
