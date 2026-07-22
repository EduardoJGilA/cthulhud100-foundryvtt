/**
 * Cthulhu d100 combat resolution tables (rulebook chapter 4).
 *
 * Where Call of Cthulhu 7e compares the success levels of an attack and a
 * defence, this system reads the pair off a five by five table. The result is
 * always applied to the attacker, so a defender who blocks brilliantly can turn
 * the attacker's own swing into a fumble.
 */
export default class CoC7CombatTables {
  /**
   * Outcomes a table cell can produce
   * @returns {object}
   */
  static get outcome () {
    return {
      miss: 'miss',
      hit: 'hit',
      impale: 'impale',
      maxDamage: 'maxDamage',
      fumble: 'fumble'
    }
  }

  /**
   * Roll results, weakest first. Index order matters: the tables below are
   * written as rows of five in this order.
   * @returns {Array}
   */
  static get levels () {
    return ['fumble', 'failure', 'success', 'special', 'critical']
  }

  /**
   * Dodge table. Rows are the attacker, columns the defender.
   *
   * Reproduces the "Esquiva" grid exactly as printed.
   * @returns {object}
   */
  static get dodgeTable () {
    const o = CoC7CombatTables.outcome
    return {
      //          def: fumble    failure   success   special   critical
      fumble: [o.miss, o.miss, o.fumble, o.fumble, o.fumble],
      failure: [o.miss, o.miss, o.miss, o.fumble, o.fumble],
      success: [o.impale, o.hit, o.miss, o.miss, o.fumble],
      special: [o.maxDamage, o.impale, o.hit, o.miss, o.miss],
      critical: [o.maxDamage, o.maxDamage, o.impale, o.hit, o.miss]
    }
  }

  /**
   * Block table. Same shape as the dodge table, but some cells also strip
   * resistance points from the attacker's weapon.
   *
   * The printed table takes six points off on a special block and four on a
   * critical one, which reads oddly but is what the book says.
   * @returns {object}
   */
  static get blockTable () {
    const o = CoC7CombatTables.outcome
    return {
      fumble: [o.miss, o.miss, o.fumble, o.fumble, o.fumble],
      failure: [o.miss, o.miss, o.miss, o.fumble, o.fumble],
      success: [o.impale, o.hit, o.miss, o.miss, o.fumble],
      special: [o.maxDamage, o.impale, o.hit, o.miss, o.miss],
      critical: [o.maxDamage, o.maxDamage, o.impale, o.hit, o.miss]
    }
  }

  /**
   * Resistance points the attacker's weapon loses on a block, keyed by
   * "<attacker>/<defender>". Cells not listed cost nothing.
   * @returns {object}
   */
  static get blockWeaponDamage () {
    return {
      'failure/special': 6,
      'failure/critical': 4,
      'success/critical': 2
    }
  }

  /**
   * Turn a numeric success level from the dice pool into the key the tables use.
   * @param {number} successLevel value from CoC7DicePool.successLevel
   * @returns {string} one of CoC7CombatTables.levels
   */
  static levelFromSuccessLevel (successLevel) {
    const value = parseInt(successLevel, 10)
    if (isNaN(value) || value <= -1) return 'fumble'
    if (value === 0) return 'failure'
    if (value === 1) return 'success'
    if (value === 2) return 'special'
    return 'critical'
  }

  /**
   * Whether an outcome means the attack landed.
   * @param {string} outcome one of CoC7CombatTables.outcome
   * @returns {boolean}
   */
  static outcomeHits (outcome) {
    const o = CoC7CombatTables.outcome
    return [o.hit, o.impale, o.maxDamage].includes(outcome)
  }

  /**
   * Resolve an attack against a defence.
   * @param {object} options
   * @param {string} options.attacker attacker's roll level
   * @param {string} options.defender defender's roll level
   * @param {boolean} options.blocking true when blocking, false when dodging
   * @returns {object} outcome and resistance points lost by the attacker's weapon
   */
  static resolve ({ attacker, defender, blocking = false } = {}) {
    const levels = CoC7CombatTables.levels
    const row = (blocking ? CoC7CombatTables.blockTable : CoC7CombatTables.dodgeTable)[attacker]
    const column = levels.indexOf(defender)
    if (!row || column === -1) {
      throw new Error('Invalid combat roll levels: ' + attacker + ' vs ' + defender)
    }
    return {
      outcome: row[column],
      weaponDamage: (blocking ? CoC7CombatTables.blockWeaponDamage[attacker + '/' + defender] ?? 0 : 0)
    }
  }

