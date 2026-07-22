import Cd100RenderChatMessageHTML from './render-chat-message-html.js'

/**
 * Render Hook
 * @deprecated FoundryVTT v12
 * @param {ChatMessage} message
 * @param {jQuery} html
 * @param {any} messageData
 */
export default function (message, html, messageData) {
  Cd100RenderChatMessageHTML(message, html[0], messageData)
}
