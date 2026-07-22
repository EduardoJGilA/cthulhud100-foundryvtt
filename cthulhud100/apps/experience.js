/**
 * Improving skills between adventures (rulebook chapter 1, "Experiencia").
 *
 * Two routes. The improvement roll is handled on the actor, where the marked
 * skills live; this covers study and practice, which is downtime the Keeper
 * adjudicates rather than something the sheet tracks.
 */
export default class CoC7Experience {
  /**
   * Weeks of intensive study or practice needed to improve a skill.
   *
   * Two weeks for every 10% "o fraccion" the character already has when they
   * start, so 25% costs three blocks, not two. A mentor with at least ten
   * points more in the same skill cuts the time by a quarter.
   * @param {object} options
   * @param {number} options.skill the skill's current percentage
   * @param {number} options.mentorSkill the mentor's percentage, if any
   * @returns {object} weeks required and whether the mentor counted
   */
  static studyWeeks ({ skill, mentorSkill = null } = {}) {
    const current = Math.max(0, parseInt(skill, 10) || 0)
    const blocks = Math.ceil(current / 10)
    let weeks = blocks * 2
    const mentor = (mentorSkill === null || mentorSkill === '' ? null : parseInt(mentorSkill, 10) || 0)
    // "este debe tener al menos un 10% mas en la habilidad que el estudiante"
    const mentorQualifies = mentor !== null && mentor >= current + 10
    if (mentorQualifies) {
      weeks = weeks * 0.75
    }
    return { weeks, blocks, mentorQualifies }
  }

  /**
   * What the study period yields, once the time has been served.
   *
   * The gain is 1D3, but only if a POW check is passed first: it stands for
   * having kept up the concentration. Failing it loses the time outright.
   * @param {object} options
   * @param {boolean} options.powCheckPassed result of the POW check
   * @returns {object} the gain formula, or null when the time was wasted
   */
  static studyOutcome ({ powCheckPassed } = {}) {
    if (!powCheckPassed) {
      return { gain: null, timeWasted: true }
    }
    return { gain: '1D3', timeWasted: false }
  }
}
