/* global foundry */
import { FOLDER_ID } from '../../constants.js'
import Cd100ModelsActorNPCSystem from './npc-system.js'

export default class Cd100ModelsActorCreatureSystem extends Cd100ModelsActorNPCSystem {
  /**
   * Create Schema
   * @returns {DataSchema}
   */
  static defineSchema () {
    const fields = foundry.data.fields
    return Object.assign(super.defineSchema(), {
      // Cthulhu d100 "piel correosa". Not simply armour: firearms do their
      // minimum damage against it and cannot double through impaling, so a
      // shotgun is nearly useless on a moon-beast. Armour points are recorded
      // separately in attribs.armor as usual.
      leatherySkin: new fields.BooleanField({
        initial: false,
        label: 'Cd100.CreatureLeatherySkin',
        hint: 'Cd100.CreatureLeatherySkinHint'
      })
    })
  }

  /**
   * Default img
   * @returns {string}
   */
  static get defaultImg () {
    return 'systems/' + FOLDER_ID + '/assets/icons/floating-tentacles.svg'
  }
}
