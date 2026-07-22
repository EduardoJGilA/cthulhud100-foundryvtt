import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Refuse to build while FoundryVTT is running against the target data path.
 *
 * The build rewrites the LevelDB compendium directories in place. Foundry opens
 * those databases once at startup and keeps the handles, so overwriting them
 * under a live server leaves it reading files that no longer exist:
 *
 *   Failed to connect to database "cthulhud100.system-doc": Database failed to open
 *
 * The system keeps working apart from anything that touches a compendium, which
 * makes it look like an unrelated bug - a compendium browser that opens empty,
 * or the "View System Manual" button doing nothing. Stopping Foundry first is
 * the only clean fix, so this refuses the build rather than silently corrupting
 * the packs.
 *
 * Set ALLOW_BUILD_WHILE_RUNNING=1 to bypass, for the case where the running
 * server points at a different data path.
 */

if (process.env.ALLOW_BUILD_WHILE_RUNNING === '1') {
  process.exit(0)
}

const configPath = path.join(process.cwd(), 'fvtt.config.json')
if (!fs.existsSync(configPath)) {
  process.exit(0)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const selection = config[config.currentSelection]
const target = typeof selection === 'string' ? selection : Object.values(selection ?? {})[0]
if (!target) {
  process.exit(0)
}

let processes = ''
try {
  processes = execSync('ps -eo pid,args', { encoding: 'utf8' })
} catch {
  process.exit(0)
}

const running = processes
  .split('\n')
  .filter(line => /resources\/app\/main\.js/.test(line))
  .map(line => line.trim())

if (running.length === 0) {
  process.exit(0)
}

console.error('\n  FoundryVTT is running.\n')
for (const line of running) {
  console.error('    ' + line)
}
console.error(`
  The build rewrites the LevelDB packs in ${target}/Data/systems/, and Foundry
  holds those databases open from startup. Overwriting them now would break every
  compendium in the running world until it is restarted.

  Stop Foundry, run the build, then start it again.

  If that server uses a different data path, re-run with:
    ALLOW_BUILD_WHILE_RUNNING=1 npm run build
`)
process.exit(1)
