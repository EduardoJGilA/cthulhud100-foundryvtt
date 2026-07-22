/* global Combat CONFIG CONST foundry fromUuid game Hooks TextEditor */
import { ERAS } from '../constants.js'
import Cd100ClickableEvents from '../apps/clickable-events.js'
import Cd100Combat from '../apps/combat.js'
import Cd100CompendiumFilter from '../setup/compendium-filter.js'
import Cd100DiceSoNiceReadyLast from './dice-so-nice-ready-last.js'
import Cd100HandlebarsHelper from '../setup/handlebars-helper.js'
import Cd100Link from '../apps/link.js'
import Cd100LoadTemplates from '../setup/load-templates.js'
import Cd100MessageResults from '../apps/message-results.js'
import Cd100ModelsConfigureDocuments from '../setup/configure-documents.js'
import Cd100ModelsRegisterSheets from '../setup/register-sheets.js'
import Cd100RegisterDice from '../setup/register-dice.js'
import Cd100RegisterSettings from '../setup/register-settings.js'
import Cd100Utilities from '../apps/utilities.js'
import CoCID from '../apps/coc-id.js'
import CoCIDSkillCache from '../setup/coc-id-skill-cache.js'
import deprecated from '../deprecated.js'

export default function () {
  // FoundryVTT v13 @import escapes href
  const link = document.createElement('link')
  link.setAttribute('href', 'https://fonts.googleapis.com/css?family=Noto%20Sans|Voltaire|Lusitana')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('media', 'all')
  document.head.append(link)

  if (!foundry.utils.isNewerVersion(game.version, 13)) {
    /* // FoundryVTT V12 */
    document.body.classList.add('running-v12')
  }

  game.Cd100 = {
    macros: {
      skillCheck: Cd100Utilities.skillCheckMacro,
      weaponCheck: Cd100Utilities.weaponCheckMacro,
      check: Cd100Utilities.checkMacro,
      linkMacro: Cd100Link.linkMacro
    },
    dev: {
      dice: {
        alwaysCrit: false,
        alwaysFumble: false
      }
    },
    eras: (era, name, icon = 'fa-solid fa-info-circle') => {
      ERAS[era] = {
        name,
        icon
      }
    },
    skillNames: new CoCIDSkillCache(),
    // Manual,
    messageResults: Cd100MessageResults.loadMessage,
    messagePermissionQueue: [],
    ClickRegionLeftUuid: Cd100ClickableEvents.ClickRegionLeftUuid,
    ClickRegionRightUuid: Cd100ClickableEvents.ClickRegionRightUuid,
    hasPermissionDocument: Cd100ClickableEvents.hasPermissionDocument,
    InSceneRelativeTeleport: Cd100ClickableEvents.InSceneRelativeTeleport,
    MapPinToggle: Cd100ClickableEvents.MapPinToggle,
    openDocument: Cd100ClickableEvents.openDocument,
    toggleTileJournalPages: Cd100ClickableEvents.toggleTileJournalPages,
    toScene: Cd100ClickableEvents.toScene
  }
  Object.defineProperty(game, 'CoC7', { get: () => game.Cd100, configurable: true })
  Combat.prototype.rollInitiative = Cd100Combat.rollInitiative

  Cd100ModelsConfigureDocuments()
  Cd100LoadTemplates()
  Cd100RegisterSettings()
  Cd100ModelsRegisterSheets()
  Cd100HandlebarsHelper()
  Cd100CompendiumFilter()
  CoCID.init()
  Cd100RegisterDice()
  Cd100Link.init()
  Hooks.once('diceSoNiceReady', Cd100DiceSoNiceReadyLast)
  Cd100ClickableEvents.initSelf()

  deprecated.CoCID()
  deprecated.init()

  CONFIG.TextEditor.enrichers.push({
    pattern: /@chaosiumUUID\[([^#\]]+)(?:#([^\]]+))?](?:{([^}]+)})?/gi,
    enricher: async (match, { relativeTo } = {}) => {
      const [selectors, hash, name] = match.slice(1, 4)
      let data = {
        name,
        classes: ['content-link', 'broken'],
        icon: 'fas fa-unlink'
      }
      const parts = selectors?.split(/\s*,\s*/)
      if (parts) {
        const keys = parts.reduce((c, i) => {
          const keyVal = i.match(/^(([^:]+):)(.+)?$/)
          if (keyVal) {
            c[keyVal[2]] = keyVal[3]
          } else {
            c.uuid = i
          }
          return c
        }, {})
        if (keys.uuid) {
          const doc = await fromUuid(keys.uuid, { relative: relativeTo })
          if (doc) {
            data = {
              name: name || doc.name || keys.uuid,
              classes: ['content-link'],
              dataset: {
                link: '',
                uuid: doc.uuid,
                id: doc.id,
                type: doc.documentName
              },
              icon: keys.icon ?? CONFIG[doc.documentName].sidebarIcon
            }
            if (hash) {
              data.dataset.hash = hash
            }
            if (keys.img) {
              const a = document.createElement('a')
              a.classList.add(data.classes)
              for (const [k, v] of Object.entries(data.dataset)) {
                if ((v !== null) && (typeof v !== 'undefined')) {
                  a.dataset[k] = v
                }
              }
              a.innerHTML = `<img src="${keys.img}" style="border:0;display:inline-block;height:16px;margin-right:2px;vertical-align:text-top;">${data.name}`
              return a
            }
          }
        }
      }

      return (foundry.applications.ux?.TextEditor.implementation ?? TextEditor).createAnchor(data)
    }
  })

  if (['14.359', '14.360'].includes(game.version)) {
    // Hide deprecated warnings with first two stable v14 releases
    CONFIG.compatibility.mode = CONST.COMPATIBILITY_MODES.SILENT
  }
}
