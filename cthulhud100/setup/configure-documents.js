/* global CONFIG */
import Cd100ModelsActiveEffectDocumentClass from '../models/active-effect/document-class.js'
import Cd100ModelsActorCharacterSystem from '../models/actor/character-system.js'
import Cd100ModelsActorContainerSystem from '../models/actor/container-system.js'
import Cd100ModelsActorCreatureSystem from '../models/actor/creature-system.js'
import Cd100ModelsActorDocumentClass from '../models/actor/document-class.js'
import Cd100ModelsActorNPCSystem from '../models/actor/npc-system.js'
import Cd100ModelsActorVehicleSystem from '../models/actor/vehicle-system.js'
import Cd100ModelsItemArchetypeSystem from '../models/item/archetype-system.js'
import Cd100ModelsItemArmorSystem from '../models/item/armor-system.js'
import Cd100ModelsItemBookSystem from '../models/item/book-system.js'
import Cd100ModelsItemChaseSystem from '../models/item/chase-system.js'
import Cd100ModelsItemDocumentClass from '../models/item/document-class.js'
import Cd100ModelsItemExperiencePackageSystem from '../models/item/experience-package-system.js'
import Cd100ModelsItemItemSystem from '../models/item/item-system.js'
import Cd100ModelsItemOccupationSystem from '../models/item/occupation-system.js'
import Cd100ModelsItemSetupSystem from '../models/item/setup-system.js'
import Cd100ModelsItemSkillSystem from '../models/item/skill-system.js'
import Cd100ModelsItemSpellSystem from '../models/item/spell-system.js'
import Cd100ModelsItemStatusSystem from '../models/item/status-system.js'
import Cd100ModelsItemTalentSystem from '../models/item/talent-system.js'
import Cd100ModelsItemWeaponSystem from '../models/item/weapon-system.js'

/**
 * Set models and document classes
 */
export default function () {
  CONFIG.ActiveEffect.documentClass = Cd100ModelsActiveEffectDocumentClass

  CONFIG.Actor.documentClass = Cd100ModelsActorDocumentClass

  CONFIG.Actor.dataModels.character = Cd100ModelsActorCharacterSystem
  CONFIG.Actor.dataModels.container = Cd100ModelsActorContainerSystem
  CONFIG.Actor.dataModels.creature = Cd100ModelsActorCreatureSystem
  CONFIG.Actor.dataModels.npc = Cd100ModelsActorNPCSystem
  CONFIG.Actor.dataModels.vehicle = Cd100ModelsActorVehicleSystem

  CONFIG.Item.documentClass = Cd100ModelsItemDocumentClass

  CONFIG.Item.dataModels.book = Cd100ModelsItemBookSystem
  CONFIG.Item.dataModels.spell = Cd100ModelsItemSpellSystem
  CONFIG.Item.dataModels.chase = Cd100ModelsItemChaseSystem
  CONFIG.Item.dataModels.skill = Cd100ModelsItemSkillSystem
  CONFIG.Item.dataModels.archetype = Cd100ModelsItemArchetypeSystem
  CONFIG.Item.dataModels.armor = Cd100ModelsItemArmorSystem
  CONFIG.Item.dataModels.experiencePackage = Cd100ModelsItemExperiencePackageSystem
  CONFIG.Item.dataModels.item = Cd100ModelsItemItemSystem
  CONFIG.Item.dataModels.occupation = Cd100ModelsItemOccupationSystem
  CONFIG.Item.dataModels.setup = Cd100ModelsItemSetupSystem
  CONFIG.Item.dataModels.status = Cd100ModelsItemStatusSystem
  CONFIG.Item.dataModels.talent = Cd100ModelsItemTalentSystem
  CONFIG.Item.dataModels.weapon = Cd100ModelsItemWeaponSystem
}
