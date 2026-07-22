import { CHARACTERISTIC_MULTIPLIER } from '../constants.js'

/**
 * Cthulhu d100 magic (rulebook chapter 6).
 *
 * The manual is explicit that magic is meant as scenery rather than a tool for
 * the players, so the rules are deliberately thin: a pool equal to POD, a check
 * to memorise a spell, and a casting turn during which the caster is helpless.
 */
export default class CoC7Magic {
  /**
   * Starting magic point pool, which is POD outright.
   *
   * Points received above this cap, from a grateful deity or drained from
   * elsewhere, are spent normally but never regenerate: the ceiling stays here.
   * @param {number} pow POD
   * @returns {number}
   */
  static maximumMagicPoints (pow) {
    return Math.max(0, parseInt(pow, 10) || 0)
  }

  /**
   * How many of a current pool will come back on their own.
   * @param {object} options
   * @param {number} options.current magic points held now
   * @param {number} options.pow POD
   * @returns {number} points that regenerate
   */
  static regeneratingMagicPoints ({ current, pow } = {}) {
    const cap = CoC7Magic.maximumMagicPoints(pow)
    return Math.min(Math.max(0, parseInt(current, 10) || 0), cap)
  }

  /**
   * Chance of memorising a spell from a text.
   *
   * INT x5 when the language is one the character reads, INT x3 when it is not.
   * There is no limit on how many spells may be memorised.
   * @param {object} options
   * @param {number} options.int INT
   * @param {boolean} options.knowsLanguage whether the reader knows the language
   * @returns {number} percentage to roll against
   */
  static memoriseChance ({ int, knowsLanguage = true } = {}) {
    const value = Math.max(0, parseInt(int, 10) || 0)
    return Math.max(0, Math.min(100, value * (knowsLanguage ? CHARACTERISTIC_MULTIPLIER : 3)))
  }

  /**
   * Days needed to make sense of notes someone else wrote for their own use.
   *
   * Such texts are written by a person who already knows the spell and never
   * meant to share it, so the handwriting and the shorthand fight the reader:
   * 21 minus INT days, and a bright reader gets through them faster.
   * @param {number} int INT
   * @returns {number} days of study, never below zero
   */
  static foreignNotesStudyDays (int) {
    return Math.max(0, 21 - (parseInt(int, 10) || 0))
  }

  /**
   * Whether a caster can pay for a spell.
   * @param {object} options
   * @param {number} options.magicPoints points available
   * @param {number} options.pow POD available
   * @param {number} options.magicPointCost points the spell costs
   * @param {number} options.powCost POD the spell costs
   * @returns {object} whether it can be cast and what is missing
   */
  static canCast ({ magicPoints = 0, pow = 0, magicPointCost = 0, powCost = 0 } = {}) {
    const mp = Math.max(0, parseInt(magicPoints, 10) || 0)
    const p = Math.max(0, parseInt(pow, 10) || 0)
    const mpCost = Math.max(0, parseInt(magicPointCost, 10) || 0)
    const pCost = Math.max(0, parseInt(powCost, 10) || 0)
    return {
      canCast: mp >= mpCost && p >= pCost,
      missingMagicPoints: Math.max(0, mpCost - mp),
      missingPow: Math.max(0, pCost - p)
    }
  }

  /**
   * The turn a spell takes effect.
   *
   * Unless a spell says otherwise it lands the turn after it is cast, so a
   * caster commits to it before knowing what the turn will bring.
   * @param {number} castTurn the turn the casting began
   * @returns {number} the turn the effect happens
   */
  static effectTurn (castTurn) {
    return (parseInt(castTurn, 10) || 0) + 1
  }

  /**
   * While formulating a spell the caster is completely taken up by it and can
   * do nothing else, in combat or otherwise. A sudden noise or a shove is
   * enough to ruin it.
   * @returns {object} what the caster may do while casting
   */
  static get castingRestrictions () {
    return {
      canAttack: false,
      canDodge: false,
      canBlock: false,
      canMove: false,
      interruptedByDistraction: true
    }
  }

  /**
   * Lowering POD lowers the ceiling a caster can recover to, so draining POD is
   * a lasting injury to a spellcaster rather than a temporary one.
   * @param {object} options
   * @param {number} options.pow POD after the loss
   * @param {number} options.currentMagicPoints points held now
   * @returns {object} the new cap and the points now beyond it
   */
  static afterPowLoss ({ pow, currentMagicPoints = 0 } = {}) {
    const cap = CoC7Magic.maximumMagicPoints(pow)
    const current = Math.max(0, parseInt(currentMagicPoints, 10) || 0)
    return {
      maximum: cap,
      unrecoverable: Math.max(0, current - cap)
    }
  }
}
