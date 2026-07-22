/* global foundry game */
import Cd100ModelsItemGlobalSystem from './global-system.js'
import Cd100Utilities from '../../apps/utilities.js'

export default class Cd100ModelsItemOccupationSystem extends Cd100ModelsItemGlobalSystem {
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
      source: new fields.StringField({ initial: '' }),
      type: new fields.SchemaField({
        classic: new fields.BooleanField({ label: 'Cd100.Classic', initial: false }),
        lovecraftian: new fields.BooleanField({ label: 'Cd100.Lovecraftian', initial: false }),
        modern: new fields.BooleanField({ label: 'Cd100.Modern', initial: false }),
        pulp: new fields.BooleanField({ label: 'Cd100.Pulp', initial: false })
      }),
      /* // FoundryVTT V13 - not required
      related: null,
      suggestedContacts: '',
      attributes: {},
      properties: {},
      flags: {},
      */
      occupationSkillPoints: new fields.SchemaField({
        str: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Strength'
        }),
        con: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Constitution'
        }),
        siz: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Size'
        }),
        dex: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Dexterity'
        }),
        app: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Appearance'
        }),
        int: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Intelligence'
        }),
        pow: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Power'
        }),
        edu: new fields.SchemaField({
          multiplier: new fields.NumberField({ nullable: true, initial: null }),
          selected: new fields.BooleanField({ initial: false }),
          /* // FoundryVTT V13 - not required
          active: false,
          */
          optional: new fields.BooleanField({ initial: false })
        }, {
          label: 'CHARAC.Education'
        })
      }),
      creditRating: new fields.SchemaField({
        min: new fields.NumberField({ nullable: true, initial: null }),
        max: new fields.NumberField({ nullable: true, initial: null })
      }),
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
      ),
      personal: new fields.NumberField({ nullable: false, initial: 0 }),
      personalText: new fields.StringField({ nullable: false, initial: '' })
    }
  }

  /**
   * Human readable occupation points
   * @param {object} occupationSkillPoints
   * @returns {string}
   */
  static getOccupationPointsString (occupationSkillPoints) {
    const optional = []
    const mandatory = []
    for (const [key, value] of Object.entries(occupationSkillPoints)) {
      if (value.selected && value.multiplier) {
        const text = game.i18n.localize('CHARAC.' + key.toUpperCase()) + 'x' + value.multiplier
        if (value.optional) {
          optional.push(text)
        } else {
          mandatory.push(text)
        }
      }
    }
    let occupationPointsString = ''
    const orString = ` ${game.i18n.localize('Cd100.Or')} `
    if (mandatory.length) occupationPointsString += mandatory.join(' + ')
    if (optional.length && mandatory.length) {
      occupationPointsString += ` + (${optional.join(orString)})`
    }
    if (optional.length && !mandatory.length) {
      occupationPointsString += optional.join(orString)
    }
    return occupationPointsString
  }

  /**
   * Migrate old style data to new
   * @param {object} source
   * @returns {object}
   */
  static migrateData (source) {
    // Old system.skills array could contain mix of CoC IDs and Documents split into StringField and JSONField arrays
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
    // Migrate description to object
    if (typeof source.description === 'string') {
      foundry.utils.setProperty(source, 'description', { value: source.description })
    }
    return super.migrateData(source)
  }

  /**
   * Human readable occupation points
   * @returns {string}
   */
  get occupationPointsString () {
    return Cd100ModelsItemOccupationSystem.getOccupationPointsString(this.occupationSkillPoints)
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
