var state = null;

MAX_LEVEL = 20;

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

var SWORD_ATTACK = [2, 4, 6, 10];
var ARMOR_DEFENSE = [0, 1, 2, 4];

SWORD_INFO = [
    {
	'name': 'Fists'
    },
    {
	'name': 'Wooden Sword',
	'gp': 15,
	'sprite': 'swordb'
    },
    {
	'name': 'Rusty Sword',
	'gp': 40,
	'sprite': 'swordc'
    },
    {
	'name': 'Excalibur',
	'gp': 160,
	'sprite': 'sword',
    }
]

ARMOR_INFO = [
    {
	'name': 'Cloth',
	'sprite': 'player_battle'
    },
    {
	'name': 'Leather Armor',
	'gp': 20,
	'sprite': 'player_armor1'
    },
    {
	'name': 'Chainmail',
	'gp': 50,
	'sprite': 'player_armor2'
    },
    {
	'name': 'Iron Armor',
	'gp': 200,
	'sprite': 'player_armor3'
    }
]

SPELLS = ['arcane', 'fire', 'holy']
SPELL_INFO = {
    'arcane': {
	'name': 'Arcane Bolt',
	'cost': 2,
	'attack': 5,
	'penetration': 5,
	'area': false,
	'gp': 30,
    },
    'fire': {
	'name': 'Fireball',
	'cost': 5,
	'attack': 3,
	'penetration': 3,
	'area': true,
	'gp': 35
    },
    'holy': {
	'name': 'Light of Heaven',
	'cost': 25,
	'attack': 12,
	'penetration': 8,
	'area': false,
	'gp': 225
    },
}

ITEMS = ['potion', 'ether', 'elixir', 'potato']
ITEM_INFO = {
    'potion': {
	'name': 'Potion',
	'hp': 50,
	'gp': 10,
    },
    'ether': {
	'name': 'Ether',
	'mp': 40,
	'gp': 25,
    },
    'elixir': {
	'name': 'Elixir',
	'hp': 200,
	'mp': 75,
	'gp': 300,
    },
    'potato': {
	'name': 'Potato',
	'hp': 100,
	'gp': 1,
    }
}

MONSTER_INFO = {
    'rat': {
	'sprite': 'rat',
	'hp': 30,
	'level': 0,
	'attack': 2,
	'defense': 0
    },
    'gremlin': {
	'sprite': 'gremlin',
	'hp': 75,
	'level': 3,
	'attack': 3,
	'defense': 3,
	'nx': 8
    },
    'gremlinking': {
	'sprite': 'gremlin-king',
	'hp': 200,
	'level': 6,
	'attack': 6,
	'defense': 1,
	'nx': 8
    },
    'boss': {
	'sprite': 'boss',
	'hp': 750,
	'level': 12,
	'attack': 8,
	'defense': 4,
    }
}

ENCOUNTERS = ['rat1', 'rat2', 'gremlin1', 'gremlin2',
	      'king1', 'king2', 'king3', 'boss']
ENCOUNTER_INFO = {
    'rat1': {
	'monsters': [
	    ['rat', 82, 190]
	],
	'xp': 75,
	'gp': 10
    },
    'rat2': {
	'monsters': [
	    ['rat', 82, 160],
	    ['rat', 100, 210]
	],
	'xp': 175,
	'gp': 20
    },
    'gremlin1': {
	'monsters': [
	    ['gremlin', 82, 190]
	],
	'xp': 125,
	'gp': 40,
    },
    'gremlin2': {
	'monsters': [
	    ['gremlin', 82, 160],
	    ['gremlin', 100, 210],
	    ['gremlin', 86, 260]
	],
	'xp': 200,
	'gp': 75,
    },
    'king1': {
	'monsters': [
	    ['gremlinking', 82, 190]
	],
	'xp': 400,
	'gp': 250
    },
    'king2': {
	'monsters': [
	    ['gremlinking', 82, 210, 1],
	    ['gremlin', 110, 160],
	    ['gremlin', 140, 220],
	    ['gremlin', 110, 280]
	],
	'xp': 550,
	'gp': 200
    },
    'king3': {
	'monsters': [
	    ['gremlinking', 72, 250, 1],
	    ['gremlinking', 76, 170, 1],
	    ['gremlinking', 130, 180],
	    ['gremlinking', 145, 240]
	],
	'xp': 800,
	'gp': 400,
    },
    'boss': {
	'monsters': [
	    ['boss', 82, 210],
	],
    },
}