  /**
   * Hit location table, rolled on 1d20 (optional rule, rulebook page 30).
   * @param {number} roll result of 1d20
   * @returns {string} location key
   */
  static hitLocation (roll) {
    const r = parseInt(roll, 10) || 0
    if (r <= 3) return 'rightLeg'
    if (r <= 6) return 'leftLeg'
    if (r <= 9) return 'abdomen'
    if (r <= 12) return 'chest'
    if (r <= 15) return 'rightArm'
    if (r <= 18) return 'leftArm'
    return 'head'
  }

  /**
   * Hit points for each location, from the sum of TAM and CON.
   *
   * The printed table runs in bands of five from 6-10 up to 36-40. Each band
   * adds one point to every location, so the whole grid is a base plus the band
   * index rather than thirty-five separate numbers.
   * @param {number} siz TAM
   * @param {number} con CON
   * @returns {object} hit points per location
   */
  static locationHitPoints (siz, con) {
    const sum = (parseInt(siz, 10) || 0) + (parseInt(con, 10) || 0)
    // Band 0 is 6-10, band 1 is 11-15, and so on; clamped to the printed range
    const band = Math.max(0, Math.min(6, Math.ceil((sum - 10) / 5)))
    return {
      rightLeg: 2 + band,
      leftLeg: 2 + band,
      abdomen: 3 + band,
      chest: 4 + band,
      rightArm: 1 + band,
      leftArm: 1 + band,
      head: 2 + band
    }
  }

  /**
   * Turns a character survives an untreated wound that has driven a location
   * below its own hit points: the average of CON and POD, rounded up.
   * @param {number} con CON
   * @param {number} pow POD
   * @returns {number} turns before death
   */
  static bleedOutTurns (con, pow) {
    return Math.ceil(((parseInt(con, 10) || 0) + (parseInt(pow, 10) || 0)) / 2)
  }

  /**
   * Range multiplier applied to a ranged skill.
   *
   * Doubles inside DES x3 metres, halves past the weapon's base range and keeps
   * halving out to four times it. The rulebook applies this before any other
   * modifier.
   * @param {object} options
   * @param {number} options.distance distance to the target, in metres
   * @param {number} options.baseRange the weapon's base range, in metres
   * @param {number} options.dex the shooter's DES
   * @returns {number} multiplier, 0 when out of range
   */
  static rangeMultiplier ({ distance, baseRange, dex } = {}) {
    const d = Math.max(0, parseFloat(distance) || 0)
    const base = Math.max(0, parseFloat(baseRange) || 0)
    const pointBlank = (parseInt(dex, 10) || 0) * 3
    if (d <= pointBlank) return 2
    if (d <= base) return 1
    if (d <= base * 2) return 0.5
    if (d <= base * 3) return 0.25
    if (d <= base * 4) return 0.125
    return 0
  }

  /**
   * Initiative from DES, on the 3-18 scale.
   *
   * Readying a weapon costs five points, and being surprised halves the score
   * for the first turn only. A character may also hold back deliberately, never
   * below one: there is no acting at DES 0.
   * @param {object} options
   * @param {number} options.dex DES
   * @param {boolean} options.readying drawing or cocking a weapon this turn
   * @param {boolean} options.surprised caught off guard, first turn only
   * @param {number} options.delay points voluntarily given up
   * @returns {number} initiative score
   */
  static initiative ({ dex, readying = false, surprised = false, delay = 0 } = {}) {
    let value = parseInt(dex, 10) || 0
    if (surprised) {
      value = Math.floor(value / 2)
    }
    if (readying) {
      value -= 5
    }
    value -= Math.max(0, parseInt(delay, 10) || 0)
    return Math.max(1, value)
  }

  /**
   * Bonus for holding back to concentrate on one target: ten percent for every
   * five points of DES given up.
   * @param {number} delay points of DES given up
   * @returns {number} percentage bonus
   */
  static aimBonus (delay) {
    return Math.floor((Math.max(0, parseInt(delay, 10) || 0)) / 5) * 10
  }

  /**
   * Penalty for dodging more than once in a turn: nothing for the first, then
   * a cumulative thirty percent from the second onwards.
   * @param {number} attempt which dodge this is, counting from one
   * @returns {number} percentage modifier, never positive
   */
  static dodgePenalty (attempt) {
    const n = Math.max(1, parseInt(attempt, 10) || 1)
    return -(n - 1) * 30
  }

