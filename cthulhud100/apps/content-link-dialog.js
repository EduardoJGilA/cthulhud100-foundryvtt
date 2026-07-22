/* global ActiveEffectConfig canvas CONFIG CONST DragDrop FormDataExtended foundry game ui */
import { FOLDER_ID } from '../constants.js'
import Cd100DicePool from './dice-pool.js'
import Cd100Link from './link.js'
import Cd100Utilities from './utilities.js'

export default class Cd100ContentLinkDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  /**
   * @inheritdoc
   */
  constructor (...args) {
    const coc7Config = args.pop()
    super(...args)
    this.coc7Config = coc7Config
    this.tabGroups.primary = 'details'
  }

  static DEFAULT_OPTIONS = {
    id: 'link-creation',
    tag: 'form',
    classes: ['coc7', 'dialog', 'item', 'active-effect-config'],
    window: {
      contentClasses: [
        'standard-form'
      ],
      title: 'Cd100.CreateLink'
    },
    form: {
      closeOnSubmit: false,
      handler: Cd100ContentLinkDialog.#onSubmit
    },
    position: {
      width: 570
    },
    actions: {
      addChange: Cd100ContentLinkDialog.#onAddChange,
      deleteChange: Cd100ContentLinkDialog.#onDeleteChange
    }
  }

  static PARTS = {
    form: {
      template: 'systems/' + FOLDER_ID + '/templates/apps/link-creation.hbs',
      scrollable: ['']
    }
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
        context.checkType = [
          {
            key: Cd100Link.CHECK_TYPE.CHECK,
            label: game.i18n.localize('Cd100.Check')
          },
          {
            key: Cd100Link.CHECK_TYPE.SANLOSS,
            label: game.i18n.localize('Cd100.SanityCheck')
          },
          {
            key: Cd100Link.CHECK_TYPE.ITEM,
            label: game.i18n.localize('Cd100.ItemWeapon')
          },
          {
            key: Cd100Link.CHECK_TYPE.EFFECT,
            label: game.i18n.localize('DOCUMENT.ActiveEffects')
          }
        ]
        context.checkTypes = Cd100Link.CHECK_TYPE
        context.linkType = [
          {
            key: Cd100Link.LINK_TYPE.CHARACTERISTIC,
            label: game.i18n.localize('Cd100.Characteristic')
          },
          {
            key: Cd100Link.LINK_TYPE.ATTRIBUTE,
            label: game.i18n.localize('Cd100.Attribute')
          },
          {
            key: Cd100Link.LINK_TYPE.SKILL,
            label: game.i18n.localize('Cd100.Skill')
          }
        ]
        context.linkTypes = Cd100Link.LINK_TYPE
        context.attributeType = []
        for (const [key, field] of CONFIG.Actor.dataModels.character.schema.getField('attribs').entries()) {
          if (['lck', 'san'].includes(key)) {
            context.attributeType.push({
              key,
              label: game.i18n.localize(field.hint)
            })
          }
        }
        context.characteristicType = []
        for (const [key, field] of CONFIG.Actor.dataModels.character.schema.getField('characteristics').entries()) {
          context.characteristicType.push({
            key,
            label: game.i18n.localize(field.hint)
          })
        }
        context.modes = Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((modes, [key, value]) => {
          modes[value] = game.i18n.localize('EFFECT.MODE_' + key)
          return modes
        }, {})
        context.link = this.coc7Config.linkData
        context.rollDifficulties = [
          {
            key: Cd100DicePool.difficultyLevel.unknown,
            label: 'Cd100.RollDifficultyUnknownName'
          },
          {
            key: Cd100DicePool.difficultyLevel.regular,
            label: 'Cd100.RollDifficultyRegular'
          },
          {
            key: Cd100DicePool.difficultyLevel.hard,
            label: 'Cd100.RollDifficultyHard'
          },
          {
            key: Cd100DicePool.difficultyLevel.extreme,
            label: 'Cd100.RollDifficultyExtreme'
          },
          {
            key: Cd100DicePool.difficultyLevel.critical,
            label: 'Cd100.RollDifficultyCritical'
          }
        ]
        context.other = this.coc7Config.other
        context.tabs = [
          {
            id: 'details',
            group: 'primary',
            cssClass: (this.tabGroups.primary === 'details' ? 'active' : ''),
            icon: 'fa-solid fa-book',
            /* // FoundryVTT V12 */
            label: (game.release.generation === 12 ? 'EFFECT.TabDetails' : 'EFFECT.TABS.details')
          },
          {
            id: 'duration',
            group: 'primary',
            cssClass: (this.tabGroups.primary === 'duration' ? 'active' : ''),
            icon: 'fa-solid fa-clock',
            /* // FoundryVTT V12 */
            label: (game.release.generation === 12 ? 'EFFECT.TabDuration' : 'EFFECT.TABS.duration')
          },
          {
            id: 'effects',
            group: 'primary',
            cssClass: (this.tabGroups.primary === 'effects' ? 'active' : ''),
            icon: 'fa-solid fa-cogs',
            /* // FoundryVTT V12 */
            label: (game.release.generation === 12 ? 'EFFECT.TabEffects' : 'EFFECT.TABS.changes')
          }
        ]
        context.rootId = 'new-effect'
        context.statuses = CONFIG.statusEffects.map(s => ({ value: s.id, label: game.i18n.localize(s.name) }))
        context.actorNames = this.coc7Config.actors.map(a => a.name).join(', ')
        context.priorities = (foundry.applications.sheets.ActiveEffectConfig ?? ActiveEffectConfig).DEFAULT_PRIORITIES
        context.fields = CONFIG.ActiveEffect.documentClass.schema.fields
        if (game.release.generation === 12) {
          context.fields.tint.label = game.i18n.localize(context.fields.tint.label)
          context.fields.description.label = game.i18n.localize(context.fields.description.label)
          context.fields.disabled.label = game.i18n.localize('EFFECT.Disabled')
          context.fields.statuses.label = 'Status Conditions'
          context.fields.duration.fields.seconds.label = game.i18n.localize(context.fields.duration.fields.seconds.label)
          context.fields.duration.fields.startTime.label = game.i18n.localize(context.fields.duration.fields.startTime.label)
          context.fields.duration.fields.rounds.label = game.i18n.localize('COMBAT.Rounds')
          context.fields.duration.fields.turns.label = game.i18n.localize('COMBAT.Turns')
          context.fields.duration.fields.startRound.label = game.i18n.localize('COMBAT.Round')
          context.fields.duration.fields.startTurn.label = game.i18n.localize('COMBAT.Turn')
        }
        /* // FoundryVTT V12 */
        context.noPriority = (game.release.generation === 12)
        context.modifiers = [
          {
            id: 'difficulty',
            isEnabled: this.coc7Config.other.difficulty,
            name: 'Cd100.RollDifficulty'
          },
          {
            id: 'poolModifier',
            isEnabled: this.coc7Config.other.poolModifier,
            name: 'Cd100.BonusDice'
          },
          {
            id: 'blind',
            isEnabled: this.coc7Config.linkData.blind,
            name: 'Cd100.Blind'
          },
          {
            id: 'pushing',
            isEnabled: this.coc7Config.linkData.pushing,
            name: 'Cd100.Pushing'
          },
          {
            id: 'label',
            isEnabled: this.coc7Config.other.label,
            name: 'Cd100.Label'
          },
          {
            id: 'icon',
            isEnabled: this.coc7Config.other.icon,
            name: 'Cd100.Icon'
          }
        ]
        if (this.coc7Config.linkData.check !== Cd100Link.CHECK_TYPE.CHECK) {
          const index = context.modifiers.findIndex(m => m.id === 'pushing')
          if (index > -1) {
            context.modifiers.splice(index, 1)
          }
        }
        context.tabsPrimary = this.tabGroups.primary
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

  /**
   * @inheritdoc
   * @param {ApplicationRenderContext} context
   * @param {RenderOptions} options
   * @returns {Promise<void>}
   */
  async _onRender (context, options) {
    await super._onRender(context, options)

    this.element.querySelectorAll('select').forEach((element) => element.addEventListener('change', async (event) => {
      event.currentTarget.closest('form').dispatchEvent(new SubmitEvent('submit'))
    }))
    this.element.querySelectorAll('.toggle-switch').forEach((element) => element.addEventListener('click', (event) => {
      const propertyId = event.target.dataset.property
      switch (propertyId) {
        case 'icon':
        case 'label':
        case 'difficulty':
        case 'poolModifier':
          this.coc7Config.other[propertyId] = !this.coc7Config.other[propertyId]
          break
        case 'blind':
        case 'pushing':
          this.coc7Config.linkData[propertyId] = !this.coc7Config.linkData[propertyId]
      }
      if (propertyId === 'difficulty' && this.coc7Config.other[propertyId] && typeof this.coc7Config.linkData.difficulty === 'undefined') {
        this.coc7Config.linkData.difficulty = Cd100DicePool.difficultyLevel[game.settings.get(FOLDER_ID, 'defaultCheckDifficulty')]
      }
      event.currentTarget.closest('form').dispatchEvent(new SubmitEvent('submit'))
      this.render({ force: true })
    }))

    /* // FoundryVTT V12 */
    new (foundry.applications.ux?.DragDrop ?? DragDrop)({
      permissions: {
        drop: true
      },
      callbacks: {
        drop: this._onDrop.bind(this)
      }
    }).bind(this.element)
  }

  /**
   * Add Active Effect Change
   */
  static async #onAddChange () {
    /* // FoundryVTT V12 */
    ;(this.form ?? this.element).dispatchEvent(new SubmitEvent('submit'))
    /* // FoundryVTT V12 */
    const submitData = new (foundry.applications?.ux?.FormDataExtended ?? FormDataExtended)(this.form ?? this.element)
    const formData = foundry.utils.expandObject(submitData.object)
    const changes = Object.values(formData.changes ?? {})
    changes.push({})
    this.coc7Config.linkData.object.changes = changes
    this.render({ force: true })
  }

  /**
   * Add Active Effect Change
   * @param {ClickEvent} event
   */
  static async #onDeleteChange (event) {
    /* // FoundryVTT V12 */
    ;(this.form ?? this.element).dispatchEvent(new SubmitEvent('submit'))
    /* // FoundryVTT V12 */
    const submitData = new (foundry.applications?.ux?.FormDataExtended ?? FormDataExtended)(this.form ?? this.element)
    const formData = foundry.utils.expandObject(submitData.object)
    const changes = Object.values(formData.changes)
    const row = event.target.closest('li')
    const index = Number(row.dataset.index) || 0
    changes.splice(index, 1)
    this.coc7Config.linkData.object.changes = changes
    this.render({ force: true })
  }

  /**
   * Submit the configuration form.
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async #onSubmit (event, form, formData) {
    for (const [key, value] of Object.entries(formData.object)) {
      if (['check', 'icon', 'label', 'poolModifier', 'difficulty', 'sanMax', 'sanMin', 'sanReason', 'subtype'].includes(key)) {
        this.coc7Config.linkData[key] = value
      } else if (['attributeName', 'characteristicName', 'itemName', 'skillName'].includes(key)) {
        this.coc7Config.other[key] = value
        this.coc7Config.linkData.name = value
      } else if (['description', 'disabled', 'statuses', 'tint'].includes(key)) {
        this.coc7Config.linkData.object[key] = value
      } else if (['duration.rounds', 'duration.seconds', 'duration.startRound', 'duration.startTime', 'duration.startTurn', 'duration.turns'].includes(key)) {
        foundry.utils.setProperty(this.coc7Config.linkData.object, key, value)
      } else if (key.startsWith('object.')) {
        foundry.utils.setProperty(this.coc7Config.linkData, key, value)
      } else if (key.startsWith('changes.')) {
        foundry.utils.setProperty(this.coc7Config.linkData.object, key, value)
      }
    }
    if (event.type === 'submit' && ['chat', 'clipboard', 'whisper-owner', 'whisper-selected'].includes(event.submitter?.dataset?.action)) {
      const link = await this.createLink()
      switch (event.submitter?.dataset?.action) {
        case 'clipboard':
          await game.clipboard.copyPlainText(link._createDocumentLink(null))
          /* // FoundryVTT V12 */
          ui.notifications.info(game.i18n.format('Cd100.WhatCopiedClipboard', { what: game.i18n.localize('Cd100.CreateLink') }), { console: false })
          break
        case 'chat':
          link.toChatMessage()
          break
        case 'whisper-owner':
          link.toWhisperMessage(this.coc7Config.actors)
          break
        case 'whisper-selected':
          if (!canvas.ready || !canvas.tokens.controlled.length) {
            ui.notifications.warn('Cd100.ErrorNoTokensSelected', { localize: true })
            return
          }
          link.toWhisperMessage(canvas.tokens.controlled.filter(t => t.actor.owners.length).map(t => t.actor))
          break
      }
    }
    this.render({ force: true })
  }

  /**
   * Handle Drop
   * @param {Event} event
   */
  async _onDrop (event) {
    const dataString = event.dataTransfer.getData('text/plain')
    const data = JSON.parse(dataString)
    if (data.type === 'Cd100Link') {
      const actors = this.coc7Config.actors
      this.coc7Config = Cd100ContentLinkDialog.createConfig(data)
      this.coc7Config.actors = actors
      this.render({ force: true })
    } else if (data.type === 'Folder' || ['Item', 'Actor'].includes(data.type)) {
      const documentType = (data.type === 'Folder' ? 'Actor' : data.type)
      const droppedDocuments = (await Cd100Utilities.getDataFromDropEvent(event, documentType))
      if (documentType === 'Actor') {
        this.coc7Config.actors = droppedDocuments
        this.render({ force: true })
      } else if (documentType === 'Item' && droppedDocuments.length === 1 && ['skill', 'weapon'].includes(droppedDocuments[0].type)) {
        const id = droppedDocuments[0].flags[FOLDER_ID]?.cocidFlag?.id
        const key = (droppedDocuments[0].type === 'skill' ? 'skillName' : 'itemName')
        switch (key) {
          case 'itemName':
            this.coc7Config.linkData.check = Cd100Link.CHECK_TYPE.ITEM
            break
          case 'skillName':
            this.coc7Config.linkData.check = Cd100Link.CHECK_TYPE.CHECK
            this.coc7Config.linkData.subtype = Cd100Link.LINK_TYPE.SKILL
            break
        }
        if (id) {
          this.coc7Config.other[key] = id
          this.coc7Config.linkData.name = id
          this.coc7Config.other.label = true
          this.coc7Config.linkData.label = droppedDocuments[0].name
        } else {
          this.coc7Config.other[key] = droppedDocuments[0].name
          this.coc7Config.linkData.name = droppedDocuments[0].name
        }
        this.render({ force: true })
      }
    }
  }

  /**
   * Create Cd100Link from config
   * @returns {Promise<Cd100Link>}
   */
  async createLink () {
    const data = {
      check: this.coc7Config.linkData.check
    }
    let toggles = false
    switch (data.check) {
      case Cd100Link.CHECK_TYPE.CHECK:
        data.subtype = this.coc7Config.linkData.subtype
        data.name = this.coc7Config.linkData.name
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.SANLOSS:
        data.sanMin = this.coc7Config.linkData.sanMin
        data.sanMax = this.coc7Config.linkData.sanMax
        data.sanReason = this.coc7Config.linkData.sanReason
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.ITEM:
        data.name = this.coc7Config.linkData.name
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.EFFECT:
        data.object = this.coc7Config.linkData.object
        if (this.coc7Config.linkData.label.length) {
          data.label = this.coc7Config.linkData.label
        }
        break
    }
    if (toggles) {
      if (this.coc7Config.other.difficulty) {
        data.difficulty = this.coc7Config.linkData.difficulty
      }
      if (this.coc7Config.other.poolModifier) {
        data.poolModifier = this.coc7Config.linkData.poolModifier
      }
      if (this.coc7Config.linkData.blind) {
        data.blind = this.coc7Config.linkData.blind
      }
      if (this.coc7Config.linkData.check === Cd100Link.CHECK_TYPE.CHECK) {
        if (this.coc7Config.linkData.pushing) {
          data.pushing = this.coc7Config.linkData.pushing
        }
      }
      if (this.coc7Config.linkData.icon) {
        data.icon = this.coc7Config.linkData.icon
      }
      if (this.coc7Config.other.label) {
        data.label = this.coc7Config.linkData.label
      }
    }
    return Cd100Link.fromDropData(data)
  }

  /**
   * Data to config
   * @param {object} linkData
   * @returns {object}
   */
  static createConfig (linkData = {}) {
    const coc7Config = {
      linkData: {
        check: Cd100Link.CHECK_TYPE.CHECK,
        subtype: Cd100Link.LINK_TYPE.CHARACTERISTIC,
        name: 'str',
        sanMin: '',
        sanMax: '',
        sanReason: '',
        label: '',
        object: {
          description: ''
        }
      },
      other: {
        attributeName: 'lck',
        characteristicName: 'str',
        skillName: '',
        difficulty: false,
        poolModifier: false,
        label: false,
        icon: false
      }
    }
    switch (linkData.check ?? '') {
      case Cd100Link.CHECK_TYPE.CHECK:
        coc7Config.linkData.check = linkData.check
        switch (linkData.subtype ?? '') {
          case Cd100Link.LINK_TYPE.ATTRIBUTE:
            coc7Config.linkData.subtype = linkData.subtype
            coc7Config.linkData.name = linkData.name
            coc7Config.other.attributeName = linkData.name
            break
          case Cd100Link.LINK_TYPE.CHARACTERISTIC:
            coc7Config.linkData.subtype = linkData.subtype
            coc7Config.linkData.name = linkData.name
            coc7Config.other.characteristicName = linkData.name
            break
          case Cd100Link.LINK_TYPE.SKILL:
            coc7Config.linkData.subtype = linkData.subtype
            coc7Config.linkData.name = linkData.name
            coc7Config.other.skillName = linkData.name
            break
        }
        break
      case Cd100Link.CHECK_TYPE.SANLOSS:
        coc7Config.linkData.check = linkData.check
        coc7Config.linkData.sanMin = linkData.sanMin
        coc7Config.linkData.sanMax = linkData.sanMax
        coc7Config.linkData.sanReason = linkData.sanReason
        break
      case Cd100Link.CHECK_TYPE.ITEM:
        coc7Config.linkData.check = linkData.check
        coc7Config.other.itemName = linkData.name
        break
      case Cd100Link.CHECK_TYPE.EFFECT:
        coc7Config.linkData.check = linkData.check
        if (typeof linkData.object === 'string') {
          coc7Config.linkData.object = JSON.parse(linkData.object)
        } else {
          coc7Config.linkData.object = foundry.utils.duplicate(linkData.object)
        }
        if (typeof linkData.label !== 'undefined') {
          coc7Config.linkData.label = linkData.label
        }
        break
    }
    switch (linkData.check ?? '') {
      case Cd100Link.CHECK_TYPE.EFFECT:
        break
      default:
        if (typeof linkData.blind !== 'undefined') {
          coc7Config.linkData.blind = linkData.blind
        }
        if (typeof linkData.pushing !== 'undefined') {
          coc7Config.linkData.pushing = linkData.pushing
        }
        if (typeof linkData.difficulty !== 'undefined') {
          coc7Config.linkData.difficulty = linkData.difficulty
          coc7Config.other.difficulty = true
        }
        if (typeof linkData.label !== 'undefined') {
          coc7Config.linkData.label = linkData.label
          coc7Config.other.label = true
        }
        if (typeof linkData.icon !== 'undefined') {
          coc7Config.linkData.icon = linkData.icon
          coc7Config.other.icon = true
        }
        if (typeof linkData.poolModifier !== 'undefined') {
          coc7Config.linkData.poolModifier = linkData.poolModifier
          coc7Config.other.poolModifier = true
        }
    }
    return coc7Config
  }

  /**
   * New link dialog
   * @param {object} linkData
   */
  static async create (linkData = {}) {
    const coc7Config = Cd100ContentLinkDialog.createConfig(linkData)
    coc7Config.actors = []
    new Cd100ContentLinkDialog({}, {}, coc7Config).render({ force: true })
  }
}
