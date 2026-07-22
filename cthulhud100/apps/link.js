/* global canvas ChatMessage CONFIG foundry fromUuid game TextEditor */
// cSpell:words combinedall combinedany
import Cd100ActorPickerDialog from './actor-picker-dialog.js'
import Cd100ChatCombinedMessage from './chat-combined-message.js'
import Cd100ChatOpposedMessage from './chat-opposed-message.js'
import Cd100ContentLinkDialog from './content-link-dialog.js'
import Cd100DicePool from './dice-pool.js'
import Cd100SanCheckCard from './san-check-card.js'
import Cd100Utilities from './utilities.js'
import deprecated from '../deprecated.js'

/*
 * Allow for parsing of Cd100 elements in chat message and sheets.
 * Format is :
 * @cd100.TYPE_OF_REQUEST[OPTIONS]{DISPLAYED_NAME}
 * TYPE_OF_REQUEST :
 * - sanloss: trigger a san check, upon failure will propose to deduct the corresponding SAN.
 * - check: trigger a check depending on the options.
 * - item: Trigger a weapon check
 * - effect: Add an effect
 *
 * OPTIONS: [] = optional
 * sanloss:
 *   sanMax: max SAN loss
 *   sanMin: min SAN loss
 *   sanReason: Reason
 * check:
 *   type: type of check (characteristic, skill, attrib).
 *   name: name of the skill/characteristic.
 *   [difficulty]: ? (blind), 0 (regular), + (hard), ++ (extreme), +++ (critical).
 *   [modifier]: -x (x penalty dice), +x (x bonus dice), 0 (no modifier).
 *   [icon]: icon to use (font awesome).
 *   [blind]: will trigger a blind roll.
 *   [pushing]: will trigger a pushed roll
 *
 * [DISPLAYED_NAME: name to display.]
 *
 * To add/edit a new link update these sections
 *   fromDropData => Add all defaults here
 *   _createLink => Called by FoundryVTT when processing enrichers RegExp defined in init()
 *   _createDocumentLink => Create @link from document data
 *   _onLinkActorClick => Process link
 */
export default class Cd100Link {
  #blind
  #check
  #combat
  #difficulty
  #hasBlind
  #hasCombat
  #hasDifficulty
  #hasIcon
  #hasLabel
  #hasPoolModifier
  #hasPushing
  #icon
  #label
  #object
  #poolModifier
  #pushing
  #rolls
  #sanMax
  #sanMin
  #sanReason
  #subtype
  #name

  /**
   * Check types
   * @returns {object}
   */
  static get CHECK_TYPE () {
    return {
      CHECK: 'check',
      SANLOSS: 'sanloss',
      ITEM: 'item',
      EFFECT: 'effect'
    }
  }

  /**
   * Check link types
   * @returns {object}
   */
  static get LINK_TYPE () {
    return {
      CHARACTERISTIC: 'characteristic',
      ATTRIBUTE: 'attribute',
      SKILL: 'skill'
    }
  }

  /**
   * Set up Enricher, click, drag, and class
   */
  static init () {
    CONFIG.Cd100Link = {
      documentClass: Cd100Link
    }
    /* // FoundryVTT V12 */
    if (game.release.generation === 12) {
      document.body.addEventListener('click', event => {
        if (event.target?.closest('a.coc7-link')) {
          Cd100Link._onLinkClick(event)
        }
      })
      document.body.addEventListener('dragstart', event => {
        if (event.target?.closest('a.coc7-link')) {
          Cd100Link._onDragCd100Link(event)
        }
      })
    }
    CONFIG.TextEditor.enrichers.push({
      id: 'coc7-enricher',
      pattern: new RegExp('@(coc7)\\.' + '(check|effect|item|sanloss)' + '\\[((?:[^\\[\\]]*(?:\\[[^\\[\\]]*[^\\[\\]]*\\])*[^\\[\\]]*)*)\\]' + '(?:{([^}]+)})?', 'gi'),
      enricher: Cd100Link._createLink,
      onRender: Cd100Link.onRenderEnricher
    })
  }

  /**
   * Make links clickable
   * @param {HTMLElement} element
   */
  static onRenderEnricher (element) {
    if (!element.dataset.hasEvents) {
      element.dataset.hasEvents = true
      element.addEventListener('click', event => {
        if (event.target?.closest('a.coc7-link')) {
          Cd100Link._onLinkClick(event)
        }
      })
      element.addEventListener('dragstart', event => {
        if (event.target?.closest('a.coc7-link')) {
          Cd100Link._onDragCd100Link(event)
        }
      })
    }
  }

