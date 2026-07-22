import Cd100DecaderDie from './decader-die.js'

export default class Cd100DecaderDieOther extends Cd100DecaderDie {
  /**
   * @inheritdoc
   */
  static get DENOMINATION () {
    return 'o'
  }
}
