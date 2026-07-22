/* global foundry */
import { MONETARY_FORMAT_KEYS, MONETARY_TYPE_KEYS } from '../../constants.js'
import Cd100ModelsItemGlobalSystem from './global-system.js'
import Cd100Utilities from '../../apps/utilities.js'

export default class Cd100ModelsItemSetupSystem extends Cd100ModelsItemGlobalSystem {
  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchema () {
    const fields = foundry.data.fields
    const monetaryTypes = Object.keys(MONETARY_TYPE_KEYS)
    return {
      description: new fields.SchemaField({
        value: new fields.HTMLField({ initial: '' }),
        keeper: new fields.HTMLField({ initial: '' })
      }),
      characteristics: new fields.SchemaField({
        points: new fields.SchemaField({
          enabled: new fields.BooleanField({ initial: false }),
          value: new fields.NumberField({ nullable: false, initial: 460 })
        }),
        rolls: new fields.SchemaField({
          enabled: new fields.BooleanField({ initial: true }),
          /* // FoundryVTT V13 - not required
          enableIndividualRolls: true,
          */
          // Cthulhu d100 keeps characteristics on the classic 3-18 scale rather
          // than as percentiles, so the rolls are not multiplied by five.
          // A check is rolled against the value times five (see CHARACTERISTIC_MULTIPLIER).
          str: new fields.StringField({ nullable: false, initial: '3D6' }),
          con: new fields.StringField({ nullable: false, initial: '3D6' }),
          siz: new fields.StringField({ nullable: false, initial: '2D6+6' }),
          dex: new fields.StringField({ nullable: false, initial: '3D6' }),
          app: new fields.StringField({ nullable: false, initial: '3D6' }),
          int: new fields.StringField({ nullable: false, initial: '2D6+6' }),
          pow: new fields.StringField({ nullable: false, initial: '3D6' }),
          // EST (Estudios) is 3D6+3 in this system, not 2D6+6
          edu: new fields.StringField({ nullable: false, initial: '3D6+3' }),
          // Suerte is derived from POD, not rolled; kept for the setup UI only
          luck: new fields.StringField({ nullable: false, initial: '3D6' })
        })
        /* // FoundryVTT V13 - not required
        values: new fields.SchemaField({
          str: null,
          con: null,
          siz: null,
          dex: null,
          app: null,
          int: null,
          pow: null,
          edu: null,
          luck: null
        })
        */
      }),
      monetary: new fields.SchemaField({
        format: new fields.StringField({
          choices: Object.keys(MONETARY_FORMAT_KEYS),
          initial: MONETARY_FORMAT_KEYS.decimalLeft
        }),
        symbol: new fields.StringField({ initial: '$' }),
        values: new fields.ArrayField(
          new fields.SchemaField({
            name: new fields.StringField({ }),
            min: new fields.NumberField({ nullable: true }),
            max: new fields.NumberField({ nullable: true }),
            cashType: new fields.StringField({ choices: monetaryTypes, initial: monetaryTypes[0] }),
            cashValue: new fields.NumberField({ nullable: false }),
            assetsType: new fields.StringField({ choices: monetaryTypes, initial: monetaryTypes[0] }),
            assetsValue: new fields.NumberField({ nullable: false }),
            spendingType: new fields.StringField({ choices: monetaryTypes, initial: monetaryTypes[0] }),
            spendingValue: new fields.NumberField({ nullable: false })
          }),
          {
            initial: [
              {
                name: 'Cd100.MonetaryDefaultPenniless',
                min: null,
                max: 0,
                cashType: MONETARY_TYPE_KEYS.value,
                cashValue: 0.5,
                assetsType: MONETARY_TYPE_KEYS.value,
                assetsValue: 0,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 0.5
              },
              {
                name: 'Cd100.MonetaryDefaultPoor',
                min: 1,
                max: 9,
                cashType: MONETARY_TYPE_KEYS.multiplier,
                cashValue: 1,
                assetsType: MONETARY_TYPE_KEYS.multiplier,
                assetsValue: 10,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 2
              },
              {
                name: 'Cd100.MonetaryDefaultAverage',
                min: 10,
                max: 49,
                cashType: MONETARY_TYPE_KEYS.multiplier,
                cashValue: 2,
                assetsType: MONETARY_TYPE_KEYS.multiplier,
                assetsValue: 50,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 10
              },
              {
                name: 'Cd100.MonetaryDefaultWealthy',
                min: 50,
                max: 89,
                cashType: MONETARY_TYPE_KEYS.multiplier,
                cashValue: 5,
                assetsType: MONETARY_TYPE_KEYS.multiplier,
                assetsValue: 500,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 50
              },
              {
                name: 'Cd100.MonetaryDefaultRich',
                min: 90,
                max: 98,
                cashType: MONETARY_TYPE_KEYS.multiplier,
                cashValue: 20,
                assetsType: MONETARY_TYPE_KEYS.multiplier,
                assetsValue: 2000,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 250
              },
              {
                name: 'Cd100.MonetaryDefaultSuperRich',
                min: 99,
                max: null,
                cashType: MONETARY_TYPE_KEYS.value,
                cashValue: 50000,
                assetsType: MONETARY_TYPE_KEYS.value,
                assetsValue: 5000000,
                spendingType: MONETARY_TYPE_KEYS.value,
                spendingValue: 5000
              }
            ]
          }
        )
      }),
      source: new fields.StringField({ initial: '' }),
      enableCharacterisitics: new fields.BooleanField({ initial: true }),
      /* // FoundryVTT V13 - not required
      attributes: {},
      properties: {},
      flags: {},
      */
      itemDocuments: new fields.ArrayField(
        new fields.JSONField({ })
      ),
      itemKeys: new fields.ArrayField(
        new fields.StringField({ initial: '' })
      ),
      bioSections: new fields.ArrayField(
        new fields.StringField({ initial: '' })
      ),
      backstory: new fields.HTMLField({ initial: '' })
    }
  }

  /**
   * Migrate old style data to new
   * @param {object} source
   * @returns {object}
   */
  static migrateData (source) {
    // Old system.items array could contain mix of CoC IDs and Documents split into StringField and JSONField arrays
    if (typeof source.items !== 'undefined' && typeof source.itemDocuments === 'undefined' && typeof source.itemKeys === 'undefined') {
      source.itemDocuments = source.items.filter(x => typeof x !== 'string')
      source.itemKeys = source.items.filter(x => typeof x === 'string')
    }
    // Migrate description to object
    if (typeof source.description === 'string') {
      foundry.utils.setProperty(source, 'description', { value: source.description })
    }
    return super.migrateData(source)
  }

  /**
   * Get JSON version of all items
   * @returns {Array}
   */
  async items () {
    return Cd100Utilities.getEmbeddedItems(this.parent, 'system')
  }

  /**
   * Create update object
   * @param {string} property
   * @param {string} key
   * @param {object} options
   * @param {boolean} options.isCtrlKey
   * @returns {object}
   */
  async prepareToggleUpdate (property, key, { isCtrlKey = false } = {}) {
    const changes = await super.prepareToggleUpdate(property, key, { isCtrlKey })
    if (typeof changes['system.characteristics.points.enabled'] !== 'undefined') {
      changes['system.characteristics.rolls.enabled'] = !changes['system.characteristics.points.enabled']
    } else if (typeof changes['system.characteristics.rolls.enabled'] !== 'undefined') {
      changes['system.characteristics.points.enabled'] = !changes['system.characteristics.rolls.enabled']
    }
    return changes
  }
}
