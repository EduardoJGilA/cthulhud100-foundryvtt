/* global CONFIG foundry game */
import { FOLDER_ID, CHARACTERISTIC_MULTIPLIER } from '../../constants.js'
import Cd100ModelsActorDocumentClass from './document-class.js'
import Cd100MentalStability from '../../apps/mental-stability.js'
import Cd100StringField from '../fields/string-field.js'

export default class Cd100ModelsActorGlobalSystem extends foundry.abstract.TypeDataModel {
  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchemaAttribs () {
    const fields = foundry.data.fields
    return new fields.SchemaField({
      hp: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null }),
        max: new fields.NumberField({ nullable: true, initial: null }),
        auto: new fields.BooleanField({ initial: true })
      }, {
        label: 'Cd100.HP',
        hint: 'Cd100.HitPoints'
      }),
      mp: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null }),
        max: new fields.NumberField({ nullable: true, initial: null }),
        auto: new fields.BooleanField({ initial: true })
      }, {
        label: 'Cd100.MP',
        hint: 'Cd100.MagicPoints'
      }),
      lck: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'Cd100.Lck',
        hint: 'Cd100.Luck'
      }),
      san: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null }),
        max: new fields.NumberField({ initial: 99 }),
        dailyLoss: new fields.NumberField({ initial: 0 }),
        dailyLimit: new fields.NumberField({ initial: 0 }),
        auto: new fields.BooleanField({ initial: true }),
        // Cthulhu d100 alternative madness system (rulebook chapter 3).
        // Tension accumulates across three bars sized from POD; underlyingMadness
        // is Locura Subyacente, which only medical treatment removes.
        tension: new fields.NumberField({ nullable: false, initial: 0, min: 0 }),
        underlyingMadness: new fields.NumberField({ nullable: false, initial: 0, min: 0 })
      }, {
        label: 'Cd100.SAN',
        hint: 'Cd100.Sanity'
      }),
      mov: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null }),
        auto: new fields.BooleanField({ initial: true }),
        type: new fields.StringField({
          choices: Object.keys(CONFIG.Token.movement.actions),
          initial: 'walk'
        })
      }, {
        label: 'Cd100.Mov',
        hint: 'Cd100.Movement'
      }),
      db: new fields.SchemaField({
        value: new Cd100StringField({ nullable: true, initial: null }),
        auto: new fields.BooleanField({ initial: true })
      }, {
        label: 'Cd100.DB',
        hint: 'Cd100.BonusDamage'
      }),
      build: new fields.SchemaField({
        value: new fields.NumberField({ nullable: true, initial: null }),
        auto: new fields.BooleanField({ initial: true })
      }, {
        label: 'Cd100.Build',
        hint: 'Cd100.Build'
      }),
      armor: new fields.SchemaField({
        notes: new fields.BooleanField({ initial: false }),
        value: new Cd100StringField({ nullable: true, initial: null })
      }, {
        label: 'Cd100.Armor',
        hint: 'Cd100.Armor'
      })
    })
  }

  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchemaBooks () {
    const fields = foundry.data.fields
    return new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          validate: value => {
            if (!foundry.data.validators.isValidId(value)) {
              throw new Error('must be a valid 16-character alphanumeric ID')
            }
          }
        }),
        cocid: new fields.StringField({ localize: false }),
        name: new fields.StringField({ localize: false }),
        initialReading: new fields.BooleanField({ initial: false }),
        fullStudies: new fields.NumberField({ nullable: false, initial: 0 }),
        necessary: new fields.NumberField({ initial: 0 }),
        progress: new fields.NumberField({ initial: 0 }),
        units: new fields.StringField({ initial: 'Cd100.weeks' }),
        spellsLearned: new fields.ArrayField(
          new fields.StringField({
            validate: value => {
              if (!foundry.data.validators.isValidId(value)) {
                throw new Error('must be a valid 16-character alphanumeric ID')
              }
            }
          })
        )
      })
    )
  }

  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchemaCharacteristics () {
    const fields = foundry.data.fields
    return new fields.SchemaField({
      // Chaosium.com Character Sheet PDFs
      // A Time to Harvest
      // Call of Cthulhu 7th Edition Quick-Start Rules
      // Call of Cthulhu: Arkham
      // Call of Cthulhu: No Time to Scream
      // Call of Cthulhu: The Order of the Stone
      // Cthulhu by Gaslight: Investigators' Guide
      // - STR CON DEX INT SIZ POW APP EDU
      // Alone Against the Flames
      // - STR CON SIZ DEX APP INT POW EDU
      // Alone against the Tide
      // Masks of Nyarlathotep - 7th Edition
      // - STR CON SIZ DEX APP EDU INT POW
      // Berlin - The Wicked City
      // Doors to Darkness
      // Reign of Terror
      // - STR CON SIZ DEX INT APP POW EDU
      // Dead Light
      // - STR CON SIZ INT POW DEX APP EDU
      // Harlem Unbound - Second Edition
      // - STR DEX POW CON APP EDU SIZ INT
      str: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.STR',
        hint: 'CHARAC.Strength'
      }),
      con: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.CON',
        hint: 'CHARAC.Constitution'
      }),
      siz: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.SIZ',
        hint: 'CHARAC.Size'
      }),
      dex: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.DEX',
        hint: 'CHARAC.Dexterity'
      }),
      app: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.APP',
        hint: 'CHARAC.Appearance'
      }),
      int: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.INT',
        hint: 'CHARAC.Intelligence'
      }),
      pow: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.POW',
        hint: 'CHARAC.Power'
      }),
      edu: new fields.SchemaField({
        formula: new fields.StringField({ initial: '' }),
        value: new fields.NumberField({ nullable: true, initial: null })
      }, {
        label: 'CHARAC.EDU',
        hint: 'CHARAC.Education'
      })
    })
  }

  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchemaConditions () {
    const fields = foundry.data.fields
    return new fields.SchemaField({
      criticalWounds: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      }),
      unconscious: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      }),
      dying: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      }),
      dead: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      }),
      prone: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      }),
      tempoInsane: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false }),
        realTime: new fields.BooleanField({ initial: false }),
        duration: new fields.NumberField({ initial: 0 })
      }),
      indefInsane: new fields.SchemaField({
        value: new fields.BooleanField({ initial: false })
      })
    })
  }

  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchemaConfig () {
    const fields = foundry.data.fields
    return new fields.SchemaField({
      /* // FoundryVTT V13 */
      // add these with persisted = false
      // luckRecovery: new fields.StringField({ initial: '' }),
      luckAvoidUnconsciousness: new fields.NumberField({ nullable: false, initial: 1 })
      // naturalHealing: new fields.NumberField({ nullable: false, initial: 1 }),
      // idea: new fields.SchemaField({
      //   bonusDice: new fields.NumberField({ initial: 0 }),
      //   value: new fields.NumberField({ nullable: false, initial: 0 })
      // }).
      // know: new fields.SchemaField({
      //   bonusDice: new fields.NumberField({ initial: 0 }),
      //   value: new fields.NumberField({ nullable: false, initial: 0 })
      // })
    })
  }

  /**
   * @inheritdoc
   */
  prepareBaseData () {
    super.prepareBaseData()

    if (typeof this.attribs !== 'undefined' && typeof this.characteristics !== 'undefined') {
      if (this.attribs.build.auto) {
        this.attribs.build.value = Cd100ModelsActorDocumentClass.buildFromCharacteristics(this.characteristics)
      }
      if (this.attribs.db.auto) {
        this.attribs.db.value = Cd100ModelsActorDocumentClass.dbFromCharacteristics(this.characteristics)
      }
      if (this.attribs.hp.auto) {
        const maxValue = (this.attribs.hp.value === this.attribs.hp.max)
        this.attribs.hp.max = Cd100ModelsActorDocumentClass.hpFromCharacteristics(this.characteristics, this.parent.type)
        if (maxValue) {
          this.attribs.hp.value = this.attribs.hp.max
        }
      }
      if (this.attribs.mov.auto) {
        this.attribs.mov.value = Cd100ModelsActorDocumentClass.movFromCharacteristics(this.characteristics, this.parent.type, this.infos.age)
      }
      if (this.attribs.mp.auto) {
        const maxValue = (this.attribs.mp.value === this.attribs.mp.max)
        this.attribs.mp.max = Cd100ModelsActorDocumentClass.mpFromCharacteristics(this.characteristics, this.parent.type)
        if (maxValue) {
          this.attribs.mp.value = this.attribs.mp.max
        }
      }
      // Cthulhu d100 derived scores: Cultura General is EST x5 and Idea is INT x5.
      // In Cd100 these were the raw characteristics, which were already percentiles.
      // check.js reads these values as thresholds directly, so the multiplier is
      // applied here and must not be applied again there.
      this.config.know = {
        value: this.characteristics.edu.value * CHARACTERISTIC_MULTIPLIER,
        bonusDice: this.characteristics.edu.bonusDice ?? 0
      }
      this.config.idea = {
        value: this.characteristics.int.value * CHARACTERISTIC_MULTIPLIER,
        bonusDice: this.characteristics.int.bonusDice ?? 0
      }
      // Suerte is POD x5 and derived, not a pool that is rolled and spent as in
      // Cd100. The Luck-spending machinery is still wired up elsewhere and has to
      // be neutralised separately.
      this.attribs.lck.value = this.characteristics.pow.value * CHARACTERISTIC_MULTIPLIER
      // Alternative madness system: bars, state and modifiers all derive from
      // POD and accumulated tension, so they are recomputed rather than stored.
      if (game.settings.get(FOLDER_ID, 'sanitySystem') === 'alternative') {
        const state = Cd100MentalStability.stateFromTension(this.characteristics.pow.value, this.attribs.san.tension)
        this.config.mentalStability = {
          bars: Cd100MentalStability.bars(this.characteristics.pow.value),
          state,
          modifiers: Cd100MentalStability.modifiers(state),
          recoveryModifier: Cd100MentalStability.recoveryModifier(state)
        }
      }
      this.config.naturalHealing = (game.settings.get(FOLDER_ID, 'pulpRuleFasterRecovery') ? 2 : 1)
    }
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData () {
    super.prepareDerivedData()

    if (typeof this.attribs !== 'undefined' && typeof this.characteristics !== 'undefined') {
      // If Active Effects has altered the derived values since prepareBaseData don't replacement
      const overrides = foundry.utils.flattenObject(this.parent.overrides)

      if (this.attribs.build.auto && typeof overrides['system.attribs.build.value'] === 'undefined') {
        this.attribs.build.value = Cd100ModelsActorDocumentClass.buildFromCharacteristics(this.characteristics)
      }
      if (this.attribs.db.auto && typeof overrides['system.attribs.db.value'] === 'undefined') {
        this.attribs.db.value = Cd100ModelsActorDocumentClass.dbFromCharacteristics(this.characteristics)
      }
      if (this.attribs.hp.auto && typeof overrides['system.attribs.db.max'] === 'undefined') {
        const maxValue = (this.attribs.hp.value === this.attribs.hp.max)
        this.attribs.hp.max = Cd100ModelsActorDocumentClass.hpFromCharacteristics(this.characteristics, this.parent.type)
        if (maxValue) {
          this.attribs.hp.value = this.attribs.hp.max
        }
      }
      if (this.attribs.hp.max && this.attribs.hp.max < this.attribs.hp.value) {
        this.attribs.hp.value = this.attribs.hp.max
      }
      if (this.attribs.mov.auto && typeof overrides['system.attribs.mov.value'] === 'undefined') {
        this.attribs.mov.value = Cd100ModelsActorDocumentClass.movFromCharacteristics(this.characteristics, this.parent.type, this.infos.age)
      }
      if (this.attribs.mp.auto && typeof overrides['system.attribs.mp.max'] === 'undefined') {
        const maxValue = (this.attribs.mp.value === this.attribs.mp.max)
        this.attribs.mp.max = Cd100ModelsActorDocumentClass.mpFromCharacteristics(this.characteristics, this.parent.type)
        if (maxValue) {
          this.attribs.mp.value = this.attribs.mp.max
        }
      }
      if (this.attribs.mp.max && this.attribs.mp.max < this.attribs.mp.value) {
        this.attribs.mp.value = this.attribs.mp.max
      }
      if (this.attribs.san.auto) {
        const maxValue = (this.attribs.san.value === this.attribs.san.max)
        this.attribs.san.max = this.parent.sanityMaximum()
        if (maxValue) {
          this.attribs.san.value = this.attribs.san.max
        }
      }
      if (this.attribs.san.max && this.attribs.san.max < this.attribs.san.value) {
        this.attribs.san.value = this.attribs.san.max
      }
    }
  }

  /**
   * Find this book data on Actor
   * @param {Document} document
   * @returns {object}
   */
  getBook (document) {
    return this.books.find(field => field.id === document.id || (document.flags[FOLDER_ID]?.cocidFlag?.id.length ? field.cocid === document.flags[FOLDER_ID].cocidFlag.id : false))
  }

  /**
   * Update/add book to Actor
   * @param {Document} document
   * @param {object} updates
   */
  async updateBook (document, updates) {
    const books = foundry.utils.duplicate(this.books)
    let offset = books.findIndex(field => field.id === document.id || (document.flags[FOLDER_ID]?.cocidFlag?.id.length ? field.cocid === document.flags[FOLDER_ID].cocidFlag.id : false))
    if (offset === -1) {
      const book = foundry.utils.mergeObject({
        id: document.id,
        cocid: (document.flags[FOLDER_ID]?.cocidFlag?.id ?? ''),
        name: document.name,
        initialReading: false,
        fullStudies: 0,
        necessary: document.system.study.necessary,
        progress: 0,
        units: document.system.study.units,
        spellsLearned: []
      }, updates)
      offset = books.length
      books.push(book)
    } else {
      foundry.utils.mergeObject(books[offset], updates)
    }
    if (books[offset].progress >= books[offset].necessary) {
      books[offset].progress = books[offset].necessary
      books[offset].fullStudies++
      // Grant Full Study
      if (document.system.type.mythos && document.system.mythosRating > 0) {
        const cthulhuMythosSkill = this.parent.cthulhuMythosSkill
        if (cthulhuMythosSkill) {
          let mythosIncrease = document.system.gains.cthulhuMythos.initial
          if (cthulhuMythosSkill.system.value < document.system.mythosRating) {
            mythosIncrease = document.system.gains.cthulhuMythos.final
          }
          if (mythosIncrease > 0) {
            const developments = [{
              name: cthulhuMythosSkill.name,
              gain: mythosIncrease
            },
            {
              name: document.system.language,
              gain: 'development'
            }]
            await document.system.grantSkillDevelopment(developments)
            await document.system.rollSanityLoss()
          }
        }
      }
    }
    await this.parent.update({ 'system.books': books })
  }
}
