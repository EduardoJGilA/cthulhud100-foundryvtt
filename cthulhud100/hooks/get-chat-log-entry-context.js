/* global game */
import { FOLDER_ID } from '../constants.js'
import Cd100ChatChaseObstacle from '../apps/chat-chase-obstacle.js'
import Cd100ChatCombatMelee from '../apps/chat-combat-melee.js'
import Cd100ChatCombatRanged from '../apps/chat-combat-ranged.js'
import Cd100ChatCombinedMessage from '../apps/chat-combined-message.js'
import Cd100ChatDamage from '../apps/chat-damage.js'
import Cd100ChatOpposedMessage from '../apps/chat-opposed-message.js'
import Cd100Check from '../apps/check.js'
import Cd100ConCheck from '../apps/con-check.js'
import Cd100SanCheckCard from '../apps/san-check-card.js'

/**
 * Get chat message context options hook
 * @deprecated FoundryVTT v12
 * @param {Application} application
 * @param {Array} entryOptions
 */
export default function (application, entryOptions) {
  entryOptions.push({
    name: 'Refresh',
    icon: '<i class="fa-solid fa-arrow-rotate-left"></i>',
    condition: li => {
      const message = game.messages.get(li[0].dataset.messageId)
      return (game.user.isGM && message.flags[FOLDER_ID]?.load?.cardOpen && ['Cd100ChatChaseObstacle', 'Cd100ChatCombatMelee', 'Cd100ChatCombatRanged', 'Cd100ChatCombinedMessage', 'Cd100ChatDamage', 'Cd100ChatOpposedMessage', 'Cd100Check', 'Cd100ConCheck', 'Cd100SanCheckCard'].includes(message.flags[FOLDER_ID]?.load?.as))
    },
    callback: async li => {
      const message = game.messages.get(li[0].dataset.messageId)
      let check
      switch (message.flags[FOLDER_ID].load.as) {
        case 'Cd100ChatChaseObstacle':
          check = await Cd100ChatChaseObstacle.loadFromMessage(message)
          break
        case 'Cd100ChatCombatMelee':
          check = await Cd100ChatCombatMelee.loadFromMessage(message)
          break
        case 'Cd100ChatCombatRanged':
          check = await Cd100ChatCombatRanged.loadFromMessage(message)
          break
        case 'Cd100ChatCombinedMessage':
          check = await Cd100ChatCombinedMessage.loadFromMessage(message)
          break
        case 'Cd100ChatDamage':
          check = await Cd100ChatDamage.loadFromMessage(message)
          break
        case 'Cd100ChatOpposedMessage':
          check = await Cd100ChatOpposedMessage.loadFromMessage(message)
          break
        case 'Cd100Check':
          check = await Cd100Check.loadFromMessage(message)
          break
        case 'Cd100ConCheck':
          check = await Cd100ConCheck.loadFromMessage(message)
          break
        case 'Cd100SanCheckCard':
          check = await Cd100SanCheckCard.loadFromMessage(message)
          break
      }
      check.updateMessage()
      return true
    }
  })
}