var DIFFICULTY_INFO = [
    { 'plevel': 15, 'mlevel': 5, 'encounter': 180, 'gp': 2, 'xp': 2 },
    { 'plevel': 10, 'mlevel': 5, 'encounter': 120, 'gp': 1.5, 'xp': 1.5 },
    { 'plevel': 5,  'mlevel': 5, 'encounter': 80, 'gp': 1, 'xp': 1 }
]

function State(difficulty) {
    this.difficulty = difficulty;
    this.level = 1;
    this.hp = level_hp(1);
    this.mp = level_mp(1);
    this.xp = 0;
    this.gp = 0;
    this.sword = 0;
    this.armor = 0;
    this.spells = {};
    this.items = {}
    this.shield = false;
    this.next_encounter = 0;
    this.pos = 0;
    this.potato = 0;
}

State.prototype.gen_next_encounter = function() {
    var encounter = DIFFICULTY_INFO[state.difficulty].encounter;
    encounter = random(encounter, encounter * 2);
    this.next_encounter = encounter;
}

// Presets for testing purposes

STATE_PRESETS = {
    'A': { 'pos': 64, 'level': 1, 'sword': 0, 'armor': 0,
	   'items': { 'potion': 2 }, 'spells': {} },
    'B': { 'pos': 250, 'level': 4, 'sword': 1, 'armor': 1,
	   'items': { 'potion': 2 },
	   'spells': { 'arcane': true } },
    'C': { 'pos': 500, 'level': 8, 'sword': 2, 'armor': 2,
	   'items': { 'potion': 2, 'ether': 1 },
	   'spells': { 'arcane': true, 'fire': true } },
    'D': { 'pos': 750, 'level': 12, 'sword': 3, 'armor': 3,
	   'items': { 'potion': 4, 'ether': 3, 'elixir': 1 },
	   'spells': { 'arcane': true, 'fire': true, 'holy': true } },
}

function fight(preset, encounter) {
    if (!(preset in STATE_PRESETS)) {
	console.log('no such preset');
	return;
    }
    if (!(encounter in ENCOUNTER_INFO)) {
	console.log('no such encounter');
	return;
    }
    state = new State(1);
    var p = STATE_PRESETS[preset];
    for (var key in p) {
	var val = p[key];
	if (!(key in state)) {
	    console.log('extraneous property: ' + key);
	    continue;
	}
	state[key] = val;
	state.hp = level_hp(state.level);
	state.mp = level_mp(state.level);
    }
    state.items = {};
    for (var key in p.items)
	state.items[key] = p.items[key];
    for (var key in p.spells)
	state.items[key] = true;
    main.screen = new BattleScreen(encounter);
}

MSG_BATTLEWIN = [
    "Victory is yours!",
    "Monsters were defeated!",
    "Onward ho!",
    "That was easy enough!",
    "You\u2019re a legend!",
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

MSG_CANTBUY = [
    "Paying customers only.",
    "You can\u2019t afford that.",
    "This isn\u2019t a charity.",
    "You gotta earn it, kid.",
    "Buzz off, cheapskate.",
    "If wishes were horses.",
    "For you, cash up front.",
    "I\u2019m on break.",
    "That\u2019s real funny."
];

MSG_DIDBUY = [
    "Thanks for your business.",
    "Please come again.",
    "Pleasure doing business.",
    "This is going towards my boat.",
    "Should I wrap that for you?",
    "Thank you, come again.",
    "Here\u2019s your receipt."
];
