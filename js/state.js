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
var ARMOR_DEFENSE = [0, 2, 5, 8];

SWORD_INFO = [
    {
	'name': 'Fists'
    },
    {
	'name': 'Wooden Sword',
	'gp': 15
    },
    {
	'name': 'Rusty Sword',
	'gp': 40,
    },
    {
	'name': 'Excalibur',
	'gp': 160
    }
]

ARMOR_INFO = [
    {
	'name': 'Cloth'
    },
    {
	'name': 'Leather Armor',
	'gp': 20
    },
    {
	'name': 'Chainmail',
	'gp': 50
    },
    {
	'name': 'Iron Armor',
	'gp': 200
    }
]

SPELLS = ['arcane', 'fire', 'holy']
SPELL_INFO = {
    'arcane': {
	'name': 'Arcane Bolt',
	'cost': 2,
	'attack': 4,
	'penetration': 4,
	'area': false,
	'gp': 30,
    },
    'fire': {
	'name': 'Fireball',
	'cost': 5,
	'attack': 3,
	'penetration': 0,
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
    'gremlin': {
	'sprite': 'gremlin',
	'hp': 30,
	'level': 0,
	'attack': 2,
	'defense': 0,
	'nx': 8
    }
}

ENCOUNTERS = ['gremlin1', 'gremlin2']
ENCOUNTER_INFO = {
    'gremlin1': {
	'monsters': [
	    ['gremlin', 82, 190]
	],
	'xp': 75
    },
    'gremlin2': {
	'monsters': [
	    ['gremlin', 82, 160],
	    ['gremlin', 100, 210]
	],
	'xp': 175
    },
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
    this.xp = 0;
    this.gp = 0;
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
