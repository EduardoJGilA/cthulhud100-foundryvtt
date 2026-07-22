/* global foundry game */
import { ERAS } from '../../constants.js'
import Cd100ModelsItemGlobalSystem from './global-system.js'

export default class Cd100ModelsItemItemSystem extends Cd100ModelsItemGlobalSystem {
  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchema () {
    const fields = foundry.data.fields
    return {
      description: new fields.SchemaField({
        value: new fields.HTMLField({ initial: '' }),
        keeper: new fields.HTMLField({ initial: '' })
      }),
      quantity: new fields.NumberField({ nullable: false, initial: 1 }),
      weight: new fields.NumberField({ nullable: false, initial: 0 }),
      /* // FoundryVTT V13 - not required
      attributes: {},
      */
      /* // FoundryVTT V12 */
      price: (foundry.utils.isNewerVersion(game.version, 13)
        ? new fields.TypedObjectField(
          new fields.StringField({ nullable: true, initial: null }),
          {
            validateKey: (key) => typeof ERAS[key] !== 'undefined'
          }
        )
        : new fields.ObjectField())
    }
  }

  /**
   * Create empty object for this item type
   * @param {object} options
   * @returns {object}
   */
  static emptyObject (options) {
    const object = foundry.utils.mergeObject({
      name: game.i18n.localize('Cd100.NewItemName'),
      type: 'item',
      system: new Cd100ModelsItemItemSystem().toObject()
    }, options)
    return object
  }

  /**
   * Migrate old style data to new
   * @param {object} source
   * @returns {object}
   */
  static migrateData (source) {
    // Migrate description to object
    if (typeof source.description === 'string') {
      foundry.utils.setProperty(source, 'description', { value: source.description })
    }
    return super.migrateData(source)
  }
}
