/* global canvas game */
// cSpell:words devphase charcreate xptoggle fakeroll startrest gmtools
import { FOLDER_ID } from '../constants.js'
import Cd100ActorImporterDialog from './actor-importer-dialog.js'
import Cd100ContentLinkDialog from './content-link-dialog.js'
import Cd100InvestigatorWizard from './investigator-wizard.js'
import Cd100MenuLayer from './menu-layer.js'
import Cd100Utilities from './utilities.js'
import CoCIDActorUpdateItems from './coc-id-actor-update-items.js'
import CoCIDCompendiumPopulate from './coc-id-compendium-populate.js'

export default class Cd100SceneControls {
  /**
   * Get Scene Control Buttons
   * @param {SceneControl} controls
   */
  static getButtons (controls) {
    const isKeeper = game.user.isGM
    const menu = {
      name: 'coc7menu',
      title: 'Cd100.GmTools',
      order: 11,
      icon: 'game-icon game-icon-tentacle-strike',
      activeTool: 'coc7dummy',
      visible: isKeeper,
      onChange: (event, active) => {
      },
      onToolChange: (event, tool) => {
      },
      tools: {
        coc7dummy: {
          icon: '',
          name: 'coc7dummy',
          active: false,
          title: '',
          onChange: () => {
          }
        },
        devphase: {
          toggle: true,
          icon: 'fa-solid fa-angle-double-up',
          name: 'devphase',
          active: game.settings.get(FOLDER_ID, 'developmentEnabled'),
          title: 'Cd100.DevPhase',
          onChange: (event, toggled) => Cd100Utilities.toggleDevPhase(toggled)
        },
        charcreate: {
          toggle: true,
          icon: 'fa-solid fa-user-edit',
          name: 'charcreate',
          active: game.settings.get(FOLDER_ID, 'charCreationEnabled'),
          title: 'Cd100.CharCreationMode',
          onChange: (event, toggled) => Cd100Utilities.toggleCharCreation(toggled)
        },
        'actor-coc-id-best': {
          button: true,
          icon: 'fa-solid fa-fingerprint',
          name: 'actor-coc-id-best',
          title: 'Cd100.ActorCoCIDItemsBest',
          onChange: () => CoCIDActorUpdateItems.create()
        },
        'cocid-compendium-import': {
          button: true,
          icon: 'fa-solid fa-book-user',
          name: 'cocid-compendium-import',
          title: 'Cd100.CoCIDCompendiumPopulate',
          onChange: () => CoCIDCompendiumPopulate.create()
        },
        'actor-import': {
          button: true,
          icon: 'fa-solid fa-user-plus',
          name: 'actor-import',
          title: 'Cd100.ActorImporter',
          onChange: () => Cd100ActorImporterDialog.create()
        },
        'investigator-wizard': {
          button: true,
          icon: 'fa-solid fa-user-check',
          name: 'investigator-wizard',
          title: 'Cd100.InvestigatorWizard.Title',
          onChange: () => Cd100InvestigatorWizard.create()
        },
        xptoggle: {
          toggle: true,
          icon: 'fa-solid fa-certificate',
          name: 'xptoggle',
          active: game.settings.get(FOLDER_ID, 'xpEnabled'),
          title: 'Cd100.toggleXP',
          onChange: (event, toggled) => Cd100Utilities.toggleXPGain(toggled)
        },
        fakeroll: {
          button: true,
          icon: 'game-icon game-icon-card-joker',
          name: 'fakeroll',
          title: 'Cd100.FakeRoll',
          onChange: () => Cd100Utilities.fakeRollMessage()
        },
        startrest: {
          button: true,
          icon: 'fa-solid fa-moon',
          name: 'startrest',
          title: 'Cd100.startRest',
          onChange: () => Cd100Utilities.restTargets()
        }
      }
    }
    if (Array.isArray(controls)) {
      /* // FoundryVTT v12 */
      menu.tools = Object.keys(menu.tools).reduce((c, i) => {
        if (i === 'coc7dummy') {
          return c
        }
        if (menu.tools[i].toggle === true) {
          const onChange = menu.tools[i].onChange
          menu.tools[i].onClick = (toggled) => {
            onChange(null, toggled)
          }
        }
        c.push(menu.tools[i])
        return c
      }, [])
      canvas.coc7gmtools = new Cd100MenuLayer()
      menu.layer = 'coc7gmtools'
      controls.push(menu)
    } else {
      controls.coc7menu = menu
    }
    if (game.settings.get(FOLDER_ID, 'hiddendevmenu')) {
      const menu = {
        name: 'coc7devMenu',
        title: 'Dev tools. If you don\'t know what it is, you don\'t need it and you shouldn\'t use it !!',
        order: 12,
        icon: 'game-icon game-icon-police-badge',
        activeTool: 'coc7dummy',
        visible: isKeeper,
        onChange: (event, active) => {
        },
        onToolChange: (event, tool) => {
        },
        tools: {
          coc7dummy: {
            icon: '',
            name: 'coc7dummy',
            active: false,
            title: '',
            onChange: () => {
            }
          },
          alwaysCrit: {
            toggle: true,
            icon: 'game-icon game-icon-dice-fire',
            name: 'alwaysCrit',
            active: game.Cd100.dev.dice.alwaysCrit,
            title: 'All rolls will crit',
            onChange: (event, toggled) => {
              game.Cd100.dev.dice.alwaysCrit = toggled
              if (toggled && game.Cd100.dev.dice.alwaysFumble) {
                document.querySelector('button[data-action="tool"][data-tool="alwaysFumble"]')?.click()
                /* // FoundryVTT V12 */
                document.querySelector('li.control-tool.toggle[data-tool="alwaysFumble"]')?.click()
              }
            }
          },
          alwaysFumble: {
            toggle: true,
            icon: 'game-icon game-icon-fire-extinguisher',
            name: 'alwaysFumble',
            active: game.Cd100.dev.dice.alwaysFumble,
            title: 'All rolls will fumble',
            onChange: (event, toggled) => {
              game.Cd100.dev.dice.alwaysFumble = toggled
              if (toggled && game.Cd100.dev.dice.alwaysCrit) {
                document.querySelector('button[data-action="tool"][data-tool="alwaysCrit"]')?.click()
                /* // FoundryVTT V12 */
                document.querySelector('li.control-tool.toggle[data-tool="alwaysCrit"]')?.click()
              }
            }
          }
        }
      }
      if (Array.isArray(controls)) {
        /* // FoundryVTT v12 */
        menu.tools = Object.keys(menu.tools).reduce((c, i) => {
          if (i === 'coc7dummy') {
            return c
          }
          if (menu.tools[i].toggle === true) {
            const onChange = menu.tools[i].onChange
            menu.tools[i].onClick = (toggled) => {
              onChange(null, toggled)
            }
          }
          c.push(menu.tools[i])
          return c
        }, [])
        canvas.coc7devMenu = new Cd100MenuLayer()
        menu.layer = 'coc7devMenu'
        controls.push(menu)
      } else {
        controls.coc7devMenu = menu
      }
    }
  }

