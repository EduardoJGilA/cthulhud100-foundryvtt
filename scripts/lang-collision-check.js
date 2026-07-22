import * as fs from 'fs'
import * as path from 'path'

/**
 * Guard against a translation file that FoundryVTT will silently discard.
 *
 * Foundry runs every language file through expandObject(), which turns keys
 * such as "Cd100.Creature.LeatherySkin" into nested objects. If a shorter key
 * ("Cd100.Creature") already holds a string, the expansion tries to create a
 * property on that string and throws:
 *
 *   Cannot create property 'LeatherySkin' on string 'Creature'
 *
 * A single collision discards the WHOLE file, so every label in the system
 * renders as its raw key. It is silent at build time and only shows up in the
 * browser console, which makes it expensive to diagnose.
 *
 * Run with: npm run lang-check
 */

const langDir = path.join(process.cwd(), 'static', 'lang')
let failed = 0
let checked = 0

for (const file of fs.readdirSync(langDir).filter(f => f.endsWith('.json')).sort()) {
  const full = path.join(langDir, file)
  let data
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch (e) {
    console.error(`  ${file}: invalid JSON - ${e.message}`)
    failed++
    continue
  }
  checked++

  const keys = Object.keys(data)
  const collisions = []
  for (const key of keys) {
    const parts = key.split('.')
    for (let i = 1; i < parts.length; i++) {
      const prefix = parts.slice(0, i).join('.')
      if (typeof data[prefix] === 'string') {
        collisions.push(`"${prefix}" is a string but "${key}" needs it to be an object`)
      }
    }
  }

  if (collisions.length) {
    failed++
    console.error(`  ${file}: ${collisions.length} collision(s)`)
    for (const c of [...new Set(collisions)]) {
      console.error(`      ${c}`)
    }
  }
}

if (failed) {
  console.error(`\nlang-check FAILED: ${failed} of ${checked} file(s) would be discarded by Foundry.`)
  process.exit(1)
}
console.log(`lang-check passed: ${checked} language files expand cleanly.`)
