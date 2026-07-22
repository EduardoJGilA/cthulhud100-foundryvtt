/* global CONFIG fromUuid game TokenDocument ui */
import { FOLDER_ID, CHAT_MESSAGE_MODE } from '../constants.js'
import Cd100ChatCombinedMessage from './chat-combined-message.js'
import Cd100ChatOpposedMessage from './chat-opposed-message.js'
import Cd100Check from './check.js'
import Cd100ContentLinkDialog from './content-link-dialog.js'
import Cd100DicePool from './dice-pool.js'
import Cd100Link from './link.js'
import Cd100RollDialog from './roll-dialog.js'
import Cd100SanCheckCard from './san-check-card.js'
import Cd100SanDataDialog from './san-data-dialog.js'
import Cd100Utilities from './utilities.js'
import deprecated from '../deprecated.js'

export default class Cd100RollNormalize {
  /**
   * Roll types
   * @returns {object}
   */
  static get ROLL_TYPE () {
    return {
      ATTRIBUTE: 'R/AT',
      CHARACTERISTIC: 'R/CH',
      COMBAT: 'R/CO',
      MANUAL: 'R/MA',
      SKILL: 'R/SK',
      ENCOUNTER: 'R/EC',
      WEAPON: 'R/WP'
    }
  }

  /**
   * Chat card types
   * @returns {object}
   */
  static get CARD_TYPE () {
    return {
      COMBINED: 'C/CO',
      NORMAL: 'C/NO',
      OPPOSED: 'C/OP',
      SAN_CHECK: 'C/SC',
      IDEA_CHECK: 'C/IC',
      KNOW_CHECK: 'C/KC'
    }
  }

