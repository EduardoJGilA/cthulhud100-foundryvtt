/* global foundry game */
import Cd100Link from './link.js'

export default class Cd100Canvas {
  /**
   * Data dropped on canvas
   * @param {Canvas} canvas
   * @param {object} data
   * @param {DragEvent} event
   */
  static async onDropSomething (canvas, data, event) {
    if (['Cd100Link', 'Cd100GetToken', 'Cd100Locator'].includes(data.type)) {
      const gridSize = canvas.scene.grid.size
      const x = data.x - gridSize / 2
      const y = data.y - gridSize / 2
      const height = gridSize
      const width = gridSize
      let dropTargetTokens = canvas.tokens.placeables.filter(obj => {
        const c = obj.center
        return (
          Number.between(c.x, x, x + width) &&
          Number.between(c.y, y, y + height)
        )
      }) // Find drop target.
      if (!dropTargetTokens.length) {
        dropTargetTokens = canvas.tokens.controlled // If no target whisper to selected token
      }
      switch (data.type) {
        case 'Cd100Link':
          if (data.check === Cd100Link.CHECK_TYPE.EFFECT) {
            if (dropTargetTokens.length) {
              for (const token of dropTargetTokens) {
                Cd100Link._onLinkActorClick(token.actor, data)
              }
            }
          } else {
            const link = await Cd100Link.fromDropData(data)
            if (dropTargetTokens.length) {
              link.toWhisperMessage(dropTargetTokens.filter(t => t.actor.owners.length).map(t => t.actor))
            } else {
              link.toWhisperMessage(game.users.players.filter(u => !!u.character).map(u => u.character))
            }
          }
          break
        case 'Cd100GetToken':
          if (typeof data.appId === 'string' && typeof data.callback === 'string') {
            const app = foundry.applications.instances.get(data.appId)
            if (app && typeof app[data.callback] === 'function') {
              app[data.callback](dropTargetTokens)
            }
          }
          break
        case 'Cd100Locator':
          if (typeof data.appId === 'string' && typeof data.callback === 'string') {
            const app = foundry.applications.instances.get(data.appId)
            if (app && typeof app[data.callback] === 'function') {
              data.sceneUuid = canvas.scene.uuid
              app[data.callback](data)
            }
          }
          break
      }
    }
  }
}
