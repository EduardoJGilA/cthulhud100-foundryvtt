/* global CONFIG */
export default function (app, node) {
  const sheetClass = CONFIG.Actor.sheetClasses.character?.['Cd100.Cd100ModelsActorCharacterSheetV3']?.cls
  if (sheetClass && app instanceof sheetClass) {
    node.style.marginLeft = '87px'
  }
}
