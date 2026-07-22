/* global Hooks */
import '../styles/coc7-index.less'
import './polyfill.js'
import Cd100ChatMessage from './hooks/chat-message.js'
import Cd100ClientSettingChanged from './hooks/client-setting-changed.js'
import Cd100CloseNoteConfig from './hooks/close-note-config.js'
import Cd100CreateActiveEffect from './hooks/create-active-effect.js'
import Cd100CreateItem from './hooks/create-item.js'
import Cd100CreateToken from './hooks/create-token.js'
import Cd100DeleteActiveEffect from './hooks/delete-active-effect.js'
import Cd100DeleteItem from './hooks/delete-item.js'
import Cd100DiceSoNiceReady from './hooks/dice-so-nice-ready.js'
import Cd100DrawNote from './hooks/draw-note.js'
import Cd100DropActorSheetData from './hooks/drop-actor-sheet-data.js'
import Cd100DropCanvasData from './hooks/drop-canvas-data.js'
import Cd100GetChatMessageContextOptions from './hooks/get-chat-message-context-options.js'
import Cd100GetSceneControlButtons from './hooks/get-scene-control-buttons.js'
import Cd100HotbarDrop from './hooks/hotbar-drop.js'
import Cd100Init from './hooks/init.js'
import Cd100ModifyTokenAttribute from './hooks/modify-token-attribute.js'
import Cd100PopOutLoaded from './hooks/pop-out-loaded.js'
import Cd100PreCreateChatMessage from './hooks/pre-create-chat-message.js'
import Cd100PreUpdateChatMessage from './hooks/pre-update-chat-message.js'
import Cd100PreUpdateItem from './hooks/pre-update-item.js'
import Cd100Ready from './hooks/ready.js'
import Cd100RenderActorDirectory from './hooks/render-actor-directory.js'
import Cd100RenderActorSheetV2 from './hooks/render-actor-sheet-v2.js'
import Cd100RenderChatMessageHTML from './hooks/render-chat-message-html.js'
import Cd100RenderCd100ModelsActorCharacterSheetV2 from './hooks/render-coc7-models-actor-character-sheet-v2.js'
import Cd100RenderCombatTracker from './hooks/render-combat-tracker.js'
import Cd100RenderDialogV2 from './hooks/render-dialog-v2.js'
import Cd100RenderDocumentSheetConfig from './hooks/render-document-sheet-config.js'
import Cd100RenderGamePause from './hooks/render-game-pause.js'
import Cd100RenderItemSheetV2 from './hooks/render-item-sheet-v2.js'
import Cd100RenderJournalEntryPageTextSheet from './hooks/render-journal-entry-page-text-sheet.js'
import Cd100RenderJournalEntrySheet from './hooks/render-journal-entry-sheet.js'
import Cd100RenderMacroConfig from './hooks/render-macro-config.js'
import Cd100RenderNoteConfig from './hooks/render-note-config.js'
import Cd100RenderPlayers from './hooks/render-players.js'
import Cd100RenderPlaylistConfig from './hooks/render-playlist-config.js'
import Cd100RenderRegionConfig from './hooks/render-region-config.js'
import Cd100RenderRollTableSheet from './hooks/render-roll-table-sheet.js'
import Cd100RenderSceneConfig from './hooks/render-scene-config.js'
import Cd100RenderSceneControls from './hooks/render-scene-controls.js'
import Cd100RenderSettings from './hooks/render-settings.js'
import Cd100RenderSettingsConfig from './hooks/render-settings-config.js'
import Cd100Setup from './hooks/setup.js'
import Cd100UpdateItem from './hooks/update-item.js'

Hooks.once('init', Cd100Init)
Hooks.once('ready', Cd100Ready)
Hooks.once('setup', Cd100Setup)

Hooks.on('chatMessage', Cd100ChatMessage)
Hooks.on('clientSettingChanged', Cd100ClientSettingChanged)
Hooks.on('closeNoteConfig', Cd100CloseNoteConfig)
Hooks.on('createActiveEffect', Cd100CreateActiveEffect)
Hooks.on('createItem', Cd100CreateItem)
Hooks.on('createToken', Cd100CreateToken)
Hooks.on('deleteActiveEffect', Cd100DeleteActiveEffect)
Hooks.on('deleteItem', Cd100DeleteItem)
Hooks.on('drawNote', Cd100DrawNote)
Hooks.on('dropActorSheetData', Cd100DropActorSheetData)
Hooks.on('dropCanvasData', Cd100DropCanvasData)
Hooks.on('getChatMessageContextOptions', Cd100GetChatMessageContextOptions)
Hooks.on('getSceneControlButtons', Cd100GetSceneControlButtons)
Hooks.on('hotbarDrop', Cd100HotbarDrop)
Hooks.on('modifyTokenAttribute', Cd100ModifyTokenAttribute)
Hooks.on('preCreateChatMessage', Cd100PreCreateChatMessage)
Hooks.on('preUpdateChatMessage', Cd100PreUpdateChatMessage)
Hooks.on('preUpdateItem', Cd100PreUpdateItem)
Hooks.on('renderActorDirectory', Cd100RenderActorDirectory)
Hooks.on('renderActorSheetV2', Cd100RenderActorSheetV2)
Hooks.on('renderChatMessageHTML', Cd100RenderChatMessageHTML)
Hooks.on('renderCd100ModelsActorCharacterSheetV2', Cd100RenderCd100ModelsActorCharacterSheetV2)
Hooks.on('renderCombatTracker', Cd100RenderCombatTracker)
Hooks.on('renderDialogV2', Cd100RenderDialogV2)
Hooks.on('renderDocumentSheetConfig', Cd100RenderDocumentSheetConfig)
Hooks.on('renderGamePause', Cd100RenderGamePause)
Hooks.on('renderItemSheetV2', Cd100RenderItemSheetV2)
Hooks.on('renderJournalEntryPageTextSheet', Cd100RenderJournalEntryPageTextSheet)
Hooks.on('renderJournalEntrySheet', Cd100RenderJournalEntrySheet)
Hooks.on('renderMacroConfig', Cd100RenderMacroConfig)
Hooks.on('renderNoteConfig', Cd100RenderNoteConfig)
Hooks.on('renderPlayers', Cd100RenderPlayers)
Hooks.on('renderPlaylistConfig', Cd100RenderPlaylistConfig)
Hooks.on('renderRegionConfig', Cd100RenderRegionConfig)
Hooks.on('renderRollTableSheet', Cd100RenderRollTableSheet)
Hooks.on('renderSceneConfig', Cd100RenderSceneConfig)
Hooks.on('renderSceneControls', Cd100RenderSceneControls)
Hooks.on('renderSettings', Cd100RenderSettings)
Hooks.on('renderSettingsConfig', Cd100RenderSettingsConfig)
Hooks.on('updateItem', Cd100UpdateItem)

// Module: Dice So Nice
Hooks.once('diceSoNiceReady', Cd100DiceSoNiceReady)

// Module: PopOut
Hooks.on('PopOut:loaded', Cd100PopOutLoaded)
