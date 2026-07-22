/* global ChatMessage CONST foundry game renderTemplate ui */
import { FOLDER_ID } from '../constants.js'
import Cd100ActorPickerDialog from './actor-picker-dialog.js'
import Cd100RollAsModifierDialog from './roll-as-modifier-dialog.js'
import Cd100Utilities from './utilities.js'

export default class Cd100ChatMessage {
  /**
   * Click Event on dice roll
   * @param {ClickEvent} event
   * @param {Document} message
   */
  static async _onClickEvent (event, message) {
    switch (event.currentTarget.dataset.action) {
      case 'applyValue':
        {
          const actorUuid = await Cd100ActorPickerDialog.create()
          const actor = await Cd100Utilities.getActorFromUuid(actorUuid)
          if (actor) {
            const modifier = message.flags[FOLDER_ID]?.load?.modifier
            const activeEffect = message.flags[FOLDER_ID]?.load?.activeEffect
            const type = message.flags[FOLDER_ID]?.load?.type
            const key = message.flags[FOLDER_ID]?.load?.value
            let total = message.rolls.reduce((c, r) => c + r.total, 0) * (modifier === Cd100RollAsModifierDialog.MODIFIERS.HEAL_MODIFY ? 1 : -1)
            if (activeEffect === Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.NONE) {
              switch (type) {
                case Cd100RollAsModifierDialog.TYPES.ATTRIBUTE:
                  if (actor.system.schema.getField('attribs')?.getField(key)) {
                    switch (key) {
                      case 'db':
                      case 'armor':
                        await actor.update({
                          ['system.attribs.' + key + '.value']: actor.system.attribs[key].value + (total < 0 ? total : '+' + total).toString()
                        })
                        break
                      case 'hp':
                        {
                          if (total < 0) {
                            total = -(await actor.dealDamage(-total))
                          } else {
                            const oldValue = parseInt(actor.system.attribs[key].value, 10)
                            const newValue = await actor.setHp(Math.max(0, oldValue + total))
                            total = newValue - oldValue
                          }
                        }
                        break
                      case 'san':
                        {
                          const oldValue = parseInt(actor.system.attribs[key].value, 10)
                          const newValue = await actor.setSan(Math.max(0, oldValue + total))
                          total = newValue - oldValue
                        }
                        break
                      case 'lck':
                        {
                          const oldValue = parseInt(actor.system.attribs[key].value, 10)
                          const newValue = await actor.setLuck(Math.max(0, oldValue + total))
                          total = newValue - oldValue
                        }
                        break
                      default:
                        {
                          const oldValue = parseInt(actor.system.attribs[key].value, 10)
                          const newValue = Math.max(0, oldValue + total)
                          await actor.update({
                            ['system.attribs.' + key + '.value']: newValue
                          })
                          total = newValue - oldValue
                        }
                        break
                    }
                  } else {
                    ui.notifications.warn('Cd100.Errors.UnparsableModification', { localize: true })
                  }
                  break
                case Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC:
                  if (actor.system.schema.getField('characteristics')?.getField(key)) {
                    const oldValue = parseInt(actor.system.characteristics[key].value, 10)
                    const newValue = Math.max(0, oldValue + total)
                    await actor.update({
                      ['system.characteristics.' + key + '.value']: newValue
                    })
                    total = newValue - oldValue
                  } else {
                    ui.notifications.warn('Cd100.Errors.UnparsableModification', { localize: true })
                  }
                  break
                case Cd100RollAsModifierDialog.TYPES.SKILL:
                  {
                    const skill = actor.getFirstItemByCoCID(key)
                    if (skill) {
                      const value = skill.system.value
                      const adjustment = (value + total < 0 ? -value : total)
                      await skill.update({
                        'system.adjustments.personal': adjustment + parseInt(skill.system.adjustments.personal, 10)
                      })
                    } else {
                      ui.notifications.warn('Cd100.Errors.UnparsableModification', { localize: true })
                    }
                  }
                  break
              }
              ChatMessage.create({
                speaker: { alias: actor.name },
                content: game.i18n.format(total <= 0 ? 'Cd100.RollAsModifier.Modifier.DamagedName' : 'Cd100.RollAsModifier.Modifier.HealedName', { name: game.i18n.localize(message.flags[FOLDER_ID].load.name), value: Math.abs(total) })
              })
              return
            }
            let changeKey = ''
            switch (type) {
              case Cd100RollAsModifierDialog.TYPES.ATTRIBUTE:
                if (actor.system.schema.getField('attribs')?.getField(key)) {
                  changeKey = 'system.attribs.' + key + '.value'
                }
                break
              case Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC:
                if (actor.system.schema.getField('characteristics')?.getField(key)) {
                  changeKey = 'system.characteristics.' + key + '.value'
                }
                break
              case Cd100RollAsModifierDialog.TYPES.SKILL:
                changeKey = 'system.skills.' + key + '.system.value'
                break
            }
            if (changeKey !== '') {
              let effect
              if (activeEffect === Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.GROUPED) {
                effect = actor.effects.find(d => d.flags[FOLDER_ID]?.load?.as === 'Cd100ChatMessage')
              }
              if (typeof effect !== 'undefined') {
                const changes = foundry.utils.duplicate(effect.changes)
                const index = changes.findIndex(c => c.key === changeKey)
                const change = {
                  key: changeKey,
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: total
                }
                if (index > -1) {
                  changes[index] = change
                } else {
                  changes.push(change)
                }
                await actor.updateEmbeddedDocuments('ActiveEffect', [{
                  _id: effect.id,
                  changes
                }])
              } else {
                const effect = {
                  name: game.i18n.localize(activeEffect === Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.GROUPED ? 'Cd100.RollAsModifier.ActiveEffect.GroupedName' : 'Cd100.RollAsModifier.ActiveEffect.IndividualName'),
                  img: 'icons/svg/d20.svg',
                  changes: [
                    {
                      key: changeKey,
                      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                      value: total
                    }
                  ],
                  flags: {
                    [FOLDER_ID]: {
                      load: {
                        as: 'Cd100ChatMessage'
                      }
                    }
                  }
                }
                await actor.createEmbeddedDocuments('ActiveEffect', [effect])
              }
              ChatMessage.create({
                speaker: { alias: actor.name },
                content: game.i18n.format(total <= 0 ? 'Cd100.RollAsModifier.Modifier.DamagedName' : 'Cd100.RollAsModifier.Modifier.HealedName', { name: game.i18n.localize(message.flags[FOLDER_ID].load.name), value: Math.abs(total) })
              })
            } else {
              ui.notifications.warn('Cd100.Errors.UnparsableModification', { localize: true })
            }
          }
        }
        break
      case 'setRollAsModifier':
        {
          const options = await Cd100RollAsModifierDialog.create({ message })
          message.update({
            flags: {
              [FOLDER_ID]: {
                load: {
                  activeEffect: options.activeEffect,
                  modifier: options.modifier,
                  name: options.name,
                  type: options.type,
                  value: options.value
                }
              }
            }
          })
        }
        break
    }
  }

