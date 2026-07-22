/* global CONFIG */
// Package id. Must match "id" in static/system.json: Foundry validates it as the
// scope for game settings and document flags.
export const FOLDER_ID = 'cthulhud100'

// Cthulhu d100 stores characteristics on the classic 3-18 scale. A percentile
// check against a characteristic is rolled against the value times five, so
// CON 12 is a 60% check. Derived scores use the same factor: Idea is INT x5,
// Suerte POD x5 and Cultura General EST x5.
export const CHARACTERISTIC_MULTIPLIER = 5

// Character creation skill points (rulebook chapter 7): EST x20 to spend inside
// the chosen profession, plus INT x10 to spend on anything on the sheet.
// Cd100 used EDU x4 (or x2) and INT x2 respectively.
export const OCCUPATION_SKILL_POINTS_PER_EDU = 20
export const PERSONAL_SKILL_POINTS_PER_INT = 10

// A character with only 1 or 2 hit points left is unconscious, and comes round
// once healed back to 3 (rulebook chapter 5). Cd100 only passed out at 0.
export const UNCONSCIOUS_HP_THRESHOLD = 2

// The rulebook defines no list of eras. It assumes "la era clasica, los anos 20"
// and otherwise leaves the period to the Keeper, saying only that a couple of
// skills and pieces of kit vary "segun epoca de juego". So there is one entry,
// named after the setting the book actually assumes.
//
// Call of Cthulhu 7e shipped fourteen (Pulp, Dark Ages, Gaslight, Invictus and
// the rest) and they filled every item sheet and the compendium filter with
// settings this game does not have. Only "standard" was ever set true in any
// pack entry. The key is kept because item-system.js validates against it and
// all 116 entries reference it.
export const ERAS = {
  standard: {
    name: 'Cd100.EraStandard',
    icon: 'game-icon game-icon-tentacles-skull'
  }
}

export const MONETARY_FORMAT_KEYS = {
  decimalLeft: 'decimalLeft',
  decimalRight: 'decimalRight',
  integerLeft: 'integerLeft',
  integerRight: 'integerRight',
  lsd: 'lsd',
  roman: 'roman'
}

export const MONETARY_FORMATS = {
  decimalLeft: 'Cd100.MonetaryFormatDecimalLeft',
  decimalRight: 'Cd100.MonetaryFormatDecimalRight',
  integerLeft: 'Cd100.MonetaryFormatIntegerLeft',
  integerRight: 'Cd100.MonetaryFormatIntegerRight',
  lsd: 'Cd100.MonetaryFormatLsd',
  roman: 'Cd100.MonetaryFormatRoman'
}

export const MONETARY_TYPE_KEYS = {
  none: 'none',
  asses: 'asses',
  sestertii: 'sestertii',
  quinarii: 'quinarii',
  denarii: 'denarii',
  d: 'd',
  s: 's',
  value: 'value',
  multiplier: 'multiplier'
}

export const MONETARY_TYPES = {
  none: {
    name: 'Cd100.MonetaryTypeNone',
    filter: []
  },
  asses: {
    name: 'Cd100.MonetaryTypeAsses',
    filter: ['roman']
  },
  sestertii: {
    name: 'Cd100.MonetaryTypeSestertii',
    filter: ['roman']
  },
  quinarii: {
    name: 'Cd100.MonetaryTypeQuinarii',
    filter: ['roman']
  },
  denarii: {
    name: 'Cd100.MonetaryTypeDenarii',
    filter: ['roman']
  },
  d: {
    name: 'Cd100.MonetaryTypeDeniers',
    filter: ['lsd']
  },
  s: {
    name: 'Cd100.MonetaryTypeSous',
    filter: ['lsd']
  },
  value: {
    name: 'Cd100.MonetaryTypeOne',
    filter: []
  },
  multiplier: {
    name: 'Cd100.MonetaryTypeCreditRating',
    filter: []
  }
}

export const STATUS_EFFECTS = {
  surprised: 'surprised',
  tempoInsane: 'tempoInsane',
  indefInsane: 'indefInsane',
  unconscious: 'unconscious',
  criticalWounds: 'criticalWounds',
  dying: 'dying',
  prone: 'prone',
  dead: 'dead'
}