  /**
   * Get link data from Event
   * @param {ClickEvent|DragEvent} event
   * @returns {object}
   */
  static _linkDataFromEvent (event) {
    const a = event.target.closest('a.coc7-link')
    const data = foundry.utils.duplicate(a.dataset)
    data.label = event.target.innerText
    return data
  }

  /**
   * Toggle document flag
   * @param {DragEvent} event
   */
  static _onDragCd100Link (event) {
    event.stopPropagation()
    const dragData = Cd100Link._linkDataFromEvent(event)
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  }

  /**
   * Create instance from drop data
   * @param {object} data
   * @param {string} data.check
   * @param {string} data.subtype optional
   * @param {string} data.name optional
   * @param {string} data.sanMax optional
   * @param {string} data.sanMin optional
   * @param {string} data.sanReason optional
   * @param {string|object} data.object optional
   * @param {string} data.rolls optional
   * @param {string|integer} data.difficulty optional
   * @param {integer} data.poolModifier optional
   * @param {string} data.icon optional
   * @param {string|boolean} data.blind optional
   * @param {string|boolean} data.combat optional
   * @param {string|boolean} data.pushing optional
   * @param {string} data.label optional
   * @returns {Cd100Link}
   */
  static async fromDropData (data) {
    const cls = new Cd100Link()
    cls.#check = data.check
    cls.#subtype = data.subtype
    cls.#name = data.name
    cls.#sanMax = data.sanMax
    cls.#sanMin = data.sanMin
    cls.#sanReason = data.sanReason
    if (typeof data.object === 'string') {
      cls.#object = JSON.parse(data.object)
    } else {
      cls.#object = data.object
    }
    cls.#rolls = data.rolls
    if (typeof data.difficulty !== 'undefined') {
      cls.#difficulty = data.difficulty
      cls.#hasDifficulty = true
    }
    if (typeof data.poolModifier !== 'undefined') {
      cls.#poolModifier = data.poolModifier
      cls.#hasPoolModifier = true
    }
    if (typeof data.icon !== 'undefined') {
      cls.#icon = data.icon
      cls.#hasIcon = true
    }
    if (data.blind === true || data.blind === 'true') {
      cls.#blind = true
      cls.#hasBlind = true
    }
    if (data.combat === true || data.combat === 'true') {
      cls.#combat = true
      cls.#hasCombat = true
    }
    if (data.pushing === true || data.pushing === 'true') {
      cls.#pushing = true
      cls.#hasPushing = true
    }
    if (typeof data.label !== 'undefined' && data.label.toString().length) {
      cls.#label = data.label
      cls.#hasLabel = true
    }
    return cls
  }

