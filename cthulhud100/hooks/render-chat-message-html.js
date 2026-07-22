/* global $ fromUuid game TokenDocument */
import { FOLDER_ID } from '../constants.js'
import Cd100ChatChaseObstacle from '../apps/chat-chase-obstacle.js'
import Cd100ChatCombatMelee from '../apps/chat-combat-melee.js'
import Cd100ChatCombatRanged from '../apps/chat-combat-ranged.js'
import Cd100ChatDamage from '../apps/chat-damage.js'
import Cd100ChatMessage from '../apps/chat-message.js'
import Cd100ChatCombinedMessage from '../apps/chat-combined-message.js'
import Cd100ChatOpposedMessage from '../apps/chat-opposed-message.js'
import Cd100Check from '../apps/check.js'
import Cd100ConCheck from '../apps/con-check.js'
import Cd100SanCheckCard from '../apps/san-check-card.js'
import Cd100Utilities from '../apps/utilities.js'

/**
 * Render Hook
 * @param {documents.ChatMessage} message
 * @param {HTMLElement} html
 * @param {ApplicationRenderContext} context
 */
export default async function (message, html, context) {
  const trustedViewer = (game.user.isTrusted && game.settings.get(FOLDER_ID, 'trustedCanSeeChatCard'))
  if (game.user.isGM || trustedViewer) {
    if (!game.user.isGM) {
      html.querySelectorAll('.keeper-only-block button').forEach((element) => { element.disabled = true })
      html.querySelectorAll('.keeper-only-block a').forEach((element) => { element.classList.add('not-allowed') })
    }
    html.querySelectorAll('.not-keeper-block').forEach((element) => element.remove())
  } else {
    html.querySelectorAll('.keeper-only-block').forEach((element) => element.remove())
  }
  const trustedModifier = (game.user.isTrusted && game.settings.get(FOLDER_ID, 'trustedCanModfyChatCard'))
  if (!game.user.isGM && !trustedModifier) {
    html.querySelectorAll('.keeper-only-control').forEach((element) => { element.disabled = true })
  }
  /* // FoundryV13 workaround new rolls being automatically expanded */
  if (game.release.generation === 13) {
    setTimeout(() => {
      html.querySelectorAll('.never-expand.expanded[data-action=expandRoll]').forEach((element) => { element.classList.remove('expanded') })
    }, 500)
  }
  if (typeof message.flags[FOLDER_ID]?.load?.as !== 'undefined') {
    const allowed = await Cd100Utilities.canModifyActor({ message })
    html.querySelectorAll('.owner-and-keeper-block').forEach((element) => {
      if (!game.user.isGM && !trustedViewer && !allowed.includes(element.dataset.actorUuid)) {
        element.remove()
      }
    })
    html.querySelectorAll('.other-players-only-block').forEach((element) => {
      if (game.user.isGM || trustedViewer || allowed.includes(element.dataset.actorUuid)) {
        element.remove()
      }
    })
    html.querySelectorAll('.owner-only-block').forEach((element) => {
      if (game.user.isGM || !allowed.includes(element.dataset.actorUuid)) {
        element.remove()
      }
    })
    html.querySelectorAll('.open-actor').forEach((element) => {
      if (game.user.isGM || allowed.includes(element.dataset.actorUuid)) {
        element.addEventListener('dblclick', async event => {
          const actor = await fromUuid(element.dataset.actorUuid)
          if (actor) {
            if (actor instanceof TokenDocument) {
              actor.actor.sheet.render({ force: true })
            } else {
              actor.sheet.render({ force: true })
            }
          }
        })
        element.classList.add('clickable')
      }
    })
    switch (message.flags[FOLDER_ID].load.as) {
      case 'Cd100ChatCombatMelee':
        Cd100ChatCombatMelee._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatCombatRanged':
        Cd100ChatCombatRanged._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatChaseObstacle':
        Cd100ChatChaseObstacle._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatDamage':
        Cd100ChatDamage._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100Check':
        Cd100Check._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatCombinedMessage':
        Cd100ChatCombinedMessage._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatMessage':
        Cd100ChatMessage._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ChatOpposedMessage':
        Cd100ChatOpposedMessage._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100ConCheck':
        Cd100ConCheck._onRenderMessage(message, html, context, allowed)
        break
      case 'Cd100SanCheckCard':
        Cd100SanCheckCard._onRenderMessage(message, html, context, allowed)
        break
    }
  }
  html.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', async event => {
      switch (event.currentTarget.dataset.action) {
        case 'toggleBlock':
          {
            const blocks = html.querySelectorAll('.coc7-chat-toggled')
            if (typeof blocks[event.currentTarget.dataset.offset] !== 'undefined') {
              /* // jQuery */
              $(blocks[event.currentTarget.dataset.offset]).slideToggle(200)
            }
          }
          break
      }
    })
  })
}
