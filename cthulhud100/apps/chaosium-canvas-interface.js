/* global foundry */
export default class ChaosiumCanvasInterface extends foundry.data.regionBehaviors.RegionBehaviorType {
  /**
   * Action Options Key Name Pairs
   * @returns {object}
   */
  static get actionToggles () {
    return {
      [ChaosiumCanvasInterface.actionToggle.On]: 'Cd100.ChaosiumCanvasInterface.Actions.Show',
      [ChaosiumCanvasInterface.actionToggle.Off]: 'Cd100.ChaosiumCanvasInterface.Actions.Hide',
      [ChaosiumCanvasInterface.actionToggle.Toggle]: 'Cd100.ChaosiumCanvasInterface.Actions.Toggle'
    }
  }

  /**
   * Action Options Name Key Pairs
   * @returns {object}
   */
  static get actionToggle () {
    return {
      Off: 0,
      On: 1,
      Toggle: 2
    }
  }

  /**
   * Trigger Button Key Name Pairs
   * @returns {object}
   */
  static get triggerButtons () {
    return {
      [ChaosiumCanvasInterface.triggerButton.Left]: 'Cd100.ChaosiumCanvasInterface.Buttons.Left',
      [ChaosiumCanvasInterface.triggerButton.Right]: 'Cd100.ChaosiumCanvasInterface.Buttons.Right'
    }
  }

  /**
   * Trigger Button Name Key Pairs
   * @returns {object}
   */
  static get triggerButton () {
    return {
      Left: 0,
      Right: 2
    }
  }

  // static get icon (): string
  // static defineSchema (): object
  // async _handleMouseOverEvent (): boolean
  // [optional] async _handleLeftClickEvent (): void
  // [optional] async _handleRightClickEvent (): void
}
