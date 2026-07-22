/* global fromUuid game NotesLayer ui */
import { FOLDER_ID } from '../constants.js'
import Cd100ChatCombinedMessage from './chat-combined-message.js'
import Cd100ChatOpposedMessage from './chat-opposed-message.js'
import Cd100Check from './check.js'
import Cd100ConCheck from '../apps/con-check.js'
import Cd100InvestigatorWizard from './investigator-wizard.js'
import Cd100Utilities from './utilities.js'

export default class Cd100SystemSocket {
  /**
   * Call Socket
   * @param {object} data
   * @param {string} data.type
   * @param {string|undefined} data.listener Who would perform this?
   */
  static async callSocket (data) {
    if (typeof data.listener !== 'undefined') {
      if (game.user.id === data.listener) {
        switch (data.type) {
          case 'characterWizard':
            Cd100InvestigatorWizard.createCharacterFromData(data.payload)
            break
          case 'chatCombinedMessageJoin':
            Cd100ChatCombinedMessage.joinGroupMessage(data.options)
            break
          case 'chatCombinedMessageNew':
            Cd100ChatCombinedMessage.newGroupMessage(data.config)
            break
          case 'chatOpposedMessageJoin':
            Cd100ChatOpposedMessage.joinGroupMessage(data.options)
            break
          case 'chatOpposedMessageNew':
            Cd100ChatOpposedMessage.newGroupMessage(data.config)
            break
          case 'gmTradeItemTo':
            if (typeof data.itemFrom === 'string' && typeof data.actorTo === 'string') {
              const actor = await fromUuid(data.actorTo)
              const item = await fromUuid(data.itemFrom)
              if (actor && item) {
                const created = await actor.createEmbeddedDocuments('Item', [item.toJSON()])
                if (created) {
                  await item.parent.deleteEmbeddedDocuments('Item', [item.id])
                }
              }
            }
            break
          case 'messagePermission':
            Cd100SystemSocket.allowUserToUpdateMessage(data)
            break
          case 'open-character':
            game.actors.get(data.payload).sheet.render({ force: true })
            break
          case 'thanksUpdatedMessage':
            if (['messageId'].every(k => typeof data[k] !== 'undefined')) {
              const index = game.Cd100.messagePermissionQueue.findIndex(o => o.messageId === data.messageId)
              if (index > -1) {
                game.Cd100.messagePermissionQueue.splice(data.index, 1)
                Cd100SystemSocket.messagePermissionQueue(data.messageId)
              }
            }
            break
          case 'updateMessage':
            if (['messageId', 'updates'].every(k => typeof data[k] !== 'undefined')) {
              const message = game.messages.get(data.messageId)
              if (message) {
                await message.update(data.updates)
                switch (message.flags[FOLDER_ID]?.load?.as) {
                  case 'Cd100Check':
                    (await Cd100Check.loadFromMessage(message)).runCallback()
                    break
                  case 'Cd100ConCheck':
                    (await Cd100ConCheck.loadFromMessage(message)).runCallback()
                    break
                }
                Cd100SystemSocket.triggerSocket({
                  type: 'thanksUpdatedMessage',
                  messageId: data.messageId,
                  listener: data.from
                })
              }
            }
            break
          case 'callbackCheck':
            (await Cd100Check.loadFromMessage(game.messages.get(data.messageId))).runCallback()
            break
          case 'callbackConCheck':
            (await Cd100ConCheck.loadFromMessage(game.messages.get(data.messageId))).runCallback()
            break
        }
      }
    } else {
      switch (data.type) {
        case 'lockOpenCharacterSheets':
          Cd100Utilities.lockOpenCharacterSheets()
          break
        case 'refreshOpenDocumentSheet':
          Cd100Utilities.refreshOpenDocumentSheet(data.uuid)
          break
        case 'refreshOpenOwnerCharacterSheets':
          Cd100Utilities.refreshOpenOwnerCharacterSheets()
          break
        case 'toggleMapNotes':
          game.settings.set('core', NotesLayer.TOGGLE_SETTING, data.toggle === true)
          break
      }
    }
  }

  /**
   * Process a message queue if multiple users are trying to update the same message
   * @param {string} messageId
   */
  static async messagePermissionQueue (messageId) {
    const index = game.Cd100.messagePermissionQueue.findIndex(o => o.messageId === messageId)
    if (index > -1) {
      const data = game.Cd100.messagePermissionQueue[index]
      const message = game.messages.get(data.messageId)
      if (message) {
        await message.update({
          author: data.who
        })
        game.socket.emit('system.' + FOLDER_ID, {
          type: 'updateMessage',
          listener: data.who,
          messageId: data.messageId,
          updates: data.updates,
          from: game.user.id
        })
      }
    }
  }

  /**
   * Ask keeper to perform a function
   * @param {object} data
   * @returns {boolean}
   */
  static requestKeeperAction (data) {
    if (game.user.isGM) {
      data.listener = game.user.id
      Cd100SystemSocket.callSocket(data)
      return true
    } else {
      const keeper = game.users.find(u => u.active && u.isGM)
      if (keeper) {
        data.listener = keeper.id
        game.socket.emit('system.' + FOLDER_ID, data)
        return true
      } else {
        ui.notifications.error('Cd100.ErrorMissingKeeperUser', { localize: true })
        return false
      }
    }
  }

  /**
   * Trigger the payload and also run as current user
   * @param {object} data
   * @param {string} data.type
   * @param {string|undefined} data.listener Should not be used if for a specific user
   */
  static triggerSocket (data) {
    game.socket.emit('system.' + FOLDER_ID, data)
    Cd100SystemSocket.callSocket(data)
  }

  /**
   * Allow selected User to edit Message if they Own the Actor, then pass back updates.
   * The main reason for this is to get DSN to roll the Users dice while still using the message.rolls
   * @param {object} data
   */
  static async allowUserToUpdateMessage (data) {
    if (['messageId', 'who', 'updates'].every(k => typeof data[k] !== 'undefined')) {
      const message = game.messages.get(data.messageId)
      const user = game.users.get(data.who)
      if (message && user && (await Cd100Utilities.canModifyActor({ message, user })).length) {
        const index = game.Cd100.messagePermissionQueue.findIndex(o => o.messageId === data.messageId)
        game.Cd100.messagePermissionQueue.push(data)
        if (index === -1) {
          Cd100SystemSocket.messagePermissionQueue(data.messageId)
        }
      }
    }
  }
}
