/* global foundry game ui */
import { FOLDER_ID } from '../constants.js'
import Cd100RegisterTours from '../setup/register-tours.js'
import Cd100SystemSocket from '../apps/system-socket.js'
import Cd100Updater from '../apps/updater.js'
import Cd100Utilities from '../apps/utilities.js'
import deprecated from '../deprecated.js'

export default function () {
  console.log('Cthulhu d100 | Ready')

  const instructionsVersion = game.settings.get(FOLDER_ID, 'showInstructions')
  let lang = game.i18n.lang
  const readMe = {
    de: 'PIUXjbPhnfLtqw3I', // cspell:disable-line
    en: 'sxB2OXbfwV6M0nyQ', // cspell:disable-line
    es: '35FM7ZOdzC6L2xlj', // cspell:disable-line
    fr: 'tdakyzTVOQsAMdSm', // cspell:disable-line
    ja: '75sD0ovkj4TDpvzv', // cspell:disable-line
    uk: '98TuflgZUmQoJdSK' // cspell:disable-line
  }
  if (typeof readMe[lang] === 'undefined') {
    lang = 'en'
  }
  game.Cd100.Manual = readMe[lang]
  if (foundry.utils.isNewerVersion(game.system.version, instructionsVersion ?? '0')) {
    game.packs.get(FOLDER_ID + '.system-doc').getDocument(game.Cd100.Manual).then((doc) => {
      /* // FoundryVTT V12 */
      doc.sheet.render(true)
      game.settings.set(FOLDER_ID, 'showInstructions', game.system.version)
    })
  }

  Cd100RegisterTours()
  game.Cd100.skillNames.refreshList()
  game.socket.on('system.' + FOLDER_ID, async data => {
    Cd100SystemSocket.callSocket(data)
  })

  /* // FoundryVTT V12 */
  if (!foundry.utils.isNewerVersion(game.version, 13)) {
    const value = game.settings.get('core', 'fontSize')
    if (typeof value !== 'undefined') {
      document.body.style.setProperty('--font-size', String(value))
    }
  } else {
    const value = game.settings.get('core', 'uiConfig')
    if (typeof value.fontScale !== 'undefined') {
      document.body.style.setProperty('--font-size', String(value.fontScale))
    }
  }

  // Attempt to fix bad setting
  if (game.settings.get(FOLDER_ID, 'InvestigatorWizardChooseValues') !== true && game.settings.get(FOLDER_ID, 'InvestigatorWizardChooseValues') !== false) {
    game.settings.set(FOLDER_ID, 'InvestigatorWizardChooseValues', game.settings.get(FOLDER_ID, 'InvestigatorWizardChooseValues')[0] ?? false)
  }
  // Migrate Bout Of Madness Tables from ID to UUID
  if (game.settings.get(FOLDER_ID, 'boutOfMadnessSummaryTable') !== 'none' && game.settings.get(FOLDER_ID, 'boutOfMadnessSummaryTable').indexOf('.') === -1) {
    game.settings.set(FOLDER_ID, 'boutOfMadnessSummaryTable', 'RollTable.' + game.settings.get(FOLDER_ID, 'boutOfMadnessSummaryTable'))
  }
  if (game.settings.get(FOLDER_ID, 'boutOfMadnessRealTimeTable') !== 'none' && game.settings.get(FOLDER_ID, 'boutOfMadnessRealTimeTable').indexOf('.') === -1) {
    game.settings.set(FOLDER_ID, 'boutOfMadnessRealTimeTable', 'RollTable.' + game.settings.get(FOLDER_ID, 'boutOfMadnessRealTimeTable'))
  }

  Cd100Utilities.updateBoutTableChoices()
  deprecated.ready()
  Cd100Updater.checkForUpdate()

  if (game.modules.get('dice-so-nice')?.version === '5.3.0') {
    ui.notifications.error('Dice So Nice 5.3.0 is not compatible with the system, please update to 5.3.2', { localize: false, permanent: true, console: false })
  }
}
