/* global fromUuid */
import Cd100ActorPickerDialog from '../apps/actor-picker-dialog.js'
import Cd100DicePool from '../apps/dice-pool.js'
import Cd100RollNormalize from '../apps/roll-normalize.js'
import Cd100Utilities from '../apps/utilities.js'
import deprecated from '../deprecated.js'

/**
 * Intercept user sent chat message
 * @param {ChatLog} chatLog
 * @param {string} message
 * @param {object} options
 * @param {ChatSpeakerData} options.speaker
 * @param {string} options.user
 * @returns {void|false}
 */
export default function (chatLog, message, { speaker, user }) {
  const match = message.match(/^\s*\/r(?:oll)?\s+1d%(.*)$/i)
  if (match) {
    deprecated.noReplacement({
      was: '/roll 1d%',
      until: 16
    })
    // Delay calling function to prevent chatMessage key down triggering default
    setTimeout(async function () {
      let options = match[1].replace(/\s*/g, '')
      const config = {
        askValue: true,
        cardType: Cd100RollNormalize.CARD_TYPE.NORMAL,
        cardTypeFixed: true,
        difficulty: Cd100DicePool.difficultyLevel.regular,
        event: new Event('click'),
        fastForward: false,
        poolModifier: 0,
        threshold: undefined
      }
      if (options.length) {
        // (xx) for a threshold value.
        const threshold = options.match(/\((\d+)\)/)
        if (threshold) {
          config.askValue = false
          config.fastForward = true
          config.threshold = Number(threshold[1])
          options = options.replace(threshold[0], '')
        }
        // [?], [+], [++], [+++] for a difficulty unknown, hard, extreme, critical
        const difficulty = options.match(/\[(\?|\+{1,3})\]/)
        if (difficulty) {
          config.difficulty = Cd100Utilities.convertDifficulty(difficulty[1])
          options = options.replace(difficulty[0], '')
        }
        // +2, +1, -1, -2 for bonus / penalty dice
        const poolModifier = options.match(/([+-][12])/)
        if (poolModifier) {
          config.poolModifier = Number(poolModifier[1])
          options = options.replace(poolModifier[0], '')
        }
        // ? show popup
        if (options.includes('?')) {
          options = options.replace('?', '')
        }
        if (options.length) {
          // Left over data
        }
      }
      const actor = await Cd100ActorPickerDialog.create()
      if (actor) {
        config.actor = await fromUuid(actor)
      }
      Cd100RollNormalize.trigger(config)
    }, 200)
    return false
  }
}
