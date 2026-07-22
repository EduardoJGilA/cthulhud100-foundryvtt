/* global foundry game TextEditor */
import { FOLDER_ID, ERAS } from '../../constants.js'
import Cd100ActiveEffect from '../../apps/active-effect.js'
import Cd100ModelsItemGlobalSheet from './global-sheet.js'
import Cd100Utilities from '../../apps/utilities.js'

export default class Cd100ModelsItemItemSheetV2 extends Cd100ModelsItemGlobalSheet {
  static DEFAULT_OPTIONS = {
    position: {
      width: 525,
      height: 450
    }
  }

  static PARTS = {
    header: {
      template: 'systems/' + FOLDER_ID + '/templates/items/item-v2-header.hbs'
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs'
    },
    description: {
      template: 'systems/' + FOLDER_ID + '/templates/items/common-tab-description.hbs',
      scrollable: ['.editor-content']
    },
    activeEffects: {
      template: 'systems/' + FOLDER_ID + '/templates/items/common-tab-active-effects.hbs',
      scrollable: ['']
    },
    prices: {
      template: 'systems/' + FOLDER_ID + '/templates/items/common-tab-prices.hbs',
      scrollable: ['']
    },
    keeper: {
      template: 'systems/' + FOLDER_ID + '/templates/items/common-tab-keeper.hbs',
      scrollable: ['.editor-content']
    }
  }

  /**
   * @inheritdoc
   * @param {RenderOptions} options
   * @returns {Promise<ApplicationRenderContext>}
   */
  async _prepareContext (options) {
    const context = await super._prepareContext(options)

    const tabs = {
      description: {
        icon: '',
        label: 'Cd100.Description'
      },
      activeEffects: {
        cssClass: 'icon-only-tab',
        icon: 'game-icon game-icon-aura',
        tooltip: 'Cd100.Effects'
      },
      prices: {
        cssClass: 'icon-only-tab',
        icon: 'fa-solid fa-tag',
        tooltip: 'Cd100.ItemPrice'
      }
    }
    if (game.user.isGM) {
      tabs.keeper = {
        cssClass: 'icon-only-tab',
        icon: 'game-icon game-icon-tentacles-skull',
        tooltip: 'Cd100.GmNotes'
      }
    }

    context.tabs = this.getTabs('primary', 'description', tabs)

    return context
  }

  /**
   * @inheritdoc
   * @param {string} partId
   * @param {ApplicationRenderContext} context
   * @param {HandlebarsRenderOptions} options
   * @returns {Promise<ApplicationRenderContext>}
   */
  async _preparePartContext (partId, context, options) {
    context = await super._preparePartContext(partId, context, options)

    switch (partId) {
      case 'header':
        context.worldEra = game.settings.get(FOLDER_ID, 'worldEra')
        break
      case 'description':
        /* // FoundryVTT V12 */
        context.enrichedDescriptionValue = await (foundry.applications.ux?.TextEditor.implementation ?? TextEditor).enrichHTML(
          context.document.system.description.value,
          {
            async: true,
            secrets: context.editable
          }
        )
        break
      case 'activeEffects':
        context.effects = await Cd100ActiveEffect.prepareActiveEffectCategories(context.document, { status: false })
        break
      case 'prices':
        context._eras = []
        for (const [key, era] of Object.entries(ERAS)) {
          const isEnabled = (context.document.flags[FOLDER_ID]?.cocidFlag?.eras ?? {})[key] === true
          context._eras.push({
            price: (isEnabled ? context.document.system.price[key] : null),
            id: key,
            name: game.i18n.localize(era.name),
            icon: era.icon,
            isEnabled
          })
        }
        context._eras.sort(Cd100Utilities.sortByNameKey)
        context.useEraIcons = game.settings.get(FOLDER_ID, 'sheetEraIcons')
        break
      case 'keeper':
        /* // FoundryVTT V12 */
        context.enrichedDescriptionKeeper = await (foundry.applications.ux?.TextEditor.implementation ?? TextEditor).enrichHTML(
          context.document.system.description.keeper,
          {
            async: true,
            secrets: context.editable
          }
        )
        break
    }
    return context
  }
}
