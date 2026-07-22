/* global game */

/**
 * Cthulhu d100 alternative madness system, "Estabilidad Mental" (rulebook
 * chapter 3).
 *
 * Tension is tracked on three bars whose sizes come from POD. Filling them
 * shifts the character through four states, each of which helps physical
 * action and hinders everything else, because adrenaline sharpens the body and
 * blunts concentration.
 *
 * This has no Call of Cthulhu 7e equivalent; the classic system in the same
 * chapter is the one that resembles CoC7 sanity.
 */
export default class CoC7MentalStability {
  /**
   * The four states, in order of severity
   * @returns {object}
   */
  static get state () {
    return {
      calm: 'calm',
      uneasy: 'uneasy',
      tense: 'tense',
      transitoryInsanity: 'transitoryInsanity'
    }
  }

  /**
   * Bar sizes for a given POD.
   *
   * The first and third bars round up, the second rounds down, so the three
   * always total POD x1.5 exactly. POD 13 gives 7 / 6 / 7.
   * @param {number} pow POD
   * @returns {object} first, second, third and total
   */
  static bars (pow) {
    const p = Math.max(0, parseInt(pow, 10) || 0)
    const first = Math.ceil(p / 2)
    const second = Math.floor(p / 2)
    const third = Math.ceil(p / 2)
    return { first, second, third, total: first + second + third }
  }

  /**
   * Work out the state from accumulated tension.
   *
   * Calm while marks stay inside the first bar; uneasy once the first is full
   * and the second has at least one mark; tense once the second is full and the
   * third has at least one; transitory insanity when all three are full.
   * @param {number} pow POD
   * @param {number} tension accumulated tension points
   * @returns {string} one of CoC7MentalStability.state
   */
  static stateFromTension (pow, tension) {
    const bars = CoC7MentalStability.bars(pow)
    const t = Math.max(0, parseInt(tension, 10) || 0)
    if (bars.total === 0 || t >= bars.total) {
      return CoC7MentalStability.state.transitoryInsanity
    }
    if (t > bars.first + bars.second) {
      return CoC7MentalStability.state.tense
    }
    if (t > bars.first) {
      return CoC7MentalStability.state.uneasy
    }
    return CoC7MentalStability.state.calm
  }

  /**
   * Skill modifiers for a state.
   *
   * Action skills gain what everything else loses. Under transitory insanity
   * the character cannot act voluntarily at all, which no modifier expresses,
   * hence canAct.
   * @param {string} state one of CoC7MentalStability.state
   * @returns {object} action, other and canAct
   */
  static modifiers (state) {
    switch (state) {
      case CoC7MentalStability.state.uneasy:
        return { action: 10, other: -10, canAct: true }
      case CoC7MentalStability.state.tense:
        return { action: 20, other: -20, canAct: true }
      case CoC7MentalStability.state.transitoryInsanity:
        return { action: 0, other: 0, canAct: false }
      default:
        return { action: 0, other: 0, canAct: true }
    }
  }

  /**
   * Modifier applied to the INT x5 check that clears accumulated tension once
   * the stressor is gone.
   * @param {string} state one of CoC7MentalStability.state
   * @returns {number} percentage modifier
   */
  static recoveryModifier (state) {
    switch (state) {
      case CoC7MentalStability.state.calm:
        return 10
      case CoC7MentalStability.state.tense:
        return -10
      case CoC7MentalStability.state.transitoryInsanity:
        return -20
      default:
        return 0
    }
  }

  /**
   * Apply a tension hit, following the rules for large impacts.
   *
   * A hit bigger than all three bars together cannot be processed at the time:
   * count how many whole times it covers POD, mark that many points of
   * underlying madness, and carry the remainder onto the first bar.
   *
   * Crossing the end of the second bar, where tension equals POD, also earns a
   * point of underlying madness.
   *
   * Existing underlying madness dulls every incoming hit by its own value:
   * the mind has already rebuilt itself around the horror.
   * @param {object} options
   * @param {number} options.pow POD
   * @param {number} options.tension current tension
   * @param {number} options.underlyingMadness current Locura Subyacente
   * @param {number} options.hit points rolled for this impact
   * @returns {object} tension and underlyingMadness after the hit
   */
  static applyHit ({ pow, tension = 0, underlyingMadness = 0, hit = 0 } = {}) {
    const bars = CoC7MentalStability.bars(pow)
    const p = Math.max(0, parseInt(pow, 10) || 0)
    let madness = Math.max(0, parseInt(underlyingMadness, 10) || 0)
    const before = Math.max(0, parseInt(tension, 10) || 0)
    // "Acostumbrarse a la tension": each point of underlying madness absorbs one
    let incoming = Math.max(0, (parseInt(hit, 10) || 0) - madness)

    if (incoming > bars.total && p > 0) {
      // Too large to process; convert whole multiples of POD into madness
      const multiples = Math.floor(incoming / p)
      madness += multiples
      incoming -= multiples * p
      return { tension: Math.min(bars.total, incoming), underlyingMadness: madness }
    }

    const after = Math.min(bars.total, before + incoming)
    // Reaching POD, the end of the second bar, earns a point of madness
    if (p > 0 && before < p && after >= p) {
      madness += 1
    }
    return { tension: after, underlyingMadness: madness }
  }

  /**
   * Severity of the long-term disorder rolled at the end of a session.
   *
   * Roll 1d6 against underlying madness: a result lower than it starts a
   * disorder whose severity is the difference. There is no upper bound.
   * @param {number} underlyingMadness Locura Subyacente
   * @param {number} roll result of 1d6
   * @returns {number} severity, or 0 when no disorder develops
   */
  static disorderSeverity (underlyingMadness, roll) {
    const m = Math.max(0, parseInt(underlyingMadness, 10) || 0)
    const r = parseInt(roll, 10) || 0
    return (r < m ? m - r : 0)
  }

  /**
   * Localised label for a state
   * @param {string} state one of CoC7MentalStability.state
   * @returns {string}
   */
  static label (state) {
    return game.i18n.localize('CoC7.MentalStability.' + state)
  }
}
