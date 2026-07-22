# Cthulhu d100 for Foundry VTT

An unofficial, independent open-source implementation of the **Cthulhu d100** roleplaying game rules (Three Fourteen Games, 2011) for [Foundry Virtual Tabletop](https://foundryvtt.com).

*Read this in other languages: [Español](README.es.md) | [English](README.md).*

---

## 📌 Overview

**Cthulhu d100** is a Spanish d100 Lovecraftian horror tabletop RPG ruleset based on GORE/OGL (Three Fourteen Games, 2011). This Foundry VTT system implements its core mechanics, compendiums, combat tables, and sanity systems.

### Compatibility Matrix
| System Version | Foundry VTT Version | Status |
|---|---|---|
| 0.1.0+ | **v14** (v14.364+) | Verified / Primary Target |
| 0.1.0+ | **v13** | Supported |
| 0.1.0+ | **v12** | Minimum Supported Version |

---

## 📦 Installation

To install in Foundry VTT:
1. Open the **Game Systems** tab in the Foundry VTT Setup menu.
2. Click **Install System**.
3. Paste the following manifest URL into the **Manifest URL** field at the bottom:
   ```text
   https://github.com/EduardoJGilA/cthulhud100-foundryvtt/releases/latest/download/system.json
   ```
4. Click **Install**.

---

## ✨ Features

- **Attributes & Derivations:** Characteristics on a 3–18 scale (`FUE`, `CON`, `DES`, `TAM`, `INT`, `POD`, `CAR`, `EST`). Automatic calculation of HP `ceil((TAM+CON)/2)`, MP (`POD`), Luck (`POD×5`), Idea (`INT×5`), and General Knowledge (`EST×5`).
- **Damage Modifier (MD):** 20-tier lookup table based on `FUE+TAM` ranging from `-1D8` to `+5D10`.
- **Success Levels & Dice Engine:** Standard d100 resolution with Critical (`top 5%` / `round(skill/20)`), Special (`top 20%` / `round(skill/5)`), Regular Success (`≤ skill`), Failure (`> skill`), and Fumble (`96–00`).
- **Dual Sanity System:** Support for both Classic Sanity (`POD×5`) and the Alternative Mental Stability system with 3 interactive tracking bars (`ceil/floor/ceil`, total `POD×1.5`), state modifiers, and underlying madness tracking.
- **Combat Resolution:** Integrated 5×5 Dodge and Parry cross-reference tables (§7), DEX-based initiative (3–18), range mechanics, impales, severe wounds, and location-based damage rules.
- **Localized Compendiums:** Complete Spanish compendiums for Skills (33 items in 5 categories with dynamic base formulas), Weapons (41 items), Occupations (10 professions), Severe Wounds, Sanity Losses, Arcanum Tomes (10 items), and Mythos Creatures (12 profiles).

For complete technical specifications, see [`dev-docs/reglas-cthulhu-d100.md`](dev-docs/reglas-cthulhu-d100.md).

---

## ⚖️ Legal Disclaimer / Aviso Legal

### English
- **Independent & Unofficial:** This project is an independent, community-driven open-source system. It is **not** affiliated with, endorsed, sponsored, or approved by Chaosium Inc., Edge Studio, Shadowlands, or any official publisher of Call of Cthulhu.
- **Trademarks:** "Call of Cthulhu" and "La Llamada de Cthulhu" are registered trademarks of Chaosium Inc. This project does not contain copyrighted ambient text, artwork, or modules from Call of Cthulhu 7th Edition or Chaosium publications.
- **Ruleset Source & Attribution:** This system implements mechanics from the **Cthulhu d100** ruleset published by Three Fourteen Games (2011). It is distributed non-commercially under explicit authorization from the Cthulhu d100 manual (*"Puede crearse material adicional utilizando el reglamento aquí presentado siempre que se haga referencia a la fuente original y que no se realice con afán de lucro"*).
- **Software License:** All code in this repository is distributed under the **GNU General Public License v3.0 (GPL-3.0)**, deriving from Cd100-FoundryVTT © Miskatonic Investigative Society. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).

### Español
- **Independiente y No Oficial:** Este proyecto es un sistema de código abierto independiente creado por la comunidad. **No** está afiliado, patrocinado, respaldado ni aprobado por Chaosium Inc., Edge Studio, Shadowlands ni ninguna editorial oficial de La Llamada de Cthulhu.
- **Marcas Registradas:** "Call of Cthulhu" y "La Llamada de Cthulhu" son marcas registradas de Chaosium Inc. Este proyecto no contiene texto de ambientación, arte ni módulos protegidos por derechos de autor de La Llamada de Cthulhu 7ª Edición o publicaciones de Chaosium.
- **Origen del Reglamento y Atribución:** Este sistema implementa las mecánicas del reglamento **Cthulhu d100** publicado por Three Fourteen Games (2011). Se distribuye sin ánimo de lucro al amparo de la autorización expresa del propio manual (*"Puede crearse material adicional utilizando el reglamento aquí presentado siempre que se haga referencia a la fuente original y que no se realice con afán de lucro"*).
- **Licencia de Software:** Todo el código de este repositorio se distribuye bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**, al ser un trabajo derivado de Cd100-FoundryVTT © Miskatonic Investigative Society. Consulta [`LICENSE`](LICENSE) y [`NOTICE.md`](NOTICE.md).

---

## 📄 License & Credits

- **Software Code:** GPL-3.0 (see [`LICENSE`](LICENSE)).
- **Legal Attributions & OGL:** See [`NOTICE.md`](NOTICE.md).
