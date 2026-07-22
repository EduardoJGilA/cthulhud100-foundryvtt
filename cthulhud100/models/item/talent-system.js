/* global foundry */
import { TALENT_ADJUSTMENT_TYPES } from '../../constants.js'
import Cd100ModelsItemGlobalSystem from './global-system.js'

export default class Cd100ModelsItemTalentSystem extends Cd100ModelsItemGlobalSystem {
  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchema () {
    const fields = foundry.data.fields
    return {
      source: new fields.StringField({ initial: '' }),
      description: new fields.SchemaField({
        value: new fields.HTMLField({ initial: '' }),
        /* // FoundryVTT V13 - not required
        chat: '',
        */
        notes: new fields.HTMLField({ initial: '' }),
        keeper: new fields.HTMLField({ initial: '' })
      }),
      type: new fields.SchemaField({
        physical: new fields.BooleanField({ label: 'Cd100.PhysicalTalent', initial: false }),
        mental: new fields.BooleanField({ label: 'Cd100.MentalTalent', initial: false }),
        combat: new fields.BooleanField({ label: 'Cd100.CombatTalent', initial: false }),
        miscellaneous: new fields.BooleanField({ label: 'Cd100.MiscellaneousTalent', initial: false }),
        basic: new fields.BooleanField({ label: 'Cd100.BasicTalent', initial: false }),
        insane: new fields.BooleanField({ label: 'Cd100.InsaneTalent', initial: false }),
        other: new fields.BooleanField({ label: 'Cd100.OtherTalent', initial: false })
      }),
      adjustments: new fields.ArrayField(
        new fields.SchemaField({
          type: new fields.StringField({ choices: TALENT_ADJUSTMENT_TYPES, initial: 'disableCombatPool' }),
          config: new fields.JSONField({ })
        })
      )
    }
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
