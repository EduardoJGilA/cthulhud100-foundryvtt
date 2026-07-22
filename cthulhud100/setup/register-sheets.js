/* global Actors foundry game Items */
import { FOLDER_ID } from '../constants.js'
import Cd100ModelsActorCharacterSheetSummarizedV2 from '../models/actor/character-sheet-summarized-v2.js'
import Cd100ModelsActorCharacterSheetSummarizedV3 from '../models/actor/character-sheet-summarized-v3.js'
import Cd100ModelsActorCharacterSheetV2 from '../models/actor/character-sheet-v2.js'
import Cd100ModelsActorCharacterSheetV3 from '../models/actor/character-sheet-v3.js'
import Cd100ModelsActorContainerSheetV2 from '../models/actor/container-sheet-v2.js'
import Cd100ModelsActorCreatureSheetV2 from '../models/actor/creature-sheet-v2.js'
import Cd100ModelsActorNPCSheetV2 from '../models/actor/npc-sheet-v2.js'
import Cd100ModelsActorVehicleSheetV2 from '../models/actor/vehicle-sheet-v2.js'
import Cd100ModelsItemArchetypeSheet from '../models/item/archetype-sheet.js'
import Cd100ModelsItemArmorSheet from '../models/item/armor-sheet.js'
import Cd100ModelsItemBookSheet from '../models/item/book-sheet.js'
import Cd100ModelsItemChaseSheet from '../models/item/chase-sheet.js'
import Cd100ModelsItemExperiencePackageSheet from '../models/item/experience-package-sheet.js'
import Cd100ModelsItemItemSheetV2 from '../models/item/item-sheet-v2.js'
import Cd100ModelsItemOccupationSheet from '../models/item/occupation-sheet.js'
import Cd100ModelsItemSetupSheet from '../models/item/setup-sheet.js'
import Cd100ModelsItemSkillSheet from '../models/item/skill-sheet.js'
import Cd100ModelsItemSpellSheet from '../models/item/spell-sheet.js'
import Cd100ModelsItemStatusSheet from '../models/item/status-sheet.js'
import Cd100ModelsItemTalentSheet from '../models/item/talent-sheet.js'
import Cd100ModelsItemWeaponSheet from '../models/item/weapon-sheet.js'

/**
 * Register Sheets
 */
export default function () {
  /* // FoundryVTT V12 */
  const ActorsPolyfill = (foundry.documents.collections?.Actors ?? Actors)
  const ItemsPolyfill = (foundry.documents.collections?.Items ?? Items)

  ActorsPolyfill.unregisterSheet('core', foundry.appv1.sheets.ActorSheet)
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorNPCSheetV2, {
    types: ['npc'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorNPCSheetV2'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorVehicleSheetV2, {
    types: ['vehicle'],
    makeDefault: true
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorCreatureSheetV2, {
    types: ['creature'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorCreatureSheetV2'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorContainerSheetV2, {
    types: ['container'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorContainerSheetV2'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorCharacterSheetV2, {
    types: ['character'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorCharacterSheetV2') /* // FoundryVTT V12 */
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorCharacterSheetSummarizedV2, {
    types: ['character'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorCharacterSheetSummarizedV2') /* // FoundryVTT V12 */
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorCharacterSheetSummarizedV3, {
    types: ['character'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorCharacterSheetSummarizedV3') /* // FoundryVTT V12 */
  })
  ActorsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsActorCharacterSheetV3, {
    types: ['character'],
    label: game.i18n.localize('Cd100.Cd100ModelsActorCharacterSheetV3'), /* // FoundryVTT V12 */
    makeDefault: true
  })

  ItemsPolyfill.unregisterSheet('core', foundry.appv1.sheets.ItemSheet)
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemSkillSheet, {
    types: ['skill'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemSkillSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemWeaponSheet, {
    types: ['weapon'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemWeaponSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemBookSheet, {
    types: ['book'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemBookSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemSpellSheet, {
    types: ['spell'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemSpellSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemTalentSheet, {
    types: ['talent'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemTalentSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemStatusSheet, {
    types: ['status'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemStatusSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemOccupationSheet, {
    types: ['occupation'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemOccupationSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemArchetypeSheet, {
    types: ['archetype'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemArchetypeSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemSetupSheet, {
    types: ['setup'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemSetupSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemChaseSheet, {
    types: ['chase'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemChaseSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemArmorSheet, {
    types: ['armor'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemArmorSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemExperiencePackageSheet, {
    types: ['experiencePackage'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemExperiencePackageSheet'), /* // FoundryVTT V12 */
    makeDefault: true
  })
  ItemsPolyfill.registerSheet(FOLDER_ID, Cd100ModelsItemItemSheetV2, {
    types: ['item'],
    label: game.i18n.localize('Cd100.Cd100ModelsItemItemSheetV2'), /* // FoundryVTT V12 */
    makeDefault: true
  })
}