  /**
   * Modifiers that shift a combat roll, gathered in one place so the chat card
   * does not have to remember them.
   *
   * Changing a declared action costs twenty percent unless the change is to
   * dodge or block, which are always free. Fighting purely defensively pays
   * twenty. Lying down or taking cover hurts your own dodge and anyone shooting
   * at you equally.
   * @param {object} options
   * @param {boolean} options.changedDeclaredAction acting differently to the declaration
   * @param {boolean} options.changedToDefence the change was to dodge or block
   * @param {boolean} options.defending declared a purely defensive turn
   * @param {boolean} options.prone lying down or behind cover
   * @param {number} options.dodgeAttempt which dodge of the turn this is
   * @returns {number} total percentage modifier
   */
  static combatModifier ({
    changedDeclaredAction = false,
    changedToDefence = false,
    defending = false,
    prone = false,
    dodgeAttempt = 1
  } = {}) {
    let modifier = 0
    if (changedDeclaredAction && !changedToDefence) {
      modifier -= 20
    }
    if (defending) {
      modifier += 20
    }
    if (prone) {
      modifier -= 20
    }
    modifier += CoC7CombatTables.dodgePenalty(dodgeAttempt)
    return modifier
  }

  /**
   * Damage formula for an outcome.
   *
   * Impaling doubles the roll, and armour still applies. A maximum-damage
   * result takes every die at its highest.
   * @param {object} options
   * @param {string} options.outcome one of CoC7CombatTables.outcome
   * @param {string} options.formula the weapon's damage formula, modifier included
   * @returns {string|null} formula to roll, or null when nothing lands
   */
  static damageFormula ({ outcome, formula } = {}) {
    const o = CoC7CombatTables.outcome
    const base = (formula ?? '').toString().trim()
    if (base === '' || outcome === o.miss || outcome === o.fumble) {
      return null
    }
    if (outcome === o.impale) {
      // Impaling multiplies the damage by two
      return '(' + base + ')*2'
    }
    if (outcome === o.maxDamage) {
      return base
    }
    return base
  }

  /**
   * Whether a wound counts as severe: more than half the maximum hit points
   * from one blow. Several light wounds never add up to one.
   * @param {number} damage damage from a single blow
   * @param {number} maxHitPoints the target's maximum hit points
   * @returns {boolean}
   */
  static isSevereWound (damage, maxHitPoints) {
    const d = parseInt(damage, 10) || 0
    const max = parseInt(maxHitPoints, 10) || 0
    return max > 0 && d > max / 2
  }

  /**
   * Result of a knockout attempt, which must be declared before rolling.
   *
   * Enough damage for a severe wound puts the target out for 1d10+10 turns.
   * Anything less fails and inflicts only the weapon's minimum damage, with no
   * damage modifier.
   * @param {object} options
   * @param {number} options.damage damage the blow would have done
   * @param {number} options.maxHitPoints the target's maximum hit points
   * @returns {object} whether it worked and how long they are out
   */
  static knockout ({ damage, maxHitPoints } = {}) {
    if (CoC7CombatTables.isSevereWound(damage, maxHitPoints)) {
      return { success: true, turnsUnconscious: '1D10+10' }
    }
    return { success: false, turnsUnconscious: 0, minimumDamageOnly: true }
  }

  /**
   * Chance of breaking out of a grapple: DES x3.
   * @param {number} dex DES
   * @returns {number} percentage
   */
  static escapeGrappleChance (dex) {
    return Math.max(0, Math.min(100, (parseInt(dex, 10) || 0) * 3))
  }

  /**
   * Damage taken by an unarmed defender when blocking a blade or melee weapon attack.
   * Rulebook chapter 4 (reglas-cthulhu-d100.md §7): Blocking unarmed against a blade weapon
   * means the defender suffers the weapon's normal damage.
   * @param {object} options
   * @param {boolean} options.isUnarmedDefender true if defender is unarmed
   * @param {boolean} options.isBladeWeapon true if attacker uses a blade/sharp weapon
   * @param {string} options.damageFormula weapon damage formula
   * @returns {string|null} formula of damage taken by defender, or null
   */
  static unarmedBlockByBladeDamage ({ isUnarmedDefender = false, isBladeWeapon = false, damageFormula = '' } = {}) {
    if (isUnarmedDefender && isBladeWeapon) {
      return damageFormula || null
    }
    return null
  }

  /**
   * Checks if blocking is allowed in this turn (limit: 1 per turn).
   * @param {number} blockAttempt number of blocks attempted this turn
   * @returns {boolean} true if block is allowed
   */
  static isBlockAllowed (blockAttempt = 0) {
    return blockAttempt < 1
  }
}
