/* global CONFIG foundry fromUuid game */
import ChaosiumCanvasInterface from './chaosium-canvas-interface.js'

export default class ChaosiumCanvasInterfacePlayer extends ChaosiumCanvasInterface {
  /**
   * Icon to show for behavior
   * @returns {string}
   */
  static get icon () {
    return 'fa-solid fa-user-large'
  }

  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchema () {
    const fields = foundry.data.fields
    return {
      triggerButton: new fields.NumberField({
        choices: ChaosiumCanvasInterface.triggerButtons,
        initial: ChaosiumCanvasInterface.triggerButton.Right,
        label: 'Cd100.ChaosiumCanvasInterface.Player.Button.Title',
        hint: 'Cd100.ChaosiumCanvasInterface.Player.Button.Hint'
      }),
      imageTiles: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Tile'
        }),
        {
          label: 'Cd100.ChaosiumCanvasInterface.Player.ImageDrop.Title',
          hint: 'Cd100.ChaosiumCanvasInterface.Player.ImageDrop.Hint'
        }
      ),
      imagePlaceholder: new fields.FilePathField({
        categories: ['IMAGE', 'VIDEO'],
        blank: true,
        initial: '',
        label: 'Cd100.ChaosiumCanvasInterface.Player.ImagePlaceholder.Title',
        hint: 'Cd100.ChaosiumCanvasInterface.Player.ImagePlaceholder.Hint'
      }),
      nameDrawings: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Drawing'
        }),
        {
          label: 'Cd100.ChaosiumCanvasInterface.Player.NameDrop.Title',
          hint: 'Cd100.ChaosiumCanvasInterface.Player.NameDrop.Hint'
        }
      ),
      namePlaceholder: new fields.StringField({
        label: 'Cd100.ChaosiumCanvasInterface.Player.NamePlaceholder.Title',
        hint: 'Cd100.ChaosiumCanvasInterface.Player.NamePlaceholder.Hint'
      }),
      occupationDrawings: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Drawing'
        }),
        {
          label: 'Cd100.ChaosiumCanvasInterface.Player.OccupationDrop.Title',
          hint: 'Cd100.ChaosiumCanvasInterface.Player.OccupationDrop.Hint'
        }
      ),
      occupationPlaceholder: new fields.StringField({
        label: 'Cd100.ChaosiumCanvasInterface.Player.OccupationPlaceholder.Title',
        hint: 'Cd100.ChaosiumCanvasInterface.Player.OccupationPlaceholder.Hint'
      }),
      otherRegions: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Region'
        }),
        {
          label: 'Cd100.ChaosiumCanvasInterface.Player.OtherRegions.Title',
          hint: 'Cd100.ChaosiumCanvasInterface.Player.OtherRegions.Hint'
        }
      )
    }
  }

  /**
   * Check permissions
   * @returns {boolean}
   */
  async _handleMouseOverEvent () {
    return game.user.isGM
  }

  /**
   * Handle click event
   */
  async #handleClickEvent () {
    await ChaosiumCanvasInterfacePlayer.setupPlayer(this.parent, { img: false, name: false, occupation: false, uuid: false })
  }

  /**
   * Left click event
   */
  async _handleLeftClickEvent () {
    if (this.triggerButton === ChaosiumCanvasInterface.triggerButton.Left) {
      this.#handleClickEvent()
    }
  }

  /**
   * Right click event
   */
  async _handleRightClickEvent () {
    if (this.triggerButton === ChaosiumCanvasInterface.triggerButton.Right) {
      this.#handleClickEvent()
    }
  }

  /**
   * Setup or clear the player
   * @param {RegionBehavior} behavior
   * @param {object} options
   * @param {string|false} options.img
   * @param {string|false} options.name
   * @param {string|false} options.occupation
   * @param {string|false} options.uuid
   */
  static async setupPlayer (behavior, { img = false, name = false, occupation = false, uuid = false }={}) {
    const scenes = {}
    const behaviors = [behavior]
    for (const regionUuid of behavior.system.otherRegions) {
      const region = await fromUuid(regionUuid)
      if (region) {
        behaviors.push(...region.behaviors.filter(doc => doc.type === 'ChaosiumCanvasInterfacePlayer'))
      }
    }
    for (const behavior of behaviors) {
      for (const uuid of behavior.system.imageTiles) {
        const parts = foundry.utils.parseUuid(uuid)
        if (parts.primaryType === 'Scene') {
          if (typeof scenes[parts.primaryId]?.[parts.type] === 'undefined') {
            foundry.utils.setProperty(scenes, parts.primaryId + '.' + parts.type, [])
          }
          scenes[parts.primaryId][parts.type].push({
            _id: parts.id,
            'texture.src': (img === false ? behavior.system.imagePlaceholder : img)
          })
        }
      }
      for (const uuid of behavior.system.nameDrawings) {
        const parts = foundry.utils.parseUuid(uuid)
        if (parts.primaryType === 'Scene') {
          if (typeof scenes[parts.primaryId]?.[parts.type] === 'undefined') {
            foundry.utils.setProperty(scenes, parts.primaryId + '.' + parts.type, [])
          }
          scenes[parts.primaryId][parts.type].push({
            _id: parts.id,
            'text': (name === false ? behavior.system.namePlaceholder : name)
          })
        }
      }
      for (const uuid of behavior.system.occupationDrawings) {
        const parts = foundry.utils.parseUuid(uuid)
        if (parts.primaryType === 'Scene') {
          if (typeof scenes[parts.primaryId]?.[parts.type] === 'undefined') {
            foundry.utils.setProperty(scenes, parts.primaryId + '.' + parts.type, [])
          }
          scenes[parts.primaryId][parts.type].push({
            _id: parts.id,
            'text': (occupation === false ? behavior.system.occupationPlaceholder : occupation)
          })
        }
      }
    }
    for (const sceneId in scenes) {
      for (const type in scenes[sceneId]) {
        const options = {
          parent: game.scenes.get(sceneId)
        }
        await CONFIG[type].documentClass.updateDocuments(scenes[sceneId][type], options)
      }
    }
    for (const behavior of behaviors) {
      if (uuid === false) {
        const openDocument = behavior.parent.behaviors.find(doc => doc.type === 'ChaosiumCanvasInterfaceOpenDocument')
        if (openDocument) {
          await openDocument.delete()
        }
      } else {
        const behaviors = foundry.utils.duplicate(behavior.parent.behaviors)
        const index = behaviors.findIndex(doc => doc.type === 'ChaosiumCanvasInterfaceOpenDocument')
        if (index === -1) {
          behaviors.push({
            name: game.i18n.localize('TYPES.RegionBehavior.ChaosiumCanvasInterfaceOpenDocument'),
            type: 'ChaosiumCanvasInterfaceOpenDocument',
            system: {
              documentUuid: uuid,
              permission: 'DOCUMENT'
            }
          })
        } else {
          behaviors[index].system.documentUuid = uuid
        }
        await behavior.parent.update({ behaviors })
      }
    }
  }

  /**
   * Handle drop event
   * @param {Document} actor
   * @param {RegionBehavior} behavior
   */
  static async dropEvent (actor, behavior) {
    await ChaosiumCanvasInterfacePlayer.setupPlayer(behavior, { img: actor.img, name: actor.name, occupation: (actor.occupation ? actor.occupation.name : actor.system.infos.occupation), uuid: actor.uuid })
  }
}
