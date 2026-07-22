/* global game */
import { FOLDER_ID } from '../constants.js'
import Cd100EnableVariantRulesEn from '../tours/enable-variant-rules-en.js'
import Cd100EnableVariantRulesEs from '../tours/enable-variant-rules-es.js'
import Cd100EnableVariantRulesFr from '../tours/enable-variant-rules-fr.js'

export default function () {
  let lang = game.i18n.lang
  const tours = {
    en: {
      'enable-variant-rules': Cd100EnableVariantRulesEn
    },
    es: {
      'enable-variant-rules': Cd100EnableVariantRulesEs
    },
    fr: {
      'enable-variant-rules': Cd100EnableVariantRulesFr
    }
  }
  if (typeof tours[lang] === 'undefined') {
    lang = 'en'
  }
  for (const tourName in tours[lang]) {
    game.tours.register(FOLDER_ID, tourName, new tours[lang][tourName]())
  }
  if (lang !== 'en') {
    for (const tourName in tours.en) {
      if (typeof tours[lang][tourName] === 'undefined') {
        game.tours.register(FOLDER_ID, tourName, new tours.en[tourName]())
      }
    }
  }
}
