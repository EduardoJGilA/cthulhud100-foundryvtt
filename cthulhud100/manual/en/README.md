# Cthulhu d100 System Documentation for Foundry VTT

This system implements the **Cthulhu d100** roleplaying game rules (Three Fourteen Games, 2011), based on GORE/OGL.

## Rules Overview

- **Characteristics (3-18):** `STR`, `CON`, `DEX`, `SIZ`, `INT`, `POW`, `APP`, `EDU`.
- **Derived Values:**
  - **Hit Points (HP):** `ceil((SIZ+CON)/2)`
  - **Magic Points (MP):** `POW`
  - **Luck:** `POW × 5` (derived attribute, not expendable)
  - **Idea Check:** `INT × 5`
  - **General Knowledge (Know):** `EDU × 5`
  - **Damage Modifier (DB):** 20-tier lookup table based on `STR+SIZ` (`-1D8` to `+5D10`).
- **Success Levels:**
  - **Critical:** Top 5% (`round(skill / 20)`).
  - **Special:** Top 20% (`round(skill / 5)`).
  - **Success:** `≤ skill`.
  - **Failure:** `> skill`.
  - **Fumble:** Always `96–00`.
- **Sanity Systems:**
  - **Classic:** Mental Stability pool (`POW × 5`).
  - **Alternative:** 3 tension bars (`ceil/floor/ceil`, total `POW × 1.5`), underlying madness tracking, and state modifiers sharpening Action skills (+10%) while blunting others (-10%).
- **Combat:** 5×5 Dodge and Parry cross-reference tables (§7), DEX-based initiative (3-18), impales, severe wounds (>50% HP in one hit), and optional hit location rules.

## License & Legal Attributions

- **Code License:** GPL-3.0 (forked from Cd100-FoundryVTT © Miskatonic Investigative Society).
- **Ruleset:** Cthulhu d100 © 2011 Three Fourteen Games, used non-commercially under explicit manual authorization.
- **System Origin:** GORE © Daniel Proctor, OGL.
