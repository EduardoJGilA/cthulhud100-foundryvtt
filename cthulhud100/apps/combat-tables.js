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
}