  /**
   * Render Controls
   * @param {ApplicationV2} application
   * @param {HTMLElement} element
   * @param {ApplicationRenderContext} context
   * @param {ApplicationRenderOptions} options
   */
  static renderControls (application, element, context, options) {
    const isKeeper = game.user.isGM
    /* // FoundryVTT V12 */
    if (typeof element.querySelector === 'function') {
      const keeperMenu = element.querySelector('.game-icon-tentacle-strike')?.parentNode
      if (keeperMenu && !keeperMenu.classList.contains('coc7-menu')) {
        keeperMenu.classList.add('coc7-menu')
        if (isKeeper) {
          const menuLi = document.createElement('li')
          const menuButton = document.createElement('button')
          menuButton.classList.add('control', 'ui-control', 'tool', 'icon', 'coc7-menu', 'coc7-create-link', 'fa-solid', 'fa-link')
          menuButton.type = 'button'
          menuButton.dataset.tooltip = 'Cd100.CreateLink'
          menuLi.appendChild(menuButton)
          keeperMenu.insertAdjacentHTML('afterend', menuLi.outerHTML)
          element.querySelector('button.coc7-create-link').addEventListener('click', event => Cd100ContentLinkDialog.create())
        }
        {
          const menuLi = document.createElement('li')
          const menuButton = document.createElement('button')
          menuButton.classList.add('control', 'ui-control', 'tool', 'icon', 'coc7-menu', 'coc7-dice-roll', 'game-icon', 'game-icon-d10')
          menuButton.type = 'button'
          menuButton.dataset.tooltip = 'Cd100.RollDice'
          menuLi.appendChild(menuButton)
          keeperMenu.insertAdjacentHTML('afterend', menuLi.outerHTML)
          element.querySelector('.coc7-menu.coc7-dice-roll').addEventListener('click', event => Cd100Utilities.rollDice(event))
        }
      }
    } else {
      const keeperMenu = element.find('.game-icon-tentacle-strike').parent()
      keeperMenu.addClass('coc7-menu')
      if (isKeeper) {
        keeperMenu.after('<li class="scene-control coc7-menu coc7-create-link" data-tooltip="Cd100.CreateLink"><i class="fa-solid fa-link"></i></li>')
      }
      keeperMenu.after('<li class="scene-control coc7-menu coc7-dice-roll" data-tooltip="Cd100.RollDice"><i class="game-icon game-icon-d10"></i></li>')
      element.find('.coc7-menu.coc7-dice-roll').click(event => Cd100Utilities.rollDice(event))
      element.find('.coc7-menu.coc7-create-link').click(event => Cd100ContentLinkDialog.create())
    }
  }
}