  /**
   * Create link
   * @param {RegExpMatchArray} match
   * @param {object} options
   * @param {boolean?} options.custom
   * @param {boolean?} options.documents
   * @param {boolean?} options.embeds
   * @param {boolean?} options.links
   * @param {any?} options.relativeTo
   * @param {object|Function} options.rollData
   * @param {boolean?} options.rolls
   * @param {boolean?} options.secrets
   * @returns {Promise<HTMLElement | null>}
   */
  static async _createLink (match, options) {
    const data = {
      cls: ['coc7-link'],
      dataset: {
        type: 'Cd100Link',
        check: match[2]
      }
    }
    const object = match[3]
    let name = match[4]
    let icon = 'fa-solid fa-dice'
    let img = ''

    if (data.dataset.check === Cd100Link.CHECK_TYPE.EFFECT) {
      const effect = JSON.parse(object)
      // Change old keys
      if (typeof effect.label !== 'undefined') {
        if (typeof effect.name === 'undefined') {
          deprecated.warningLogger({
            was: '@cd100.effect[label:]',
            now: '@cd100.effect[name:]',
            until: 15
          })
          effect.name = effect.label
          delete effect.label
        }
      }
      if (typeof effect.icon !== 'undefined') {
        if (typeof effect.img === 'undefined') {
          deprecated.warningLogger({
            was: '@cd100.effect[icon:]',
            now: '@cd100.effect[img:]',
            until: 15
          })
          effect.img = effect.icon
          delete effect.icon
        }
      }
      data.dataset.object = JSON.stringify(effect)
      if (typeof effect.external !== 'undefined' && ['http', 'https'].includes(effect.external)) {
        img = effect.external + '://' + effect.img
      }
      data.dataset.tooltip = game.i18n.localize('DOCUMENT.ActiveEffect')
    } else {
      const matches = object.matchAll(/[^,]+/gi)
      for (const match of Array.from(matches)) {
        let [key, value] = match[0].split(':')
        // Change old keys
        switch (key) {
          case 'modifier':
            deprecated.warningLogger({
              was: '@cd100.check[modifier:]',
              now: '@cd100.effect[poolModifier:]',
              until: 15
            })
            key = 'poolModifier'
            break
          case 'type':
            deprecated.warningLogger({
              was: '@cd100.check[type:]',
              now: '@cd100.effect[subtype:]',
              until: 15
            })
            key = 'subtype'
            break
        }
        if (key === 'icon') {
          icon = value
        }
        if (typeof value === 'undefined') {
          if (key === 'blind') {
            if ([Cd100Link.CHECK_TYPE.CHECK, Cd100Link.CHECK_TYPE.SANLOSS, Cd100Link.CHECK_TYPE.ITEM].includes(data.dataset.check.toLowerCase())) {
              value = true
            } else {
              continue
            }
          } else if (['combat', 'pushing'].includes(key)) {
            if ([Cd100Link.CHECK_TYPE.CHECK].includes(data.dataset.check.toLowerCase())) {
              value = true
            } else {
              continue
            }
          }
        }
        data.dataset[key] = value
      }
      const difficulty = Cd100DicePool.difficultyString(data.dataset.difficulty)
      switch (data.dataset.check.toLowerCase()) {
        case Cd100Link.CHECK_TYPE.CHECK:
          {
            let humanName = name
            if (['attributes', 'attribute', 'attrib', 'attribs'].includes(data.dataset.subtype?.toLowerCase())) {
              if (['lck', 'san'].includes(data.dataset.name)) {
                humanName = Cd100Utilities.getAttributeNames(data.dataset.name)?.label
              }
            } else if (['charac', 'char', 'characteristic', 'characteristics'].includes(data.dataset.subtype?.toLowerCase())) {
              humanName = Cd100Utilities.getCharacteristicNames(data.dataset.name)?.label
            } else if (['skill'].includes(data.dataset.subtype?.toLowerCase())) {
              humanName = data.dataset.name
              if (data.dataset.name.match(/^.\.[^\\.]*\..+$/)) {
                const cocIdName = (await game.Cd100.cocid.fromCoCID(data.dataset.name))?.[0]?.name
                if (cocIdName) {
                  humanName = cocIdName
                }
              }
            } else if (['combinedall', 'combinedany', 'opposed'].includes(data.dataset.subtype?.toLowerCase())) {
              humanName = '?'
            }
            data.dataset.tooltip = game.i18n.format(
              `Cd100.LinkCheck${!data.dataset.difficulty ? '' : 'Diff'}${!data.dataset.poolModifier ? '' : 'Modif'}${!data.dataset.pushing ? '' : 'Pushing'}`,
              {
                difficulty,
                modifier: data.dataset.poolModifier,
                name: humanName
              }
            )
          }
          break
        case Cd100Link.CHECK_TYPE.SANLOSS:
          data.dataset.tooltip = game.i18n.format(
            `Cd100.LinkSanLoss${!data.dataset.difficulty ? '' : 'Diff'}${!data.dataset.poolModifier ? '' : 'Modif'}`,
            {
              difficulty,
              modifier: data.dataset.poolModifier,
              sanMin: data.dataset.sanMin,
              sanMax: data.dataset.sanMax
            }
          )
          break
        case Cd100Link.CHECK_TYPE.ITEM:
          {
            let humanName = data.dataset.name
            if (humanName.match(/^.\.[^\\.]*\..+$/)) {
              const cocIdName = (await game.Cd100.cocid.fromCoCID(humanName))?.[0]?.name
              if (cocIdName) {
                humanName = cocIdName
              }
            }
            data.dataset.tooltip = game.i18n.format(
              `Cd100.LinkItem${!data.dataset.difficulty ? '' : 'Diff'}${!data.dataset.poolModifier ? '' : 'Modif'}`,
              {
                difficulty,
                modifier: data.dataset.poolModifier,
                name: humanName
              }
            )
          }
          break
      }
    }
    const a = document.createElement('a')
    a.classList.add(data.cls)
    for (const [k, v] of Object.entries(data.dataset)) {
      a.dataset[k] = v
    }
    a.draggable = true
    if (data.dataset.blind === true) {
      a.innerHTML += '<i class="fa-solid fa-eye-slash"></i>'
    }
    if (img) {
      a.innerHTML += `<img src="${img}">`
    } else {
      a.innerHTML += `<i class="${icon}"></i>`
    }
    if (!name && data.dataset.tooltip) {
      name = data.dataset.tooltip
    }
    a.innerHTML += `<span>${name}</span>`
    return a
  }