  /**
   * Get valid card types for roll type
   * @param {object} config
   * @param {string|undefined} config.attribute
   * @param {string} config.rollType
   * @returns {object}
   */
  static cardTypes (config) {
    if (config.cardTypeFixed) {
      return null
    }
    if (config.rollType === Cd100RollNormalize.ROLL_TYPE.COMBAT) {
      return null
    }
    const select = {
      [Cd100RollNormalize.CARD_TYPE.NORMAL]: 'Cd100.RegularRollCard',
      [Cd100RollNormalize.CARD_TYPE.COMBINED]: 'Cd100.CombinedRollCard',
      [Cd100RollNormalize.CARD_TYPE.OPPOSED]: 'Cd100.OpposedRollCard'
    }
    if (config.rollType === Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE && config.key === 'san') {
      select[Cd100RollNormalize.CARD_TYPE.SAN_CHECK] = 'Cd100.SanityLossEncounter'
    } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC && config.key === 'int') {
      select[Cd100RollNormalize.CARD_TYPE.IDEA_CHECK] = 'Cd100.IdeaCheck'
    } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC && config.key === 'edu') {
      select[Cd100RollNormalize.CARD_TYPE.KNOW_CHECK] = 'Cd100.KnowCheck'
    }
    return select
  }

  /**
   * Normalize a roll request
   * @param {object} options
   * @returns {Promise<object>}
   */
  static async normalizeRequest (options) {
    let okay = false
    if (typeof options.modifier !== 'undefined') {
      deprecated.warningLogger({
        was: 'roll.modifier',
        now: 'roll.poolModifier',
        until: 15
      })
      options.poolModifier = options.modifier
      delete options.modifier
    }
    if (options.actor && options.actor instanceof TokenDocument) {
      options.actor = options.actor.object
    }
    const config = {
      actorUuid: options.actor?.uuid,
      askValue: options.askValue ?? false,
      callbackUuid: options.callbackUuid ?? false,
      callbackContext: options.callbackContext ?? false,
      cardType: options.cardType ?? '',
      cardTypeFixed: options.cardTypeFixed ?? false,
      chatMessage: options.chatMessage ?? true,
      difficulty: options.difficulty ?? Cd100DicePool.difficultyLevel[game.settings.get(FOLDER_ID, 'defaultCheckDifficulty')],
      disableFlatDiceModifier: options.disableFlatDiceModifier ?? false,
      disableFlatThresholdModifier: options.disableFlatThresholdModifier ?? false,
      displayName: options.displayName ?? false,
      flatDiceModifier: options.flatDiceModifier ?? 0,
      flatThresholdModifier: options.flatThresholdModifier ?? 0,
      hasPlayerOwner: options.actor?.hasPlayerOwner ?? false,
      isAltKey: options.event?.altKey === true,
      isBlind: options.isBlind ?? (game.settings.get('core', 'rollMode') ?? game.settings.get('core', 'messageMode') === CHAT_MESSAGE_MODE.BLIND),
      isCombat: options.event?.currentTarget?.classList?.contains('combat') ?? false,
      isCtrlKey: options.isCtrlKey ?? Cd100Utilities.isCtrlKey(options.event ?? false),
      isShiftKey: options.isShiftKey === true || options.fastForward === true || options.event?.shiftKey === true,
      key: options.key ?? '',
      poolModifier: options.poolModifier ?? 0,
      poolModifierDefault: 0,
      poolModifierKnow: options.poolModifierKnow ?? 0,
      poolModifierIdea: options.poolModifierIdea ?? 0,
      preventStandby: options.preventStandby ?? false,
      rollType: options.rollType ?? Cd100RollNormalize.ROLL_TYPE.MANUAL,
      runRoll: options.runRoll ?? true,
      standbyRightIcon: options.standbyRightIcon ?? '',
      threshold: options.threshold,
      hideDifficulty: options.hideDifficulty ?? false
    }
    if (typeof config.actorUuid !== 'undefined') {
      if (typeof options.attribute === 'undefined' && options.event?.currentTarget?.closest('.attribute')?.dataset.attrib) {
        options.attribute = options.event?.currentTarget.closest('.attribute').dataset.attrib
      } else if (typeof options.characteristic === 'undefined' && options.event?.currentTarget?.closest('.attribute')?.dataset.characteristic) {
        options.characteristic = options.event?.currentTarget.closest('.attribute').dataset.characteristic
      } else if (typeof options.itemUuid === 'undefined' && options.event?.currentTarget?.closest('.skill')?.dataset.itemUuid) {
        options.itemUuid = options.event?.currentTarget.closest('.skill').dataset.itemUuid
      } else if (typeof options.itemUuid === 'undefined' && options.event?.currentTarget?.closest('.item')?.dataset.itemUuid) {
        options.itemUuid = options.event?.currentTarget.closest('.item').dataset.itemUuid
      }
      let item = false
      if (typeof options.itemUuid !== 'undefined') {
        item = await fromUuid(options.itemUuid)
      } else if (typeof options.skillId !== 'undefined') {
        item = options.actor.items.get(options.skillId)
      } else if (typeof options.skillName !== 'undefined') {
        item = options.actor.getSkillByName(options.skillName)
      }
      options.sanMin = options.actor?.system?.special?.sanLoss?.checkPassed ?? ''
      options.sanMax = options.actor?.system?.special?.sanLoss?.checkFailled ?? ''
      options.sanReason = options.actor?.system.infos.type?.length ? options.actor.system.infos.type : options.actor.name
      if (options.characteristic === 'know') {
        config.cardType = Cd100RollNormalize.CARD_TYPE.KNOW_CHECK
        options.characteristic = 'edu'
      } else if (options.characteristic === 'idea') {
        config.cardType = Cd100RollNormalize.CARD_TYPE.IDEA_CHECK
        options.characteristic = 'int'
      }
      if (options.characteristic === 'edu' && config.poolModifierKnow === 0) {
        config.poolModifierKnow = options.actor.system.config.know.bonusDice ?? 0
      }
      if (options.characteristic === 'int' && config.poolModifierIdea === 0) {
        config.poolModifierIdea = options.actor.system.config.idea.bonusDice ?? 0
      }
      if (item !== false) {
        if (item.type === 'skill') {
          config.rollType = Cd100RollNormalize.ROLL_TYPE.SKILL
          config.key = item.uuid
          if (config.displayName === false) {
            config.displayName = item.name
          }
          if (config.poolModifier === 0) {
            config.poolModifier = item.system.bonusDice ?? 0
          }
          okay = true
        } else if (item.type === 'weapon') {
          config.rollType = Cd100RollNormalize.ROLL_TYPE.WEAPON
          config.key = item.uuid
          if (config.displayName === false) {
            config.displayName = item.name
          }
          if (config.poolModifier === 0) {
            config.poolModifier = item.system.bonusDice ?? 0
          }
          okay = true
        } else {
          ui.notifications.warn('Cd100.Errors.UnknownItem', { localize: true })
          return false
        }
        if (typeof item.flags[FOLDER_ID]?.cocidFlag?.id === 'string' && item.flags[FOLDER_ID].cocidFlag.id !== '') {
          config.cocid = item.flags[FOLDER_ID].cocidFlag.id
        }
      } else if (typeof options.attribute !== 'undefined' && ['lck', 'san'].includes(options.attribute)) {
        config.rollType = Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE
        config.key = options.attribute
        if (config.displayName === false) {
          config.displayName = CONFIG.Actor.dataModels.character.defineSchema().attribs.getField(config.key).hint ?? false
          if (config.displayName !== false) {
            config.displayName = game.i18n.localize(config.displayName)
          }
        }
        if (config.poolModifier === 0) {
          config.poolModifier = options.actor.system.attribs[config.key].bonusDice ?? 0
        }
        okay = true
      } else if (typeof options.characteristic !== 'undefined' && typeof options.actor.system.characteristics[options.characteristic] !== 'undefined') {
        config.rollType = Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC
        config.key = options.characteristic
        if (config.displayName === false) {
          config.displayName = CONFIG.Actor.dataModels.character.defineSchema().characteristics.getField(config.key)?.hint ?? false
          if (config.displayName !== false) {
            config.displayName = game.i18n.localize(config.displayName)
          }
        }
        if (config.poolModifier === 0) {
          config.poolModifier = options.actor.system.characteristics[config.key].bonusDice ?? 0
        }
        okay = true
      }
    }
    if (!okay && typeof options.event === 'undefined' && ![Cd100RollNormalize.ROLL_TYPE.MANUAL, Cd100RollNormalize.ROLL_TYPE.ENCOUNTER].includes(config.rollType)) {
      /* // FoundryVTT V12 */
      ui.notifications.error(game.i18n.format('Cd100.ErrorNotFound', { missing: game.i18n.localize('Cd100.Roll') }))
      return false
    }
    if (![Cd100RollNormalize.CARD_TYPE.COMBINED, Cd100RollNormalize.CARD_TYPE.NORMAL, Cd100RollNormalize.CARD_TYPE.OPPOSED, Cd100RollNormalize.CARD_TYPE.SAN_CHECK, Cd100RollNormalize.CARD_TYPE.KNOW_CHECK, Cd100RollNormalize.CARD_TYPE.IDEA_CHECK].includes(config.cardType)) {
      /* // FoundryVTT V12 */
      ui.notifications.error(game.i18n.format('Cd100.ErrorInvalidFormula', { value: game.i18n.localize('Cd100.ErrorInvalidCardType') }))
      return false
    }
    if (!config.askValue && typeof config.threshold === 'undefined' && ![Cd100RollNormalize.ROLL_TYPE.SKILL, Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC, Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE, Cd100RollNormalize.ROLL_TYPE.ENCOUNTER].includes(config.rollType)) {
      /* // FoundryVTT V12 */
      ui.notifications.error(game.i18n.format('Cd100.ErrorInvalidFormula', { value: game.i18n.localize('Cd100.ErrorInvalidRollType') }))
      return false
    }
    config.poolModifier = Math.max(-Cd100DicePool.maxDicePenalty, Math.min(Cd100DicePool.maxDiceBonus, config.poolModifier))
    config.poolModifierDefault = config.poolModifier
    if (config.cardType === Cd100RollNormalize.CARD_TYPE.KNOW_CHECK) {
      config.poolModifier = config.poolModifierKnow
    } else if (config.cardType === Cd100RollNormalize.CARD_TYPE.IDEA_CHECK) {
      config.poolModifier = config.poolModifierIdea
    }
    return config
  }

  /**
   * Normalize and process a roll request
   * @param {option} options
   * @returns {void|object}
   */
  static async trigger (options = {}) {
    const config = await Cd100RollNormalize.normalizeRequest(options)
    if (config === false) {
      return
    }
    if (config.isCtrlKey && game.user.isGM && [Cd100RollNormalize.CARD_TYPE.NORMAL, Cd100RollNormalize.CARD_TYPE.SAN_CHECK].includes(config.cardType)) {
      Cd100RollNormalize.createLink(config)
    } else {
      if (!config.isShiftKey) {
        try {
          await Cd100RollNormalize.createRoll(config)
        } catch (e) {
          console.error(e)
          return
        }
      }
      if (config.runRoll) {
        return Cd100RollNormalize.runRoll(config)
      } else {
        return config
      }
    }
  }

  /**
   * Create Link
   * @param {object} config
   */
  static createLink (config) {
    switch (config.rollType) {
      case Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE:
      case Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC:
      case Cd100RollNormalize.ROLL_TYPE.COMBAT:
      case Cd100RollNormalize.ROLL_TYPE.SKILL:
      case Cd100RollNormalize.ROLL_TYPE.ENCOUNTER:
        {
          const linkData = {}
          if (config.rollType === Cd100RollNormalize.ROLL_TYPE.SKILL) {
            linkData.check = Cd100Link.CHECK_TYPE.CHECK
            linkData.subtype = Cd100Link.LINK_TYPE.SKILL
            linkData.name = config.cocid
            linkData.label = config.displayName
            if (!linkData.name) return
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC) {
            linkData.check = Cd100Link.CHECK_TYPE.CHECK
            linkData.subtype = Cd100Link.LINK_TYPE.CHARACTERISTIC
            linkData.name = config.key
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE) {
            if (config.isAltKey && config.key === 'san') {
              linkData.check = Cd100Link.CHECK_TYPE.SANLOSS
            } else {
              linkData.check = Cd100Link.CHECK_TYPE.CHECK
              linkData.subtype = Cd100Link.LINK_TYPE.ATTRIBUTE
              linkData.name = config.key
            }
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.COMBAT) {
            linkData.check = Cd100Link.CHECK_TYPE.ITEM
            linkData.name = config.cocid
            linkData.label = config.displayName
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.ENCOUNTER) {
            linkData.check = Cd100Link.CHECK_TYPE.SANLOSS
            linkData.sanMin = config.sanMin
            linkData.sanMax = config.sanMax
            linkData.sanReason = config.sanReason
          } else {
            return
          }
          Cd100ContentLinkDialog.create(linkData)
        }
        break
    }
  }

  /**
   * Prompt for changes to normalized roll request
   * @param {object} config
   */
  static async createRoll (config) {
    const usage = await Cd100RollDialog.create(config)
    config.cardType = usage.cardType
    config.poolModifier = usage.poolModifier
    config.difficulty = usage.difficulty
    config.flatDiceModifier = usage.flatDiceModifier
    config.flatThresholdModifier = usage.flatThresholdModifier
    config.threshold = usage.threshold
  }

  /**
   * Perform a normalized roll request
   * @param {object} config
   * @returns {void|Cd100Check}
   */
  static async runRoll (config) {
    switch (config.cardType) {
      case Cd100RollNormalize.CARD_TYPE.SAN_CHECK:
        {
          const usage = await Cd100SanDataDialog.create()
          Cd100SanCheckCard.create(config.actorUuid, {
            sanMin: usage.sanMin || 0,
            sanMax: usage.sanMax || 0,
            sanReason: usage.sanReason,
            poolModifier: config.poolModifier,
            difficulty: config.difficulty
          })
        }
        break
      case Cd100RollNormalize.CARD_TYPE.NORMAL:
      case Cd100RollNormalize.CARD_TYPE.IDEA_CHECK:
      case Cd100RollNormalize.CARD_TYPE.KNOW_CHECK:
        {
          const check = new Cd100Check()
          check.poolModifier = config.poolModifier
          check.difficulty = config.difficulty
          check.actor = config.actorUuid
          check.flatDiceModifier = config.flatDiceModifier
          check.flatThresholdModifier = config.flatThresholdModifier
          check.standby = !config.preventStandby && game.settings.get(FOLDER_ID, 'stanbyGMRolls') && game.user.isGM && config.hasPlayerOwner
          if (check.standby && config.standbyRightIcon !== '') {
            check.standbyRightIcon = config.standbyRightIcon
          }
          if (config.callbackUuid && config.callbackContext) {
            check.setCallback(config.callbackUuid, config.callbackContext)
          }
          check.isCombat = config.isCombat
          check.blind = config.isBlind
          if (config.flavor) {
            check.flavor = config.flavor
          }
          check.cardType = config.cardType
          switch (config.rollType) {
            case Cd100RollNormalize.ROLL_TYPE.SKILL:
              await check.rollSkill(config.key)
              break
            case Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE:
              await check.rollAttribute(config.key)
              break
            case Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC:
              await check.rollCharacteristic(config.key)
              break
            case Cd100RollNormalize.ROLL_TYPE.MANUAL:
              await check.rollManual(config.threshold)
              break
          }
          if (config.chatMessage) {
            check.toMessage()
          }
          return check
        }
        break // eslint-disable-line no-unreachable
      case Cd100RollNormalize.CARD_TYPE.COMBINED:
      case Cd100RollNormalize.CARD_TYPE.OPPOSED:
        {
          const parts = [
            config.actorUuid
          ]
          if (config.rollType === Cd100RollNormalize.ROLL_TYPE.ATTRIBUTE) {
            parts.push('attribute')
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.CHARACTERISTIC) {
            parts.push('characteristic')
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.SKILL) {
            parts.push('skill')
          } else if (config.rollType === Cd100RollNormalize.ROLL_TYPE.WEAPON) {
            parts.push('item')
          }
          parts.push(config.key)
          if (config.poolModifier < 0) {
            parts.push(config.poolModifier)
          } else if (config.poolModifier > 0) {
            parts.push('+' + config.poolModifier)
          }
          parts.push(config.difficulty)
          if (config.cardType === Cd100RollNormalize.CARD_TYPE.COMBINED) {
            Cd100ChatCombinedMessage.joinGroupMessage({
              type: 'combined',
              isCombat: config.isCombat,
              rollRequisites: [parts.join('#')]
            })
          } else if (config.cardType === Cd100RollNormalize.CARD_TYPE.OPPOSED) {
            Cd100ChatOpposedMessage.joinGroupMessage({
              isCombat: config.isCombat,
              rollRequisites: [parts.join('#')]
            })
          }
        }
        break
    }
  }
}
