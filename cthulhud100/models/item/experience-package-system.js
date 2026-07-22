/* global foundry */
import Cd100ModelsItemGlobalSystem from './global-system.js'
import Cd100Utilities from '../../apps/utilities.js'

export default class Cd100ModelsItemExperiencePackageSystem extends Cd100ModelsItemGlobalSystem {
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
      age: new fields.StringField({ initial: '' }),
      properties: new fields.SchemaField({
        cthulhuGain: new fields.BooleanField({ label: 'Cd100.MythosGain', initial: false }),
        sanityLoss: new fields.BooleanField({ label: 'Cd100.SANLoss', initial: false }),
        sanitySame: new fields.BooleanField({ label: 'Cd100.SANSameLossAsMythosGain', initial: false })
      }),
      cthulhuGain: new fields.StringField({ initial: '' }),
      sanityLoss: new fields.StringField({ initial: '' }),
      backgroundQty: new fields.NumberField({ nullable: false, initial: 1 }),
      backgroundInjury: new fields.BooleanField({ initial: false }),
      backgroundStatus: new fields.BooleanField({ initial: false }),
      backgroundEncounter: new fields.BooleanField({ initial: false }),
      immunity: new fields.ArrayField(
        new fields.StringField({ initial: '' })
      ),
      addSpells: new fields.BooleanField({ initial: false }),
      points: new fields.NumberField({ nullable: false, initial: 0 }),
      itemDocuments: new fields.ArrayField(
        new fields.JSONField({ })
      ),
      itemKeys: new fields.ArrayField(
        new fields.StringField({ initial: '' })
      ),
      groups: new fields.ArrayField(
        new fields.SchemaField({
          options: new fields.NumberField({ nullable: false, initial: 1 }),
          itemDocuments: new fields.ArrayField(
            new fields.JSONField({ })
          ),
          itemKeys: new fields.ArrayField(
            new fields.StringField({ initial: '' })
          )
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
    // Old system.items array could contain mix of CoC IDs and Documents split into StringField and JSONField arrays
    if (typeof source.skills !== 'undefined' && typeof source.itemDocuments === 'undefined' && typeof source.itemKeys === 'undefined') {
      source.itemDocuments = source.skills.filter(x => typeof x !== 'string')
      source.itemKeys = source.skills.filter(x => typeof x === 'string')
    }
    // Old system.groups.{?}.skills array could contain mix of CoC IDs and Documents split into StringField and JSONField arrays
    if (typeof source.groups !== 'undefined') {
      for (const index in source.groups) {
        if (typeof source.groups[index].skills !== 'undefined' && typeof source.groups[index].itemDocuments === 'undefined' && typeof source.groups[index].itemKeys === 'undefined') {
          source.groups[index].itemDocuments = source.groups[index].skills.filter(x => typeof x !== 'string')
          source.groups[index].itemKeys = source.groups[index].skills.filter(x => typeof x === 'string')
        }
      }
    }
    return super.migrateData(source)
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
    if (property === 'properties' && key === 'sanitySame') {
      if (changes['system.' + property + '.' + key]) {
        changes['system.' + property + '.cthulhuGain'] = true
        changes['system.' + property + '.sanityLoss'] = false
      }
    } else if (property === 'properties' && key === 'sanityLoss') {
      if (changes['system.' + property + '.' + key]) {
        changes['system.' + property + '.sanitySame'] = false
      }
    } else if (property === 'properties' && key === 'cthulhuGain') {
      if (!changes['system.' + property + '.' + key]) {
        changes['system.' + property + '.sanitySame'] = false
      }
    }
    return changes
  }

  /**
   * Get JSON version of all skill groups
   * @returns {Array}
   */
  async skillGroups () {
    return Cd100Utilities.getEmbeddedGroupedSkills(this.parent)
  }

  /**
   * Get JSON version of all skills
   * @returns {Array}
   */
  async items () {
    return Cd100Utilities.getEmbeddedItems(this.parent, 'system')
  }
}
