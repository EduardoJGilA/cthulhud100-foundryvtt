/* global CONFIG */
import Cd100DecaderDie from '../apps/decader-die.js'
import Cd100DecaderDieOther from '../apps/decader-die-other.js'

export default function () {
  CONFIG.Dice.terms.t = Cd100DecaderDie
  CONFIG.Dice.terms.o = Cd100DecaderDieOther
}
