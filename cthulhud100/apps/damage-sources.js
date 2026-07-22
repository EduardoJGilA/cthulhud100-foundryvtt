/**
 * Cthulhu d100 damage from things other than weapons (rulebook chapter 5).
 *
 * Each of these is a small rule that is easy to misremember at the table, so
 * they live here as data rather than in the head of whoever is running the game.
 */
export default class Cd100DamageSources {
  /**
   * Corrosives, by strength. Damage is per turn.
   * @returns {object}
   */
  static get acid () {
    return {
      strong: '1D6+1',
      medium: '1D4',
      weak: '1D3-1'
    }
  }

  /**
   * Fire and heat, by size of the blaze.
   * @returns {object}
   */
  static get fire () {
    return {
      candle: { damage: '1', note: '' },
      torch: { damage: '1D6', note: 'Cd100.Fire.LuckOrClothesCatch' },
      bonfire: { damage: '1D6+2', note: 'Cd100.Fire.ClothesAndHairCatch' },
      burningRoom: { damage: '1D6+2', note: 'Cd100.Fire.LuckOrSuffocate' },
      lava: { damage: '3D6', note: '' }
    }
  }

  /**
   * Turns a character can hold their breath before losing 1d6 hit points a
   * turn. Physical exertion removes the grace period entirely.
   * @param {number} con CON
   * @param {boolean} exerting whether the breath was cut off mid-effort
   * @returns {number} turns of grace
   */
  static breathHoldingTurns (con, exerting = false) {
    if (exerting) {
      return 0
    }
    return Math.floor((parseInt(con, 10) || 0) / 2)
  }

  /**
   * Staying afloat after failing a swim check. The threshold drops one
   * multiple of DES each turn: DES x5, then x4, down to DES itself.
   * @param {object} options
   * @param {number} options.dex DES
   * @param {number} options.attempt which attempt this is, counting from one
   * @returns {number} percentage to roll against
   */
  static stayAfloatChance ({ dex, attempt = 1 } = {}) {
    const multiplier = Math.max(1, 6 - Math.max(1, parseInt(attempt, 10) || 1))
    return Math.max(0, Math.min(100, (parseInt(dex, 10) || 0) * multiplier))
  }

  /**
   * Falling damage: 1d6 per three metres, counting from the fourth metre down.
   * A successful DES check takes 1d6 off the total.
   * @param {number} metres distance fallen
   * @returns {string|null} damage formula, or null for a harmless drop
   */
  static fallDamage (metres) {
    const m = Math.max(0, parseFloat(metres) || 0)
    if (m <= 3) {
      return null
    }
    const dice = Math.ceil((m - 3) / 3)
    return dice + 'D6'
  }

  /**
   * Explosive damage falls off by 1d6 for every extra radius of distance,
   * starting from the second.
   * @param {object} options
   * @param {string} options.damage damage at the centre
   * @param {number} options.radius the blast radius, in metres
   * @param {number} options.distance distance from the centre, in metres
   * @returns {string|null} damage formula, or null when out of reach
   */
  static explosionDamage ({ damage, radius, distance } = {}) {
    const r = Math.max(0, parseFloat(radius) || 0)
    const d = Math.max(0, parseFloat(distance) || 0)
    const base = (damage ?? '').toString().trim()
    if (base === '' || r === 0) {
      return null
    }
    const bands = Math.max(0, Math.ceil(d / r) - 1)
    if (bands === 0) {
      return base
    }
    return base + '-' + bands + 'D6'
  }

  /**
   * Natural healing per week of rest, improved by a carer.
   * @param {object} options
   * @param {number} options.firstAid carer's First Aid percentage
   * @param {number} options.medicine carer's Medicine percentage
   * @returns {string} healing formula per week
   */
  static weeklyHealing ({ firstAid = 0, medicine = 0 } = {}) {
    const parts = ['1D3']
    // Medicine is the better care and does not stack with plain first aid
    if ((parseInt(medicine, 10) || 0) >= 30) {
      parts.push('2D3')
    } else if ((parseInt(firstAid, 10) || 0) >= 30) {
      parts.push('1D3')
    }
    return parts.join('+')
  }

  /**
   * How long a character lasts without food or water.
   *
   * Hunger bites after CON days, but tiredness costs ten percent on everything
   * from the third day. Thirst is counted in hours and gets harsher in a desert.
   * @param {object} options
   * @param {number} options.con CON
   * @param {string} options.environment 'normal', 'arid' or 'desert'
   * @returns {object} days without food, hours without water, penalty day
   */
  static deprivation ({ con, environment = 'normal' } = {}) {
    const c = Math.max(0, parseInt(con, 10) || 0)
    const waterMultiplier = { normal: 4, arid: 3, desert: 2 }[environment] ?? 4
    return {
      daysWithoutFood: c,
      hoursWithoutWater: c * waterMultiplier,
      fatiguePenaltyFromDay: 3,
      fatiguePenalty: -10
    }
  }

  /**
   * Recovering from being dazed by a blow or a shock: CON x5, retried each turn.
   * @param {number} con CON
   * @returns {number} percentage
   */
  static concussionRecoveryChance (con) {
    return Math.max(0, Math.min(100, (parseInt(con, 10) || 0) * 5))
  }
}
