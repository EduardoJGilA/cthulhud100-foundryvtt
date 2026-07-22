/* global ChatMessage game */
import { FOLDER_ID } from '../constants.js'
import Cd100ChatCombinedMessage from './chat-combined-message.js'
import Cd100ChatOpposedMessage from './chat-opposed-message.js'
import Cd100Check from './check.js'
import Cd100ChatCombatMelee from './chat-combat-melee.js'
import Cd100ChatCombatRanged from './chat-combat-ranged.js'

export default class Cd100MessageResults {
  /**
   * Get Cd100DicePool from a message for third party to easily see results
   * @param {Document|string} message
   * @returns {Array}
   * Array of
   *  - {string} actorUuid Which actor is this for
   *  - {string} type
   *  - {string} key
   *  - {string} threshold
   *  - {boolean} isRolled
   *  - {boolean} isCritical
   *  - {boolean} isSpecialSuccess
   *  - {boolean} isRegularSuccess
   *  - {boolean} isRegularFailure
   *  - {boolean} isFumble
   *  - {boolean} isSuccess If this roll considered a success (roll, malfunction, automatic success)
   *  - {boolean} isPushed
   */
  static async loadMessage (message) {
    if (typeof message === 'string') {
      message = game.messages.get(message)
    }
    if (message instanceof ChatMessage) {
      let check
      switch (message.flags?.[FOLDER_ID]?.load?.as) {
        case 'Cd100ChatCombatMelee':
          check = await Cd100ChatCombatMelee.loadFromMessage(message)
          break
        case 'Cd100ChatCombatRanged':
          check = await Cd100ChatCombatRanged.loadFromMessage(message)
          break
        case 'Cd100ChatCombinedMessage':
          check = await Cd100ChatCombinedMessage.loadFromMessage(message)
          break
        case 'Cd100ChatOpposedMessage':
          check = await Cd100ChatOpposedMessage.loadFromMessage(message)
          break
        case 'Cd100Check':
          check = await Cd100Check.loadFromMessage(message)
          break
      }
      if (typeof check !== 'undefined') {
        return await check.publicResults()
      }
      throw new Error('Not a dice pool message')
    }
    throw new Error('Not a chat message')
  }
}