  /**
   * Render Chat Message
   * @param {documents.ChatMessage} message
   * @param {HTMLElement} html
   * @param {ApplicationRenderContext} context
   * @param {false|Array} allowed
   */
  static async _onRenderMessage (message, html, context, allowed) {
    if (game.user.isGM) {
      if (message.content === '') {
        html.querySelector('.message-content .dice-roll').remove()
        return
      }
      const el = document.createElement('div')
      el.innerHTML = message.content
      if (!el.childElementCount && message.rolls.length) {
        // This is a basic roll message so add damage/heal buttons
        const buttons = document.createElement('div')
        const data = {
          isDamage: message.flags[FOLDER_ID]?.load?.modifier === Cd100RollAsModifierDialog.MODIFIERS.DAMAGE_MODIFY,
          isHeal: message.flags[FOLDER_ID]?.load?.modifier === Cd100RollAsModifierDialog.MODIFIERS.HEAL_MODIFY,
          name: message.flags[FOLDER_ID]?.load?.name ?? ''
        }
        /* // FoundryVTT V12 */
        buttons.innerHTML = await (foundry.applications.handlebars?.renderTemplate ?? renderTemplate)('systems/' + FOLDER_ID + '/templates/chat/parts/damage-buttons.hbs', data)
        html.querySelector('.message-content').append(buttons)
      }
      html.querySelectorAll('button[data-action]').forEach((element) => element.addEventListener('click', event => Cd100ChatMessage._onClickEvent(event, message)))
    }
  }
}
