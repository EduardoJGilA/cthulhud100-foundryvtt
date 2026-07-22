/* global CONFIG foundry game */
import { FOLDER_ID } from '../constants.js'
import Cd100Utilities from './utilities.js'

export default class Cd100RollAsModifierDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  /**
   * @inheritdoc
   */
  constructor (...args) {
    const coc7Config = args.pop()
    super(...args)
    this.coc7Config = coc7Config
    this.coc7Config.allSkills = {}
    game.Cd100.cocid.fromCoCIDRegexBest({ cocidRegExp: /^i\.skill\./, type: 'i', showLoading: true }).then((items) => {
      for (const item of items) {
        this.coc7Config.allSkills[item.flags.Cd100.cocidFlag.id] = item.name
      }
      if (this.coc7Config.type === 'SKILL') {
        this.render({ force: true })
      }
    })
  }

  /**
   * Active Effect Method
   * @returns {object}
   */
  static get ACTIVE_EFFECT_METHODS () {
    return {
      NONE: 'NONE',
      GROUPED: 'GROUPED',
      INDIVIDUAL: 'INDIVIDUAL'
    }
  }

  /**
   * Active Effect Method
   * @returns {object}
   */
  static get ACTIVE_EFFECT_METHOD_NAMES () {
    return {
      [Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.NONE]: 'Cd100.RollAsModifier.ActiveEffect.None',
      [Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.GROUPED]: 'Cd100.RollAsModifier.ActiveEffect.Grouped',
      [Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.INDIVIDUAL]: 'Cd100.RollAsModifier.ActiveEffect.Individual'
    }
  }

  /**
   * Modifiable Attributes
   * @returns {object}
   */
  static get ATTRIBUTES () {
    return ['hp', 'mp', 'lck', 'san', 'armor']
  }

  /**
   * Modifiable Attributes
   * @returns {object}
   */
  static get CHARACTERISTICS () {
    return ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu']
  }

  /**
   * Modifier Types
   * @returns {object}
   */
  static get MODIFIERS () {
    return {
      NONE: 'NONE',
      DAMAGE_MODIFY: 'DAMAGE_MODIFY',
      HEAL_MODIFY: 'HEAL_MODIFY'
    }
  }

  /**
   * Modifier Types
   * @returns {object}
   */
  static get MODIFIER_NAMES () {
    return {
      [Cd100RollAsModifierDialog.MODIFIERS.NONE]: 'Cd100.RollAsModifier.Modifier.None',
      [Cd100RollAsModifierDialog.MODIFIERS.DAMAGE_MODIFY]: 'Cd100.RollAsModifier.Modifier.DamageNumber',
      [Cd100RollAsModifierDialog.MODIFIERS.HEAL_MODIFY]: 'Cd100.RollAsModifier.Modifier.HealNumber'
    }
  }

  /**
   * Damage To
   * @returns {object}
   */
  static get TYPES () {
    return {
      ATTRIBUTE: 'ATTRIBUTE',
      CHARACTERISTIC: 'CHARACTERISTIC',
      SKILL: 'SKILL'
    }
  }

  /**
   * Damage To
   * @returns {object}
   */
  static get TYPE_NAMES () {
    return {
      [Cd100RollAsModifierDialog.TYPES.ATTRIBUTE]: 'Cd100.RollAsModifier.Type.Attribute',
      [Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC]: 'Cd100.RollAsModifier.Type.Characteristic',
      [Cd100RollAsModifierDialog.TYPES.SKILL]: 'Cd100.RollAsModifier.Type.Skill'
    }
  }

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['coc7', 'dialog', 'roll-as-modifier'],
    window: {
      title: 'Cd100.RollAsModifier.Title',
      contentClasses: [
        'standard-form'
      ]
    },
    form: {
      closeOnSubmit: false,
      handler: Cd100RollAsModifierDialog.#onSubmit
    },
    position: {
      width: 500
    }
  }

  static PARTS = {
    form: {
      template: 'systems/' + FOLDER_ID + '/templates/apps/roll-as-modifier.hbs',
      scrollable: ['']
    },
    footer: {
      template: 'templates/generic/form-footer.hbs'
    }
  }

  /**
   * Create popup
   * @param {document} message
   * @returns {string}
   */
  static async create ({ message } = {}) {
    const modifier = message.flags[FOLDER_ID]?.load?.modifier ?? Cd100RollAsModifierDialog.MODIFIERS.DAMAGE_MODIFY
    const type = message.flags[FOLDER_ID]?.load?.type ?? Cd100RollAsModifierDialog.TYPES.ATTRIBUTE
    const activeEffect = message.flags[FOLDER_ID]?.load?.activeEffect ?? Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHODS.NONE
    const value = message.flags[FOLDER_ID]?.load?.value ?? 'hp'
    return await new Promise(resolve => {
      new Cd100RollAsModifierDialog({}, {}, {
        activeEffect,
        message,
        modifier,
        resolve,
        type,
        value: {
          ATTRIBUTE: (type === Cd100RollAsModifierDialog.TYPES.ATTRIBUTE ? value : ''),
          CHARACTERISTIC: (type === Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC ? value : ''),
          SKILL: (type === Cd100RollAsModifierDialog.TYPES.SKILL ? value : '')
        }
      }).render({ force: true })
    })
  }

  /**
   * Submit the configuration form.
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async #onSubmit (event, form, formData) {
    this.coc7Config.value[this.coc7Config.type] = formData.object.value
    if (event.submitter.dataset.action !== 'validate') {
      switch (event.submitter.dataset.set) {
        case 'activeEffect':
        case 'modifier':
          this.coc7Config[event.submitter.dataset.set] = event.submitter.dataset.property
          break
        case 'type':
          this.coc7Config.type = event.submitter.dataset.property
          break
      }
      this.render({ force: true })
      return
    }
    let name = ''
    switch (this.coc7Config.type) {
      case Cd100RollAsModifierDialog.TYPES.ATTRIBUTE:
        name = CONFIG.Actor.dataModels.character.schema.getField('attribs').getField(this.coc7Config.value[this.coc7Config.type]).hint
        break
      case Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC:
        name = CONFIG.Actor.dataModels.character.schema.getField('characteristics').getField(this.coc7Config.value[this.coc7Config.type]).hint
        break
      case Cd100RollAsModifierDialog.TYPES.SKILL:
        name = this.coc7Config.allSkills[this.coc7Config.value[this.coc7Config.type]]
        break
    }

    this.coc7Config.resolve({
      activeEffect: this.coc7Config.activeEffect,
      modifier: this.coc7Config.modifier,
      name,
      type: this.coc7Config.type,
      value: this.coc7Config.value[this.coc7Config.type]
    })
    this.close()
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
      case 'form':
        {
          context._modifier = []
          context.modifier = this.coc7Config.modifier
          const options = Object.keys(Cd100RollAsModifierDialog.MODIFIER_NAMES)
          for (const id of options) {
            context._modifier.push({
              id,
              name: Cd100RollAsModifierDialog.MODIFIER_NAMES[id],
              tooltip: '',
              isEnabled: this.coc7Config.modifier === id
            })
          }
        }
        {
          context._type = []
          context.type = this.coc7Config.type
          const options = Object.keys(Cd100RollAsModifierDialog.TYPE_NAMES)
          for (const id of options) {
            context._type.push({
              id,
              name: Cd100RollAsModifierDialog.TYPE_NAMES[id],
              tooltip: '',
              isEnabled: this.coc7Config.type === id
            })
          }
        }
        {
          context._activeEffect = []
          context.activeEffect = this.coc7Config.activeEffect
          const options = Object.keys(Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHOD_NAMES)
          for (const id of options) {
            context._activeEffect.push({
              id,
              name: Cd100RollAsModifierDialog.ACTIVE_EFFECT_METHOD_NAMES[id],
              tooltip: '',
              isEnabled: this.coc7Config.activeEffect === id
            })
          }
        }
        context._values = []
        context.value = this.coc7Config.value[this.coc7Config.type] ?? ''
        switch (this.coc7Config.type) {
          case Cd100RollAsModifierDialog.TYPES.ATTRIBUTE:
            {
              const options = Cd100RollAsModifierDialog.ATTRIBUTES
              for (const key of options) {
                const val = CONFIG.Actor.dataModels.character.defineSchema().attribs.getField(key).hint ?? false
                if (val) {
                  context._values.push({
                    key,
                    name: game.i18n.localize(val)
                  })
                }
              }
            }
            break
          case Cd100RollAsModifierDialog.TYPES.CHARACTERISTIC:
            {
              const options = Cd100RollAsModifierDialog.CHARACTERISTICS
              for (const key of options) {
                const val = CONFIG.Actor.dataModels.character.defineSchema().characteristics.getField(key).hint ?? false
                if (val) {
                  context._values.push({
                    key,
                    name: game.i18n.localize(val)
                  })
                }
              }
            }
            break
          case Cd100RollAsModifierDialog.TYPES.SKILL:
            for (const key of Object.keys(this.coc7Config.allSkills)) {
              context._values.push({
                key,
                name: game.i18n.localize(this.coc7Config.allSkills[key])
              })
            }
        }
        context._values.sort(Cd100Utilities.sortByNameKey)
        break
      case 'footer':
        context.buttons = [
          {
            type: 'submit',
            action: 'close',
            label: 'Cd100.Cancel',
            icon: 'fa-solid fa-times'
          },
          {
            type: 'submit',
            action: 'validate',
            label: 'Cd100.Validate',
            icon: 'fa-solid fa-check'
          }
        ]
        break
    }
    return context
  }

  /**
   * @inheritdoc
   * @param {RenderOptions} options
   * @returns {Promise<HTMLElement>}
   */
  async _renderFrame (options) {
    const frame = await super._renderFrame(options)

    /* // FoundryV12 polyfill */
    if (!foundry.utils.isNewerVersion(game.version, 13)) {
      frame.setAttribute('open', true)
    }

    return frame
  }
}
