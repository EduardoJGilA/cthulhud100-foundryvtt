/* global foundry fromUuid game renderTemplate */
import { FOLDER_ID } from '../constants.js'
import Cd100DicePool from './dice-pool.js'
import Cd100RollNormalize from './roll-normalize.js'

export default class Cd100RollDialog extends foundry.applications.api.DialogV2 {
  /**
   * Ceiling that total darkness puts on a check: min(POD x3, INT x3).
   *
   * Returns null when the actor cannot be resolved, in which case total
   * darkness only quarters the skill and the Keeper caps it by hand.
   * @param {string} actorUuid
   * @returns {Promise<number|null>}
   */
  static async #darknessCap (actorUuid) {
    if (!actorUuid) {
      return null
    }
    const actor = await fromUuid(actorUuid)
    const pow = actor?.system?.characteristics?.pow?.value
    const int = actor?.system?.characteristics?.int?.value
    if (typeof pow !== 'number' || typeof int !== 'number') {
      return null
    }
    return Math.min(pow, int) * 3
  }

  /**
   * Show User a roll dialog
   * @param {object} options
   * @returns {object}
   */
  static async create (options = {}) {
    const data = {
      allowFlatDiceModifier: game.settings.get(FOLDER_ID, 'allowFlatDiceModifier') && !options.disableFlatDiceModifier,
      allowFlatThresholdModifier: game.settings.get(FOLDER_ID, 'allowFlatThresholdModifier') && !options.disableFlatThresholdModifier,
      askValue: options.askValue ?? false,
      cardTypes: Cd100RollNormalize.cardTypes(options),
      difficulty: Cd100DicePool.difficultyLevel,
      // Cthulhu d100 has no requested-difficulty tiers. A check is rolled against
      // the skill, and the situation is expressed with the circumstance
      // modifiers below (+/-20%, +/-10%), which adjust the threshold instead.
      difficultyTypes: [
        {
          key: Cd100DicePool.difficultyLevel.unknown,
          val: 'Cd100.RollDifficultyUnknownName'
        },
        {
          key: Cd100DicePool.difficultyLevel.regular,
          val: 'Cd100.RollDifficultyRegular'
        }
      ],
      // Rulebook chapter 1: illumination scales the skill rather than shifting
      // it, so the reduction is worked out from the threshold at submit time.
      illuminationLevels: [
        { key: 'normal', val: 'Cd100.IlluminationNormal' },
        { key: 'dim', val: 'Cd100.IlluminationDim' },
        { key: 'nearDark', val: 'Cd100.IlluminationNearDark' },
        { key: 'totalDark', val: 'Cd100.IlluminationTotalDark' }
      ],
      // Total darkness also caps the result at min(POD x3, INT x3)
      darknessCap: await Cd100RollDialog.#darknessCap(options.actorUuid),
      // Rulebook chapter 1: circumstance modifiers applied to the threshold
      circumstanceModifiers: [
        { key: 20, val: 'Cd100.CircumstanceVeryFavourable' },
        { key: 10, val: 'Cd100.CircumstanceFavourable' },
        { key: 0, val: 'Cd100.CircumstanceNormal' },
        { key: -10, val: 'Cd100.CircumstanceUnfavourable' },
        { key: -20, val: 'Cd100.CircumstanceVeryUnfavourable' }
      ],
      hideDifficulty: options.hideDifficulty === true,
      poolModifiers: {
        default: options.poolModifierDefault,
        idea: options.poolModifierIdea ?? 0,
        know: options.poolModifierKnow ?? 0
      },
      options: {
        cardType: options.cardType,
        difficulty: options.difficulty,
        flatDiceModifier: options.flatDiceModifier,
        flatThresholdModifier: options.flatThresholdModifier,
        poolModifier: options.poolModifier,
        threshold: options.threshold
      }
    }
    await this.prompt({
      classes: ['coc7', 'dialog', 'bonus-selection'],
      window: {
        title: options.displayName ? game.i18n.format('Cd100.BonusSelectionWindowNamed', { name: options.displayName }) : game.i18n.localize('Cd100.BonusSelectionWindow')
      },
      position: {
        width: 610
      },
      rejectClose: true,
      /* // FoundryVTT V12 */
      content: await (foundry.applications.handlebars?.renderTemplate ?? renderTemplate)('systems/' + FOLDER_ID + '/templates/apps/bonus.hbs', data),
      render: (event, dialog) => {
        dialog.element.querySelector('select[name=cardType]')?.addEventListener('change', (event) => {
          const poolModifier = event.currentTarget.form.querySelector('input[name=poolModifier]')
          switch (event.currentTarget.value) {
            case Cd100RollNormalize.CARD_TYPE.IDEA_CHECK:
              poolModifier.value = data.poolModifiers.idea
              break
            case Cd100RollNormalize.CARD_TYPE.KNOW_CHECK:
              poolModifier.value = data.poolModifiers.know
              break
            default:
              poolModifier.value = data.poolModifiers.default
          }
        })
      },
      ok: {
        callback: (event, button, dialog) => {
          if (typeof button.form.elements.cardType !== 'undefined') {
            data.options.cardType = button.form.elements.cardType.value
          }
          if (typeof button.form.elements.difficulty !== 'undefined') {
            data.options.difficulty = button.form.elements.difficulty.value
          }
          if (typeof button.form.elements.flatDiceModifier !== 'undefined') {
            data.options.flatDiceModifier = button.form.elements.flatDiceModifier.valueAsNumber
          }
          if (typeof button.form.elements.flatThresholdModifier !== 'undefined') {
            data.options.flatThresholdModifier = button.form.elements.flatThresholdModifier.valueAsNumber
            // The circumstance dropdown is a shortcut onto the same modifier, so
            // add it rather than letting the two fight over the value.
            const circumstance = parseInt(button.form.elements.circumstanceModifier?.value ?? 0, 10)
            if (!isNaN(circumstance) && circumstance !== 0) {
              data.options.flatThresholdModifier += circumstance
            }
            // Illumination halves or quarters the skill, so it is expressed as
            // the difference from the current threshold and folded into the
            // same additive modifier.
            const illumination = button.form.elements.illumination?.value ?? 'normal'
            const base = parseInt(data.options.threshold, 10)
            if (illumination !== 'normal' && !isNaN(base)) {
              let reduced = Math.floor(base / (illumination === 'dim' ? 2 : 4))
              if (illumination === 'totalDark' && data.darknessCap !== null) {
                reduced = Math.min(reduced, data.darknessCap)
              }
              data.options.flatThresholdModifier += reduced - base
            }
          }
          if (typeof button.form.elements.poolModifier !== 'undefined') {
            data.options.poolModifier = button.form.elements.poolModifier.valueAsNumber
          }
          if (typeof button.form.elements.threshold !== 'undefined') {
            data.options.threshold = button.form.elements.threshold.value
          }
        }
      }
    })
    return data.options
  }

  /**
   * Replace function to allow two icons
   * @returns {HTMLElement}
   */
  _renderButtons () {
    const button = document.createElement('button')
    button.setAttribute('type', 'submit')
    button.setAttribute('data-action', 'ok')
    button.toggleAttribute('autofocus', true)
    for (let dice = 2; dice > 0; dice--) {
      const i = document.createElement('i')
      i.className = 'fa-solid fa-dice-d10'
      button.appendChild(i)
    }
    const span = document.createElement('span')
    span.innerText = game.i18n.localize('Cd100.RollDice')
    button.appendChild(span)
    return button.outerHTML
  }
}
