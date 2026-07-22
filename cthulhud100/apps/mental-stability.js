/* global game */
import { CHARACTERISTIC_MULTIPLIER } from '../constants.js'

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
   * Threshold of the check that clears tension once the stressor is gone.
   *
   * INT x5, shifted by the state, plus a cumulative 10% for every hour that
   * passes without a fresh impact.
   * @param {object} options
   * @param {number} options.int INT
   * @param {string} options.state one of CoC7MentalStability.state
   * @param {number} options.quietHours hours since the last impact
   * @returns {number} percentage to roll against
   */
  static recoveryThreshold ({ int, state, quietHours = 0 } = {}) {
    const base = (parseInt(int, 10) || 0) * CHARACTERISTIC_MULTIPLIER
    const hours = Math.max(0, parseInt(quietHours, 10) || 0)
    return Math.max(0, Math.min(100, base + CoC7MentalStability.recoveryModifier(state) + hours * 10))
  }

  /**
   * Outcome of the recovery check.
   *
   * Success wipes all three bars: the mind has made sense of what happened.
   * Failure adds 1d6 more tension, because it has not.
   * @param {object} options
   * @param {boolean} options.success whether the check passed
   * @param {number} options.tension current tension
   * @param {number} options.pow POD
   * @param {number} options.extraRoll result of 1d6, used on failure
   * @returns {number} tension afterwards
   */
  static applyRecovery ({ success, tension = 0, pow = 0, extraRoll = 0 } = {}) {
    if (success) {
      return 0
    }
    const bars = CoC7MentalStability.bars(pow)
    return Math.min(bars.total, Math.max(0, parseInt(tension, 10) || 0) + (parseInt(extraRoll, 10) || 0))
  }

  /**
   * Treating a disorder: a monthly Psicologia or Psicoanalisis check at -10%
   * per point of severity. Success removes one degree and one point of
   * underlying madness, a critical removes two of each.
   * @param {object} options
   * @param {number} options.skill practitioner's skill percentage
   * @param {number} options.severity severity of the disorder
   * @returns {number} percentage to roll against
   */
  static treatmentThreshold ({ skill, severity = 0 } = {}) {
    const s = parseInt(skill, 10) || 0
    return Math.max(0, s - (Math.max(0, parseInt(severity, 10) || 0) * 10))
  }

  /**
   * Effect of a treatment check on a disorder.
   * @param {object} options
   * @param {boolean} options.success whether the check passed
   * @param {boolean} options.critical whether it was a critical
   * @param {number} options.severity current severity
   * @param {number} options.underlyingMadness current Locura Subyacente
   * @returns {object} severity and underlyingMadness afterwards
   */
  static applyTreatment ({ success, critical = false, severity = 0, underlyingMadness = 0 } = {}) {
    const sev = Math.max(0, parseInt(severity, 10) || 0)
    const mad = Math.max(0, parseInt(underlyingMadness, 10) || 0)
    if (!success) {
      return { severity: sev, underlyingMadness: mad }
    }
    const steps = (critical ? 2 : 1)
    return {
      severity: Math.max(0, sev - steps),
      underlyingMadness: Math.max(0, mad - steps)
    }
  }

  /**
   * Underlying madness gained from reading a Mythos tome.
   *
   * Tomes cause underlying madness directly. When only another system's sanity
   * loss is known, roll it, double the result, and every whole multiple of the
   * reader's POD is one point.
   * @param {object} options
   * @param {number} options.loss sanity loss rolled for the tome
   * @param {number} options.pow reader's POD
   * @returns {number} points of underlying madness
   */
  static tomeMadness ({ loss, pow } = {}) {
    const p = Math.max(1, parseInt(pow, 10) || 0)
    const doubled = (parseInt(loss, 10) || 0) * 2
    return Math.floor(doubled / p)
  }

  /**
   * Skimming a tome instead of reading it through (rulebook chapter 10).
   *
   * The player has to say what they are looking for before rolling. The check
   * itself is unchanged, but the time drops to a tenth and the sanity loss to a
   * quarter, rounded up. Failing means understanding nothing at all: no Mythos
   * gain and no sanity loss either.
   * @param {object} options
   * @param {number} options.studyTime full reading time, in the tome's own units
   * @param {string} options.sanityLoss full reading sanity loss formula
   * @param {boolean} options.success whether the check passed
   * @returns {object} time, sanity loss formula and whether Mythos is gained
   */
  static skimTome ({ studyTime = 0, sanityLoss = '0', success = true } = {}) {
    if (!success) {
      // Understood nothing: no gain, and no loss either
      return { studyTime: 0, sanityLoss: null, gainsMythos: false }
    }
    const time = Math.max(0, parseFloat(studyTime) || 0) / 10
    const loss = (sanityLoss ?? '').toString().trim()
    return {
      studyTime: time,
      // A quarter, rounded up, hence ceil rather than plain division
      sanityLoss: (loss === '' || loss === '0' ? null : 'ceil((' + loss + ')/4)'),
      gainsMythos: true
    }
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