export const FIGHTING_NAMES = {
  fighting: 'Cd100.FightingSpecializationName',
  firearm: 'Cd100.FirearmSpecializationName',
  ranged: 'Cd100.RangedSpecializationName'
}

// Call of Cthulhu turned eleven combat situations into bonus or penalty dice.
// Cthulhu d100 has no bonus dice at all, and resolves the situations it does
// have by other means, all of them already implemented in apps/combat-tables.js:
//
//   surprise            DES halved for initiative, first turn only
//   point blank range   skill doubled inside DES x3 metres (rangeMultiplier)
//   reloading and firing DES halved for initiative
//   prone or under cover -20% to dodge, -20% to the shooter (combatModifier)
//   cover               with hit locations, the shot strikes the cover instead
//   outnumbered         no bonus; the rulebook only caps attackers at five
//
// and four that are not in the book at all: big target, small target, target in
// melee, fast moving target, and shooting with the off hand, which comes from a
// Down Darker Trails option.
//
// Emptied rather than deleted: apps/utilities.js filters it and the melee and
// ranged chat cards import it, and an empty object renders no toggles.
export const DICE_POOL_REASONS = {}

/* // FoundryVTT V13 */
export const CHAT_MESSAGE_MODE = Object.keys(CONFIG.ChatMessage.modes ?? CONFIG.Dice.rollModes).reduce((c, k) => { c[k.replace(/roll$/, '').toUpperCase()] = k; return c }, {})

export const TARGET_ALLOWED = [
  'character',
  'creature',
  'npc',
  'vehicle'
]

export const TRADE_ALLOWED = [
  'character',
  'creature',
  'npc',
  'container'
]

export const SPELL_COST_TYPE_KEYS = {
  additionalCasterPromptAdd: {
    name: 'Cd100.Spell.Cost.AdditionalCasterPromptAdd',
    group: 'Cd100.Spell.Group.AdditionalCasters'
  },
  additionalCasterCost: {
    name: 'Cd100.Spell.Cost.AdditionalCasterCost',
    group: 'Cd100.Spell.Group.AdditionalCasters'
  },
  additionalCasterPromptRequireNumber: {
    name: 'Cd100.Spell.Cost.AdditionalCasterPromptRequireNumber',
    group: 'Cd100.Spell.Group.AdditionalCasters'
  },
  additionalInformation: {
    name: 'Cd100.Spell.Cost.AdditionalInformation',
    group: 'Cd100.Spell.Group.CasterCosts'
  },
  castingTime: {
    name: 'Cd100.Spell.Cost.CastingTime',
    group: 'Cd100.Spell.Group.CastingTime'
  },
  casterCost: {
    name: 'Cd100.Spell.Cost.CasterCost',
    group: 'Cd100.Spell.Group.CasterCosts'
  },
  promptRequireNumber: {
    name: 'Cd100.Spell.Cost.PromptRequireNumber',
    group: 'Cd100.Spell.Group.Prompt'
  },
  promptShowText: {
    name: 'Cd100.Spell.Cost.PromptShowText',
    group: 'Cd100.Spell.Group.Prompt'
  },
  promptShowVariable: {
    name: 'Cd100.Spell.Cost.PromptShowVariable',
    group: 'Cd100.Spell.Group.Prompt'
  },
  promptToggleButton: {
    name: 'Cd100.Spell.Cost.PromptToggleButton',
    group: 'Cd100.Spell.Group.Prompt'
  },
  setVariable: {
    name: 'Cd100.Spell.Cost.SetVariable',
    group: 'Cd100.Spell.Group.System'
  },
  triggerPrompt: {
    name: 'Cd100.Spell.Cost.TriggerPrompt',
    group: 'Cd100.Spell.Group.Prompt'
  }
}

export const TALENT_ADJUSTMENT_TYPES = {
  disableCombatPool: {
    name: 'Cd100.Talent.Type.DisableCombatPool'
  }
}