  /**
   * Given a Drop event, returns a Content link if possible such as "@Actor[ABC123]", else `null`
   * @param {object} eventData
   * @param {object} options
   * @param {ClientDocument} options.relativeTo
   * @param {string} options.label
   * @returns {string}
   */
  _createDocumentLink (eventData, { relativeTo, label } = {}) {
    const options = []
    let toggles = false
    switch (this.#check?.toLowerCase()) {
      case Cd100Link.CHECK_TYPE.CHECK:
        // @cd100.check[subtype:charac,name:STR,difficulty:+,modifier:-1]{Hard STR check(-1)}
        // @cd100.check[blind,subtype:characteristic,name:str,difficulty:1,modifier:0,icon:fa fa-link]{Strength}
        // @cd100.check[blind,subtype:attribute,name:lck,difficulty:1,modifier:0,icon:fa fa-link]{Luck}
        // @cd100.check[blind,subtype:skill,name:Law,difficulty:1,modifier:0,icon:fa fa-link]{Law}
        options.push('subtype:' + this.#subtype)
        if (this.#name) {
          options.push('name:' + this.#name)
        }
        if (this.#rolls) {
          options.push('rolls:' + this.#rolls)
        }
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.SANLOSS:
        // @cd100.sanloss[sanMax:1D6,sanMin:1,difficulty:++,modifier:-1]{Hard San Loss (-1) 1/1D6}
        options.push('sanMin:' + this.#sanMin)
        options.push('sanMax:' + this.#sanMax)
        if (this.#sanReason) {
          options.push('sanReason:' + this.#sanReason)
        }
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.ITEM:
        // @cd100.item[type:optional,name:Shotgun,difficulty:+,modifier:-1]{Hard Shotgun check(-1)}
        if (this.#name) {
          options.push('name:' + this.#name)
        }
        toggles = true
        break
      case Cd100Link.CHECK_TYPE.EFFECT:
        {
          // @cd100.effect[{"name":"Test","img":"icons/svg/aura.svg","changes":[{"key":"system.unknown.test","mode":2,"value":"5"}],"tint":"#e91616","duration":{"seconds":null,"rounds":6,"turns":null}}]{Testing}
          const json = foundry.utils.duplicate(this.#object)
          const parts = json.img.match(/^(https?):\/\/(.+)$/)
          if (parts) {
            json.external = parts[1]
            json.img = parts[2]
          }
          json.description = json.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          options.push(JSON.stringify(json))
        }
        break
    }
    if (options.length === 0) {
      return '?'
    }
    if (toggles) {
      if (this.#hasBlind) {
        options.push(this.#blind ? 'blind' : '')
      }
      if (this.#hasCombat) {
        options.push(this.#combat ? 'combat' : '')
      }
      if (this.#hasDifficulty) {
        options.push('difficulty:' + this.#difficulty)
      }
      if (this.#hasPoolModifier) {
        options.push('poolModifier:' + this.#poolModifier)
      }
      if (this.#hasIcon) {
        options.push('icon:' + this.#icon)
      }
      if (this.#hasPushing) {
        options.push(this.#pushing ? 'pushing' : '')
      }
    }
    const link = '@cd100.' + this.#check?.toLowerCase() + '[' + options.join(',') + ']' + (this.#hasLabel ? '{' + this.#label + '}' : '')
    return link
  }

  /**
   * Process Actor Link
   * @param {Document|null} actor
   * @param {object} options
   * @param {boolean} shiftKey
   */
  static async _onLinkActorClick (actor, options, { shiftKey = false } = {}) {
    if (!actor && !['combinedall', 'combinedany', 'combined', 'opposed'].includes(options.subtype.toLowerCase())) {
      return
    } else if (actor && actor.actor) {
      actor = actor.actor
    }
    switch (options.check) {
      case Cd100Link.CHECK_TYPE.CHECK:
        switch (options.subtype.toLowerCase()) {
          case 'charac':
          case 'char':
          case 'characteristic':
          case 'characteristics':
            actor.characteristicCheck(options.name, shiftKey, options)
            break
          case 'skill':
            actor.skillCheck(options.name, shiftKey, options)
            break
          case 'attributes':
          case 'attribute':
          case 'attrib':
          case 'attribs':
            actor.attributeCheck(options.name, shiftKey, options)
            break
          case 'combinedall':
          case 'combinedany':
          case 'combined':
            Cd100ChatCombinedMessage.createGroupMessage({
              defaultActor: actor.uuid ?? null,
              isCombat: Boolean(options.combat ?? false),
              rollRequisites: options.rolls.split('&&'),
              type: options.subtype.toLowerCase()
            })
            break
          case 'opposed':
            Cd100ChatOpposedMessage.createGroupMessage({
              defaultActor: actor.uuid ?? null,
              isCombat: Boolean(options.combat ?? false),
              rollRequisites: options.rolls.split('&&')
            })
            break
        }
        break
      case Cd100Link.CHECK_TYPE.SANLOSS:
        Cd100SanCheckCard.create(Cd100Utilities.getActorUuid(actor), {
          sanMax: options.sanMax,
          sanMin: options.sanMin,
          sanReason: options.sanReason,
          difficulty: options.difficulty,
          poolModifier: options.poolModifier
        })
        break
      case Cd100Link.CHECK_TYPE.ITEM:
        await actor.weaponCheck(options, shiftKey)
        break
      case Cd100Link.CHECK_TYPE.EFFECT:
        await actor.createEmbeddedDocuments('ActiveEffect', [
          JSON.parse(options.object)
        ])
        break
    }
  }

  /**
   * Send current link to chat
   */
  toChatMessage () {
    let content
    const link = this._createDocumentLink(null)
    if (this.#check === Cd100Link.CHECK_TYPE.EFFECT) {
      content = `<div class="effect-message">${link}</div>`
    } else {
      content = game.i18n.format('Cd100.MessageCheckRequestedWait', {
        check: link
      })
    }
    const messageData = {
      speaker: {
        alias: game.user.name
      },
      content
    }
    ChatMessage.create(messageData)
  }

  /**
   * Send whisper for each actor to each user that has owner permissions
   * @param {Array} actors
   */
  toWhisperMessage (actors) {
    const messagesData = []
    for (const actor of actors) {
      let content
      const link = this._createDocumentLink(null)
      if (this.#check === Cd100Link.CHECK_TYPE.EFFECT) {
        content = `<div class="effect-message">${link}</div>`
      } else {
        content = game.i18n.format('Cd100.MessageTargetCheckRequested', {
          name: actor.name,
          check: link
        })
      }
      messagesData.push({
        speaker: {
          alias: game.user.name
        },
        whisper: actor.owners.map(a => a.id),
        content
      })
    }
    ChatMessage.create(messagesData)
  }

  /**
   * Make Macro from object
   * @param {object} data
   * @returns {string|object}
   */
  static async makeMacroData (data) {
    const linkObj = await Cd100Link.fromDropData(data)
    return {
      name: linkObj.#label,
      type: 'script',
      command: 'game.Cd100.macros.linkMacro(' + JSON.stringify(data) + ')'
    }
  }

  /**
   * Make Macro from object
   * @param {object} data
   */
  static async linkMacro (data) {
    const linkObj = await Cd100Link.fromDropData(data)
    /* // FoundryVTT V12 */
    ;(foundry.applications.ux?.TextEditor.implementation ?? TextEditor).enrichHTML(
      linkObj._createDocumentLink(),
      {
        async: true,
        secrets: false
      }
    ).then(string => {
      const element = document.createElement('div')
      element.innerHTML = string
      Cd100Link._onLinkClick({
        target: element.querySelector('a')
      })
    })
  }

  /**
   * Trigger a check when a link is clicked.
   * @param {ClickEvent} event
   */
  static async _onLinkClick (event) {
    const options = Cd100Link._linkDataFromEvent(event)

    if (game.user.isGM) {
      if (Cd100Utilities.isCtrlKey(event)) {
        Cd100ContentLinkDialog.create(options)
        return
      }
      if (canvas.tokens.controlled.length) {
        for (const token of canvas.tokens.controlled) {
          Cd100Link._onLinkActorClick(token.actor, options, { shiftKey: event.shiftKey })
        }
        return
      }
      const speaker = ChatMessage.getSpeaker()
      const actor = ChatMessage.getSpeakerActor(speaker)
      if (actor) {
        Cd100Link._onLinkActorClick(actor, options, { shiftKey: event.shiftKey })
        return
      }
      const link = await Cd100Link.fromDropData(options)
      link.toChatMessage()
    } else {
      const actorUuid = await Cd100ActorPickerDialog.create()
      if (actorUuid) {
        const actor = await fromUuid(actorUuid)
        if (actor) {
          Cd100Link._onLinkActorClick(actor, options, { shiftKey: event.shiftKey })
        }
      }
    }
  }
}
