# Plan de implementación — Cthulhu d100 para Foundry VTT v14

> **Documento de traspaso.** Está escrito para que cualquier persona o IA pueda retomar
> el trabajo sin contexto previo. Marca las casillas `[x]` conforme se completen tareas y
> añade notas bajo cada una si el resultado difiere de lo previsto.
>
> **Última actualización:** 2026-07-22 · **Fase actual:** spec completa; lógica F1-F4 y ambos sistemas de cordura hechos; 10 compendios coherentes. Falta: interfaz (chat cards), F5, F0.5

---

## 0. Contexto imprescindible

### Qué se está construyendo

Un sistema de juego para Foundry VTT que implementa **Cthulhu d100** (Three Fourteen
Games, 2011), un reglamento español de los Mitos de Cthulhu basado en GORE/OGL.

La especificación funcional completa del reglamento está en
[`dev-docs/reglas-cthulhu-d100.md`](./reglas-cthulhu-d100.md). **Ese documento es la fuente de
verdad para toda decisión de reglas.** Fue extraído del PDF original y contiene todas las
tablas, fórmulas y mecánicas. Si una regla no está ahí, hay que volver al PDF (52 páginas,
faltan por extraer los capítulos 9 "Criaturas" pp. 38-43 y 10 "Tomos arcanos" pp. 44-45).

### Punto de partida y decisiones ya tomadas

| Decisión | Valor | Motivo |
|---|---|---|
| Base del código | **Fork de CoC7-FoundryVTT 8.14** | Ya soporta Foundry v12-v14, LevelDB, UI moderna, mantenimiento activo |
| Licencia | **GPL-3.0 (obligatoria)** | Upstream es GPL-3; es copyleft, todo derivado hereda |
| Idiomas | **Multilingüe**, inglés por defecto | Upstream trae 15 idiomas |
| Rama de trabajo | `develop` | |
| Fork anterior | rama `legacy/2020-fork-ia-attempt` | Snapshot del intento previo, commit `712e752` |

### Por qué NO se porta el fork actual

El árbol actual de `develop` es CoC7 `0.3.7`, commit de **diciembre 2020**, era Foundry
`0.7.x`. Inventario de deuda medido:

- 445 llamadas a APIs eliminadas (`entityClass`, `.data.data`, `createEmbeddedEntity`…)
- 13 clases `ApplicationV1` (`ActorSheet`, `ItemSheet`, `Dialog`, `FormApplication`)
- 45 plantillas `.html` basadas en jQuery
- Compendios en NeDB (`.db`), formato eliminado en Foundry v11
- 48 usos de `Roll` síncrono, prohibido desde v9
- `tinyMCE`, sustituido por ProseMirror en v13

Portarlo cuesta más que forkear upstream y perder las mejoras de 6 años.

### ⚠️ Nota legal — leer antes de tocar `LICENSE` o `README`

1. **La licencia MIT no es una opción.** El código deriva de CoC7-FoundryVTT, que es
   GPL-3.0 (`LICENSE`, y cabecera en `module/coc7.js:4`). La GPL-3 es copyleft: todo
   trabajo derivado debe distribuirse bajo GPL-3. Relicenciar a MIT sería relicenciar
   código ajeno sin permiso de sus autores.
2. **No negar el uso de Cthulhu d100.** El proyecto *es* una implementación de ese
   reglamento y `dev-docs/reglas-cthulhu-d100.md` contiene sus tablas. El PDF autoriza
   expresamente crear material derivado: *"Puede crearse material adicional utilizando el
   reglamento aquí presentado siempre que se haga referencia a la fuente original y que no
   se realice con afán de lucro."* Las reglas base son OGL (derivadas de GORE). Lo correcto
   es **atribuir**, no negar.
3. **Sí distanciarse de Chaosium.** Cero relación con *Call of Cthulhu* 7ª Ed., Chaosium
   Inc., Edge Studio o Shadowlands. Ningún texto, arte ni módulo de esas fuentes.
4. **No empaquetar arte ni texto de ambientación** del PDF de Cthulhu d100. Solo
   mecánicas, nombres de habilidades y valores numéricos.

### Entorno

- Directorio de trabajo: `/mnt/storage/FoundryModulesDev/cthulhud100-foundryvtt`
- Remoto: `https://github.com/EduardoJGilA/cthulhud100-foundryvtt`
- Copia de upstream 8.14 para consulta: clonar con
  `git clone --depth 1 --branch 8.14 https://github.com/Miskatonic-Investigative-Society/CoC7-FoundryVTT`
- Foundry **14.364.0** en `/mnt/storage/foundry`, servidor en el puerto 30000
- `dataPath`: **`/mnt/storage/foundryuserdata`** → el sistema se despliega en
  `/mnt/storage/foundryuserdata/Data/systems/cthulhud100`
- `fvtt.config.json` (en `.gitignore`, por desarrollador) selecciona el destino del build.
  Perfiles: `v14` (por defecto) y `v13`. Regenerable con `npm run init`.
- Orden de build: `npm install` → `compendiums-build` → `manuals-build` →
  `roll-requests-build` → `build`. Los tres primeros son obligatorios: `build` aborta si
  no encuentra `binary-packs/system-doc/LOCK` y `binary-packs/roll-requests/LOCK`.

### Arquitectura de upstream 8.14 (referencia de rutas)

```
static/system.json          ← manifiesto FUENTE (webpack lo copia a la build)
static/templates/           ← 136 plantillas .hbs (items/ actors/ apps/ chat/ common/)
static/lang/                ← 15 idiomas: en fr es de ja cn pl pt-BR zh-TW sv cs ko it ru uk
static/assets/              ← iconos, imágenes, arte, manual
static/lib/game-icons/
styles/*.less               ← 16 hojas LESS, entrada coc7-index.less
compendiums/*.yaml          ← fuente de compendios; scripts/compendiums-build.js → LevelDB
scripts/                    ← compendiums-build, game-icons-build, init, manuals-build,
                              roll-requests-build, translations-check, webpack-config
cthulhud100/system.js              ← punto de entrada ESM
cthulhud100/constants.js
cthulhud100/models/actor/          ← global-system.js, character-system.js, npc-system.js,
                              creature-system.js, vehicle-system.js, container-system.js,
                              document-class.js (157 KB), sheets v2/v3
cthulhud100/models/item/           ← skill, weapon, armor, spell, book, occupation, archetype,
                              talent, setup, status, chase, experience-package
cthulhud100/models/active-effect/
cthulhud100/models/fields/
cthulhud100/apps/                  ← check.js (1233 líneas), dice-pool.js, chat-combat-melee.js,
                              chat-combat-ranged.js, san-check-card.js, roll-dialog.js…
cthulhud100/hooks/
cthulhud100/setup/
cthulhud100/tours/
cthulhud100/manual/
```

Build: `npm install` → `npm run build` (webpack, modo producción) o `npm run watch`.

### Divergencias clave CoC7 → Cthulhu d100

Esta tabla resume dónde duele. Detalle completo en `dev-docs/reglas-cthulhu-d100.md`.

| Área | CoC7 | Cthulhu d100 | Punto de ataque |
|---|---|---|---|
| Atributos | percentil (3d6×5) | **escala 3-18** | `cthulhud100/models/actor/global-system.js:120` |
| Niveles de éxito | regular / hard `/2` / extreme `/5` / crit `01` | éxito / **especial `/5`** / **crítico `/20`** | `cthulhud100/apps/dice-pool.js:1325` `#populateThresholdRanges()` |
| Pifia | 96 si umbral <50, si no 100 | **siempre 96-00** | `cthulhud100/apps/dice-pool.js:1293` |
| PV | `(SIZ+CON)/10` | `ceil((TAM+CON)/2)` | `character-system.js` |
| PM | `POW/5` | `POD` | `character-system.js` |
| Suerte | reserva propia tirada | **derivada** `POD×5` | `character-system.js` |
| MD | tabla DB percentil | tabla por `FUE+TAM`, 20 tramos, `-1D8`→`+5D10` | nueva tabla |
| Cordura | SAN única | **dos sistemas seleccionables**; el "alternativo" no tiene equivalente | módulo nuevo |
| Combate | tirada enfrentada | **tablas cruzadas 5×5** Esquiva/Bloqueo | `chat-combat-melee.js`, `-ranged.js` |
| Iniciativa | DEX percentil | **DES 3-18** | `cthulhud100/apps/` combat |
| Habilidades | lista CoC7 | lista distinta, 5 categorías | compendio nuevo |
| Armas | campos CoC7 | + `PR`, `empalar`, `bloquear`, `disfunción` | `weapon-system.js` |

---

## Convenciones de trabajo

- **Un commit por tarea** completada, mensaje en inglés, Conventional Commits.
- **Nunca** añadir líneas `Co-Authored-By:` de IA ni ninguna otra marca de autoría
  automática. El autor de los commits es el propietario del repositorio.
- **No** hacer push ni abrir PR salvo petición explícita del usuario.
- Antes de cerrar una fase, ejecutar su bloque "Criterio de aceptación" completo.
- Si una tarea revela que el plan está equivocado, **actualizar este documento** en el
  mismo commit.
- Los identificadores de tarea (`F1.3`) son estables: úsalos al referirte al trabajo.

---

## 🧪 Checklist de la primera prueba en Foundry

Todo lo hecho hasta ahora está validado con `eslint`, `webpack` y scripts contra las
tablas del manual. **Nada se ha ejecutado dentro de Foundry todavía.**

### Antes de abrir Foundry

```bash
npm run build          # despliega en /mnt/storage/foundryuserdata/Data/systems/cthulhud100
```

Foundry solo escanea `Data/systems/` **al arrancar**. Hay que reiniciar el servidor
(PID del proceso `node /mnt/storage/foundry/resources/app/main.js`).

### Qué comprobar, en orden

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | Crear mundo con el sistema `Cthulhu d100` | Aparece en la lista de sistemas |
| 2 | Consola del navegador (F12) al cargar | Sin errores rojos. Avisos de deprecación anotarlos, no bloquean |
| 3 | Crear un actor de tipo personaje | La ficha abre |
| 4 | Tirar características | Valores **3-18**, no percentiles. TAM e INT entre 8 y 18; EST entre 6 y 21 |
| 5 | Etiquetas de la ficha | FUE CON TAM DES **CAR** INT POD **EST** (en español) |
| 6 | Poner CON 12, TAM 14 | **PV = 13** (`ceil(26/2)`) |
| 7 | Poner POD 14 | **PM = 14** · **Suerte = 70** · Estabilidad Mental (clásica) = 70 |
| 8 | Poner INT 14 | **Idea = 70**. El tooltip debe decir Especial 14, Crítico 4 |
| 9 | Poner FUE 11, TAM 12 | **MD = 0**. Con FUE 13 / TAM 14 (=27) debe dar **+1D2** |
| 10 | Tirar una habilidad al 50% | Crítico `01-03`, Especial `04-10`, Éxito `11-50`, Fallo `51-95`, Pifia `96-00` |
| 11 | Tirar una habilidad al 8% | Especial `01-02`, sin banda de crítico separada |
| 12 | Carta de chat de una tirada | Dice "Éxito especial", nunca "Éxito difícil" |
| 13 | Iniciativa en combate | Orden por DES cruda (3-18), sin el `+50` por arma de fuego |

### Problemas conocidos — no reportar como nuevos

- **La Suerte no se puede gastar.** Es derivada (`POD×5`) y se recalcula en cada
  `prepare`, así que los botones de gasto de CoC7 no persisten nada. Falta retirarlos
  de la interfaz (F1.3).
- **El selector de dificultad sigue ofreciendo Difícil/Extremo.** `difficultyLevel`
  aún es el de CoC7; en d100 la dificultad se aplica con modificadores ±10/20% (F1.6).
- **Las habilidades y armas son las de CoC7.** Los compendios propios son F2.
- **La cordura es la de CoC7.** Los dos sistemas del manual son F3.
- **El combate es el de CoC7.** Tablas cruzadas de Esquiva/Bloqueo, empalar y
  localización de impactos son F4.
- **13 idiomas conservan los nombres de CoC7** para CAR y EST. Solo español e inglés
  están renombrados.
- **Corpulencia (Build) sigue existiendo.** No es un concepto de d100.
- **Persecuciones, arquetipos, eras y paquetes de experiencia** son funciones de
  upstream ajenas a d100; siguen presentes y sin adaptar.

---

## F0 — Bootstrap del fork

**Objetivo:** que el sistema, sin ninguna regla cambiada, arranque en Foundry v14 con el
identificador y la marca de Cthulhu d100. Ninguna mecánica se toca en esta fase.

**Criterio de aceptación de la fase:** se puede crear un mundo en Foundry v14 con el
sistema `cthulhud100`, abrir una ficha de personaje y hacer una tirada sin errores en la
consola del navegador.

### F0.1 — Preparar el árbol ✅ commit `995e352`
- [x] Confirmar que `develop` está limpio y que existe la rama `legacy/2020-fork-ia-attempt`
      (`git branch -a`, `git log legacy/2020-fork-ia-attempt -1` → `712e752`)
- [x] Crear rama de trabajo `feat/upstream-8.14-rebase` desde `develop`
- [x] Borrar del árbol todo el código del fork de 2020
- [x] Copiar el árbol completo de upstream 8.14 (excepto `.git/`)
- [x] Conservar de nuestro repo: documentos propios y `.gitignore`
- [x] `git add -A && git commit`

> **Nota:** el `.gitignore` del fork viejo ignoraba `package.json`, incompatible con el
> build de webpack. Se adoptó el de upstream. El tooling de sesión (`.agents/`, `.claude/`,
> `skills-lock.json`) se añadió al `.gitignore` en vez de commitearse.
> Resultado: 876 archivos, +128 305 / -39 036 líneas.

### F0.2 — Renombrar el sistema ✅ commit `2aea6c0`
- [x] `static/system.json`: `id` de `CoC7` → `cthulhud100`
- [x] `static/system.json`: `title` → `Cthulhu d100`, `description`, `version` → `0.1.0`,
      `authors`, `url`, `manifest`, `download` apuntando a `EduardoJGilA/cthulhud100-foundryvtt`
- [x] Sustituir `systems/CoC7/` → `systems/cthulhud100/` (277 ocurrencias en 32 archivos:
      `.hbs`, `.less`, `.yaml`, `.js`, `.json`)
- [x] **Decisión tomada: se mantiene el namespace JS `CoC7`** y las claves i18n `CoC7.*`.
      Son identificadores de traducción, no scopes; renombrarlos tocaría los 15 archivos
      de idioma sin ganancia.
- [x] `package.json`: `name` → `fvtt-cthulhud100`, versión, autor, repo, bugs, homepage
- [x] Compendios: `flags.CoC7` → `flags.cthulhud100` (254 claves) y
      `documentCollection: 'CoC7.*'` → `'cthulhud100.*'` en `compendiums/*.yaml`

> **Hallazgo crítico:** el id del paquete es el *scope* que Foundry valida para
> `game.settings` y para los flags de documento. Está centralizado en `FOLDER_ID`
> (`cthulhud100/constants.js:4`, 1350 usos en 121 archivos). Además había **13 literales
> `'CoC7'`** sueltos usados como scope en `document-class.js`, `render-chat-message-html.js`,
> `combat.js`, `delayed-tooltip.js` y `clickable-events.js`; ahora usan `FOLDER_ID`.
>
> **Renombrado obligado del directorio fuente:** `scripts/webpack-config.js:96-99` resuelve
> el entry point de webpack como `<folderId.toLowerCase()>/system.js`. Con el id nuevo
> buscaba `cthulhud100/system.js`, así que `coc7/` → `cthulhud100/` (`git mv`).
>
> **`grid` cambiado a metros** (`{distance: 1.5, units: 'm'}`): el manual expresa todos
> los alcances en metros, no en pies.

### F0.3 — Compilar ✅ commit `2aea6c0`
- [x] `npm install` — 502 paquetes
- [x] `npm run eslint` limpio
- [x] `npm run compendiums-build` → 7 packs (103 habilidades, 50 armas, 22 fobias…)
- [x] `npm run manuals-build` + `npm run roll-requests-build` → `binary-packs/`
- [x] `npm run build` correcto; solo avisos de tamaño de bundle, heredados de upstream

> **Bug de upstream corregido:** `scripts/webpack-config.js` importa `terser-webpack-plugin`
> pero `package.json` no lo declara y `package-lock.json` está en `.gitignore`, así que
> ninguna instalación limpia podía compilar. Añadido a `devDependencies`.
>
> **`docs/` es directorio de salida** de `manuals-build` (genera `docs/en/`, `docs/es/`…).
> Los documentos del proyecto se movieron a **`dev-docs/`** para que el build no los pise.
>
> **Vulnerabilidad conocida sin fix:** `decompress` (crítica, zip-slip, GHSA-mp2f-45pm-3cg9).
> Es `devDependency` de `scripts/init.js`, no se empaqueta en la distribución. Aceptada.

### F0.4 — Verificar en Foundry v14 🟡 bloqueado: requiere reiniciar Foundry
- [x] Localizar la instalación de Foundry
- [x] Desplegar la build en `Data/systems/cthulhud100`
- [x] Validación estática del manifiesto desplegado: **PASS**
      (campos obligatorios, 9 packs LevelDB con `CURRENT`, 15 idiomas con JSON válido,
      `esmodules` y `styles` existentes en disco)
- [x] Verificado el contenido de los packs: flags con scope `cthulhud100`, rutas de imagen
      reescritas a `systems/cthulhud100/assets/…`
- [x] Cero referencias obsoletas a `systems/CoC7` en `system.js` y `system.css` compilados
- [ ] **Reiniciar Foundry** para que escanee el sistema nuevo (escanea solo al arrancar)
- [ ] Crear un mundo de prueba, abrir ficha de personaje, lanzar una tirada
- [ ] Consola del navegador sin errores ni avisos de deprecación bloqueantes

> **Entorno detectado:**
> - Foundry **14.364.0** (stable, build 364, node 24) en `/mnt/storage/foundry`
> - Servidor **en ejecución**, PID 2217, puerto 30000, arrancado el 18-jul
> - `dataPath` activo: **`/mnt/storage/foundryuserdata`** (mundos con `coreVersion 14.364`)
> - `/mnt/storage/foundryuserdatav13` es un snapshot antiguo (v12/v13), **no usarlo**
> - `fvtt.config.json` creado con perfiles `v14` (por defecto) y `v13`; está en `.gitignore`
>   porque es configuración por desarrollador
>
> Foundry solo escanea `Data/systems/` al arrancar. **No se reinició el servidor** porque
> desconectaría a cualquier jugador conectado: requiere autorización del usuario.

### F0.5 — Documentación legal y README

Sustituye la petición original de licencia MIT, que es inviable (ver §0, Nota legal).

- [ ] `LICENSE`: mantener el texto GPL-3.0 de upstream. **No sustituir por MIT.**
- [ ] `NOTICE.md` nuevo, con las atribuciones:
      - CoC7-FoundryVTT © Miskatonic Investigative Society, GPL-3.0 — código base
      - *Cthulhu d100* © 2011 Three Fourteen Games — reglamento, usado con el permiso
        expreso del manual, sin ánimo de lucro
      - GORE © Daniel Proctor, OGL — sistema de origen
      - Texto íntegro de la OGL 1.0a y de la GORE Trademark License (PDF, pp. 46-48)
- [ ] `static/system.json`: añadir `"license": "LICENSE"` y `"readme": "README.md"`
      (el campo `license` de Foundry es **una ruta o URL**, no un identificador SPDX)
- [ ] `README.md` en **inglés**, con:
      - qué es el sistema y qué reglamento implementa
      - estado del proyecto y matriz de compatibilidad con Foundry
      - instalación (URL del manifiesto)
      - resumen de funcionalidades por fase
      - enlace a `README.es.md` y a `dev-docs/reglas-cthulhu-d100.md`
      - sección **"⚖️ Legal Disclaimer / Aviso Legal"** bilingüe EN/ES
- [ ] `README.es.md` en **español**, mismo contenido
- [ ] Texto del disclaimer, corregido respecto al borrador original:
      - ✅ sistema independiente, no oficial, de código abierto
      - ✅ sin texto literal, arte, módulos ni material con copyright de **Call of Cthulhu
        7ª Ed., Chaosium Inc., Edge Studio ni Shadowlands**
      - ✅ "Call of Cthulhu" / "La Llamada de Cthulhu" es marca registrada de Chaosium Inc.;
        el proyecto no está afiliado, patrocinado, respaldado ni aprobado por ellos
      - ✅ implementa el reglamento *Cthulhu d100* de **Three Fourteen Games**, con
        atribución y sin ánimo de lucro, según el permiso del propio manual
      - ✅ código bajo **GPL-3.0**, no MIT
      - ❌ **no** afirmar que no contiene mecánicas de Cthulhu d100: sería falso

---

## F1 — Núcleo de dados y atributos

**Objetivo:** que toda tirada del sistema resuelva con las reglas de Cthulhu d100.
Es la fase de mayor rendimiento por línea tocada.

**Criterio de aceptación:** una ficha con FUE 11 / TAM 12 muestra MD `0`; una habilidad al
50% produce Crítico con `01-03`, Especial con `04-10`, Éxito con `11-50`, Fallo con `51-95`
y Pifia con `96-00`.

> **Corregido dos veces.** La primera redacción decía Crítico `01-02`, deducido de
> `floor(50/20)`. Es incorrecto: la tabla "Probabilidades de éxitos extra" (PDF pág. 6)
> da Crítico 3 para el tramo 50-52%. El manual **redondea al más cercano**, no trunca.
>
> La segunda decía "FUE 13 / TAM 14 → MD `0`". También incorrecto: `13+14 = 27`, que cae
> en el tramo 26-30 → `+1D2`. Para MD `0` hace falta `FUE+TAM` entre 21 y 25.
>
> **Lección:** no escribir criterios de aceptación de memoria. Calcularlos contra las
> tablas de `reglas-cthulhu-d100.md` y verificarlos con un script.

### F1.1 — Atributos en escala 3-18 🟡 parcial, commit `cabd15c`
- [x] **Decisión tomada: se mantienen las claves internas** `str con dex siz int pow app edu`.
      Solo cambian etiquetas, fórmulas y la escala. `document-class.js` (157 KB) intacto.
- [x] Fórmulas por defecto en `models/item/setup-system.js:29-41`:
      `str con dex pow app` → `3D6`; `siz int` → `2D6+6`; `edu` (EST) → `3D6+3`.
      Se elimina el `*5` de CoC7.
- [x] Constante `CHARACTERISTIC_MULTIPLIER = 5` en `cthulhud100/constants.js`
- [x] Aplicada en los tres sitios que convierten característica → umbral de tirada:
      `apps/check.js:723` (rama `type.characteristic`), `apps/con-check.js:86`,
      `apps/san-check-card.js:450` (chequeo de Idea)
- [ ] **Auditar el resto de sitios** que asumen que la característica ya es un porcentaje.
      Sospechosos localizados y sin revisar:
      - `apps/chase-participant-dialog.js:315,320` (DES y CON en persecuciones)
      - `apps/chat-combat-ranged.js:151` — `dex.value / 15` es la regla de alcance a
        quemarropa de CoC7; en d100 es `DES×3` metros (ver §7 del reglamento)
      - `apps/actor-importer.js:647`
      - `models/actor/document-class.js` — buscar `characteristics` y `.value`
- [ ] Validación: atributo <4 (salvo CAR) → marca de "inválido"; atributo a 0 → muerte;
      INT o POD a 0 → estado vegetativo
- [ ] Etiquetas en los 15 `static/lang/*.json`: FUE, CON, DES, TAM, INT, POD, CAR, EST
      (traducidas por idioma; el inglés puede conservar STR/CON/DEX/SIZ/INT/POW/APP/EDU)
- [ ] Revisar la ficha: los campos de característica deben aceptar 3-18 y mostrar el
      porcentaje derivado (`valor × 5`) junto al valor

> **Ojo al migrar:** cualquier actor creado antes de este cambio tiene las características
> guardadas como percentiles. No hay usuarios todavía, así que no se escribe migración,
> pero si aparecen mundos de prueba hay que recrear los actores.

### F1.2 — Niveles de éxito ✅
- [x] `successLevel` redefinido a `fumble(-99) / failure(0) / regular(1) / special(2) /
      critical(3)`; desaparece `hard`
- [x] `#populateThresholdRanges()`: `crítico = max(1, round(hab/20))`,
      `especial = max(1, round(hab/5))`, `éxito = hab`
- [x] `#minimumFumbleFromThreshold()`: pifia **siempre** 96, condición `<50` eliminada
- [x] `01` → crítico automático (por el `max(1, …)`); `00` → pifia (cae en `[96,100]`)
- [x] Renombrado `isExtremeSuccess` → `isSpecialSuccess`; `isHardSuccess` eliminado
      (6 sitios JS + 4 plantillas `.hbs`)
- [x] Referencias corregidas en `combat.js`, `chat-damage.js`, `chat-opposed-message.js`
- [x] CSS: `.extreme-success` → `.special-success`; `.hard-success` y `.success-hard`
      eliminados de `coc7-all.less`, `coc7-v12.less`, `coc7-chat-message.less`
- [x] Claves i18n `CoC7.SpecialSuccess` y `CoC7.RollDifficultySpecial` añadidas y
      traducidas en los 15 idiomas
- [x] `npm run eslint` limpio, `npm run build` correcto

> **El manual redondea, no trunca.** Verificado con un script contra las 24 filas de la
> tabla de la pág. 6: los 100 valores de 1% a 100% coinciden usando
> `Math.round`. Con `Math.floor` fallaban la mayoría de las filas.
>
> **Pendiente:** `difficultyLevel` todavía conserva `hard`/`extreme` (20 referencias cada
> uno). Es un concepto distinto —la dificultad *solicitada* de una tirada— y en d100 no
> existe: la dificultad se aplica con modificadores de circunstancia ±10/20%. Podarlo
> queda como tarea de F1.6.

### F1.3 — Características derivadas 🟡 parcial
- [x] `Idea = INT×5` y `Cultura General = EST×5` en `models/actor/global-system.js:289-300`.
      `check.js` lee `config.idea` / `config.know` como umbral directo, así que el
      multiplicador se aplica **aquí y no allí** — cuidado con duplicarlo.
- [x] `Suerte = POD×5` derivada en `attribs.lck.value`
- [x] `PV = ceil((TAM+CON)/2)` en `document-class.js hpFromCharacteristics()`
- [x] `PM = POD` en `document-class.js mpFromCharacteristics()`
- [ ] **Neutralizar el gasto de Suerte de CoC7.** En d100 la Suerte no es una reserva
      gastable. Sigue cableado: `luckSpendAbilities` en `character-system.js:190`,
      `luckAvoidUnconsciousness`, los botones de "push" con suerte en las cartas de chat
      y `apps/roll-normalize.js`. Como la Suerte se recalcula en cada `prepare`, gastarla
      **no persiste**: el botón existe y no hace nada.
- [x] Inconsciencia con 1-2 PV; 0 PV es herida mortal (`UNCONSCIOUS_HP_THRESHOLD`)
- [ ] La **Suerte deja de ser una reserva gastable** y pasa a ser derivada. Localizar y
      neutralizar el sistema de gasto de Luck de CoC7 (`luck` en `character-system.js`,
      `roll-normalize.js`, botones de "push" con suerte)
- [ ] `PV = ceil((TAM+CON)/2)`
- [ ] `PM = POD`; los PM por encima del tope se usan pero no se regeneran
- [ ] Inconsciencia con 1-2 PV; recupera consciencia con ≥3

### F1.4 — Modificador al Daño 🟡 parcial
- [x] Tabla de **20** tramos por `FUE+TAM` en `document-class.js dbFromCharacteristics()`
      (el plan decía 19; son 20 contando el tramo neutro `21-25 → 0`)
- [x] Verificada con script: los 200 valores de `FUE+TAM` 1-200 coinciden con la tabla
      de la pág. 11
- [x] **Corregido un bug propio:** `dbFromCharacteristics()` devolvía positivos con signo
      (`'+1D2'`), pero `chat-damage.js:366` antepone `+` salvo que el valor empiece por
      `-`. Todo MD positivo generaba `'++1D2'`, fórmula inválida. Ahora los positivos van
      sin signo, que es la convención que esperan los consumidores.
- [x] **La aplicación diferenciada ya existe en el motor**, no hay que programarla: las
      propiedades `addb` (MD completo) y `ahdb` (mitad, vía `CoC7Utilities.halfDB()`) del
      item de arma la controlan. `halfDB` reduce el tamaño del dado y maneja negativos
      (`-1D8` → `-1D4`), así que sirve para los tramos de penalización de d100.
- [ ] Es por tanto **tarea de datos (F2)**: marcar `addb` en cuerpo a cuerpo y desarmado,
      `ahdb` en arrojadizas, y **ninguna de las dos** en armas de fuego

> A diferencia de CoC7, en d100 **no hay penalizadores planos**: los tramos bajos son
> dados que se restan (`-1D8` … `-1D2`), no `-1` / `-2`. `dbFromCharacteristics()`
> devuelve cadenas con signo (`'-1D8'`, `'+2D6'`) y el número `0` en el tramo neutro.
> Verificar que los consumidores de `attribs.db.value` toleran el signo al construir
> la fórmula de daño.
>
> **`buildFromCharacteristics()` sigue con la lógica de CoC7.** La Corpulencia (Build) no
> existe en d100. Decidir en F4 si se elimina o se deja inerte.

### F1.5 — Chequeos enfrentados 🟡 núcleo hecho, falta la interfaz
- [x] Fórmula `50 + (activo - pasivo) × 5`, acotada a `[0,100]`, en
      `apps/utilities.js CoC7Utilities.resistanceChance()`
- [x] `+10` o más → automático; `-10` o menos → imposible (sale solo del acotado)
- [x] Verificada con script contra las 21 filas de la tabla del manual
- [ ] Diálogo para elegir Factor Activo y Factor Pasivo (atributos, o POT de veneno
      o enfermedad, que van de 3 a 21)
- [ ] Carta de chat propia con el porcentaje resultante y la tirada

> **Comprobado: upstream no tiene nada reutilizable.** `apps/chat-opposed-message.js`
> (1200+ líneas) resuelve enfrentamientos **comparando niveles de éxito** de dos tiradas
> de habilidad, que es el modelo de CoC7. El chequeo enfrentado de d100 es la tabla de
> resistencia clásica de BRP: una sola tirada contra un porcentaje calculado a partir de
> la diferencia entre dos puntuaciones. No hay `50 +` ni tabla de resistencia en todo el
> árbol (`grep` sin resultados).
>
> Conclusión: hay que escribirlo de cero. `chat-opposed-message.js` sirve como **modelo
> de estructura** (cómo se crea y actualiza una carta de chat con varios participantes),
> no como base a modificar.
>
> Consumidores que lo necesitarán: Presa (FUE vs FUE, §7), venenos y enfermedades
> (POT vs CON, §8).

### F1.6 — Modificadores de circunstancia e iluminación 🟡 parcial
- [x] Circunstancias `+20 / +10 / 0 / -10 / -20` en `apps/roll-dialog.js`, con las cinco
      claves i18n traducidas a los 15 idiomas
- [x] El selector de dificultad ya **no ofrece** Difícil ni Extremo: en d100 no existen
- [ ] `difficultyLevel` conserva el enum de CoC7 (113 referencias en 13 archivos,
      entrelazado con el gasto de Suerte). Solo se podó la interfaz; podar el enum es
      una tarea aparte y arriesgada
- [ ] Falta cablear el modificador elegido a `flatThresholdModifier`
- [ ] Iluminación: penumbra `×1/2`, oscuridad casi total `×1/4`, oscuridad total `×1/4`
      con tope `min(POD×3, INT×3)`

---

## F2 — Habilidades, armas y profesiones

**Objetivo:** compendios propios que sustituyan por completo a los de CoC7.

**Criterio de aceptación:** crear un investigador desde cero usando solo los compendios del
sistema, con reparto de `EST×20` + `INT×10` puntos.

### F2.1 — Compendio de habilidades ✅ commit `11c3c82`
- [x] Borrado `compendiums/en-skills.yaml`, creado `compendiums/es-skills.yaml`
      (+ traducciones) con las 5 categorías de `dev-docs/reglas-cthulhu-d100.md` §5:
      Conocimientos, Vocacionales, Sensoriales, Sociales, De acción
- [x] 33 habilidades en las 5 categorías, formato de upstream respetado
- [x] Las 7 que requieren especialización marcadas con `requiresname`
- [x] Bases derivadas como **fórmulas** resueltas contra el actor: `@edu+@app`,
      `@edu*2`, `@dex*2`, `@dex+@str`. Se resuelven vía `parsedValues()` en
      `apps/utilities.js:938`, claves en minúscula
- [x] **Mitos de Cthulhu** con `special` y `noxpgain`
- [x] `push: false` en todas — empujar la tirada es mecánica de CoC7, no existe en d100
- [x] Cada icono verificado contra los archivos en disco; ninguno queda roto
- [x] Registrado en `static/system.json` y desplegado: 33 documentos en `packs/es-skills`

> **Bases que faltaban en la spec.** Seis habilidades tenían `—` en
> `reglas-cthulhu-d100.md` porque no las capturé en la primera extracción. Volví al PDF
> (págs. 12-15) en vez de inventarlas: Oratoria 10%, Protocolo `EST×2`, Conducir 25%,
> Esquivar `DES×2`, Forma física `DES+FUE`, Lucha `DES×2`. La spec ya está corregida.
>
> **Pendiente:** las especialidades con base propia (Biología 5%, Historia 10%,
> Mecánica 20%, idioma materno `EST×5`…) están documentadas en la descripción de cada
> habilidad, pero no existen como items separados. Decidir si se crean o si el jugador
> las añade a mano.

### F2.2 — Armas ✅ commit `428ebd3`
- [x] Campos nuevos en `weapon-system.js`: `resistance` (PR) y `properties.parry`
      (bloquear). **`impl` (empalar), `malfunction` (disfunción) y `usesPerRound` ya
      existían** en el modelo de upstream, no hubo que añadirlos.
- [x] Escopetas: usan los tres tramos `range.normal/long/extreme` que ya existían
- [x] Compendio `es-weapons.yaml`: **41 armas** (10 cuerpo a cuerpo, 6 arrojadizas,
      25 de fuego), desplegado y verificado
- [x] **MD diferenciado resuelto** (cerraba F1.4): 10 con `addb`, 6 con `ahdb`,
      25 sin ninguno
- [x] Etiquetas `CoC7.WeaponParry` y `CoC7.WeaponResistance` en los 15 idiomas
- [ ] Objetos inanimados con PR y rotura a 0 PR: falta la lógica (F4)

> **Dos bugs propios cazados al verificar el pack:**
> 1. El `:` dentro de las descripciones rompía el YAML sin comillas. El generador ahora
>    entrecomilla todos los escalares.
> 2. La disfunción **"00" del manual significa 100**, no cero. Al codificarla como `0`,
>    mi generador la trataba como "sin valor" y **10 armas se quedaban sin disfunción**.
>    Ahora las 25 armas de fuego la tienen.

### F2.3 — Profesiones ✅ commit `b66db77`
- [x] Las 10 profesiones del §10 como items `occupation`
- [x] `EST×20` en `occupationSkillPoints.edu`; `INT×10` libres ya se calcula en el actor
- [x] Grupos separados por `/` conservados en la descripción

> Los grupos no se enlazan como items de habilidad: varias entradas son elecciones
> ("al menos dos a su elección", "una de estas tres") que una lista plana de enlaces no
> puede expresar. Queda como mejora si molesta en mesa.

### F2.4 — Creación de personajes 🟡
- [x] `INT×10` puntos libres (`PERSONAL_SKILL_POINTS_PER_INT`). El asistente fijaba el
      `INT×2` de CoC7 en **dos** sitios: `investigator-wizard.js:850` y `:2124`
- [x] `EST×20` profesionales: ya venía del compendio de profesiones
- [x] Mitos de Cthulhu excluido de la creación (ver nota de CoCIDs abajo)
- [ ] Revisar el resto de la secuencia del asistente contra el §10

> **Los CoCID van en inglés, siempre.** Son claves de búsqueda independientes del idioma:
> el nombre se traduce, el id no. Los generé desde los nombres en español y rompí seis
> enganches del código (`i.skill.dodge`, `i.skill.cthulhu-mythos`, `i.skill.language-own`,
> `i.skill.credit-rating`, `i.skill.throw`, `i.skill.fighting-throw`).
>
> El síntoma visible: el asistente impide gastar puntos en Mitos de Cthulhu buscando
> `i.skill.cthulhu-mythos`, pero el compendio decía `i.skill.mitos-de-cthulhu`, así que
> **la restricción nunca se aplicaba**. Corregido.
>
> **Resuelto.** Volviendo al cap. 2 del PDF: **Armas de Cuerpo a Cuerpo tiene cuatro
> especializaciones**, no dos. Cortas 20%, Largas 15%, **Armas de proyectil 10%** (arcos,
> ballestas) y **Armas arrojadizas 10%** (cuchillos, shuriken). Base genérica 10%.
> Las arrojadizas del compendio ya apuntan ahí. "Lanzar" sobrevive solo donde el libro
> lo pone: como especialización de Armas de Fuego para granadas.
>
> `i.skill.throw` y `i.skill.fighting-throw` siguen sin existir en d100; el código de
> upstream que los busca simplemente no encontrará nada, que es el comportamiento correcto.

---

## F3 — Descenso a la Locura

**Objetivo:** los dos sistemas de cordura del manual, seleccionables por mundo.
**La parte con más trabajo original de todo el proyecto.**

**Criterio de aceptación:** con el sistema alternativo activo, un PJ con POD 13 muestra
barras de 7/6/7 casillas; al llenar la primera y marcar una de la segunda pasa a
"Intranquilo" y sus habilidades de Acción reciben `+10%` mientras el resto recibe `-10%`.

### F3.0 — Selector ✅ commit `d134025`
- [x] Ajuste de mundo `sanitySystem`: `classic` | `alternative`, visible en configuración,
      en `setup/register-settings.js`
- [ ] La ficha muestra un bloque u otro según el ajuste (F5.2)

### F3.1 — Sistema clásico ✅ commit `24451b1`
- [x] Estabilidad Mental inicial `POD×5` (`document-class.js:763`)
- [x] Chequeo `1D100 ≤ EM` y notación `X/Y`: ya lo hacía la carta de upstream
- [x] Locura temporal **tantos turnos como puntos perdidos**, no `1D10` como CoC7
- [x] Problema a largo plazo al perder ≥20% de la EM **restante** en una escena
- [x] EM a 0 → locura irremediable, aviso al GM de que el PJ pasa a PNJ
- [x] Reaprovechado `apps/san-check-card.js`: solo tres reglas divergían

> **La diferencia con más impacto en mesa** es el umbral. CoC7 medía un quinto de la
> cordura **inicial** a lo largo de un día; d100 mide un quinto de la **restante** por
> escena. Un investigador tocado con 20 puntos se rompe perdiendo 4, donde CoC7 le seguía
> exigiendo los mismos 14 que cuando estaba entero. Es lo que hace que el descenso a la
> locura se acelere.

### F3.2 — Sistema alternativo: estructura ✅ commit `d134025`
- [x] `apps/mental-stability.js`: barras `ceil/floor/ceil`, total `POD×1,5` exacto
- [x] Campos `san.tension` y `san.underlyingMadness` en el esquema
- [x] `applyHit()` cubre las tres reglas difíciles: impacto masivo, cruce de POD y
      "acostumbrarse a la tensión"
- [x] Verificado contra los ejemplos del manual, incluido POD 12 + Gran Cthulhu sacando
      40 → 3 de Locura Subyacente y 4 de tensión
- [ ] Impactos: se ignora la primera cifra de `X/Y` y siempre se tira `Y`. Falta la carta
      de chat que lo pida y aplique

### F3.3 — Sistema alternativo: estados 🟡 lógica hecha, falta aplicarla a las tiradas
- [x] Los cuatro estados y sus modificadores en `stateFromTension()` y `modifiers()`
- [x] `+1` Locura Subyacente al cruzar POD
- [x] Impactos posteriores ignorados con las 3 barras llenas
- [x] Impacto masivo
- [x] Derivados expuestos en `system.config.mentalStability` (barras, estado,
      modificadores, modificador de recuperación)
- [ ] **Falta lo importante:** aplicar `modifiers.action` / `modifiers.other` a las
      tiradas. Requiere que cada habilidad sepa si es "de Acción", y esa categoría hoy
      solo está en la descripción del compendio, no en un campo. Añadir
      `system.category` a `skill-system.js` y rellenarlo en `es-skills.yaml`.
- [ ] Bloquear la acción voluntaria en Enajenación Transitoria (`modifiers.canAct`)
- [ ] Los modificadores de estado deben distinguir habilidades **de Acción** del resto:
      requiere que cada habilidad conozca su categoría (viene de F2.1)

### F3.4 — Sistema alternativo: recuperación 🟡 lógica hecha, falta la carta de chat
- [x] `recoveryThreshold()`: `INT×5` con modificador por estado y `+10%` acumulativo
      por hora tranquila
- [x] `applyRecovery()`: éxito borra las tres barras, fallo suma `1D6`
- [ ] Carta de chat que lance el chequeo y aplique el resultado

### F3.5 — Locura a largo plazo 🟡 lógica hecha, falta la interfaz
- [x] `disorderSeverity()`: `1D6` contra Locura Subyacente, gravedad = diferencia
- [x] Los puntos de Locura Subyacente **no** se pierden al desarrollar el trastorno
- [x] "Acostumbrarse a la tensión" dentro de `applyHit()`
- [x] `treatmentThreshold()` y `applyTreatment()`: `-10%` por grado, éxito `-1/-1`,
      crítico `-2/-2`
- [x] `tomeMadness()`: pérdida `×2`, un punto por múltiplo entero del POD
- [ ] Trastornos como items o efectos en la ficha; hoy solo se calcula la gravedad
- [ ] Segundo trastorno: agudizar (`max(antiguo,nuevo)+1`) o paralelo — decisión del GM,
      sin automatizar
- [ ] Tabla de gravedad 1-6 con ejemplos y tabla de pérdidas (§6b) como RollTables
- [ ] Internamiento para gravedad 4+ (regla de mesa, quizá no valga la pena automatizar)

---

## F4 — Combate

**Objetivo:** secuencia de combate del manual, con tablas cruzadas en vez de tirada
enfrentada.

**Criterio de aceptación:** un atacante con Especial contra un defensor que esquiva con
Fallo produce "Empala" (daño ×2); el mismo atacante contra un defensor con Crítico produce
"Falla".

### F4.1 — Iniciativa y estructura de turno 🟡
- [x] Iniciativa por **DES 3-18** en `apps/combat-tables.js initiative()`, cableada en
      `document-class.js`. Cubre preparar arma (`-5`), sorpresa (mitad) y retraso
      voluntario, nunca por debajo de 1
- [ ] Desempate por mayor % en la habilidad implicada, luego simultáneo
- [ ] Turno de 12 segundos, 5 por minuto
- [ ] **Declaración de acciones** y el `-20%` por cambiar lo declarado

### F4.2 — Tablas cruzadas
- [ ] Tabla de **Esquiva** 5×5 (§7). Resultado aplicado al **Atacante**
- [ ] Tabla de **Bloqueo** 5×5, incluida la pérdida de PR del arma del atacante
      (`-6 PR`, `-4 PR`, `-2 PR` según celda)
- [ ] Resultados posibles: `Falla`, `Golpea`, `Empala`, `Máx. D`, `Pifia`
- [ ] Reescribir `cthulhud100/apps/chat-combat-melee.js` y `chat-combat-ranged.js`

### F4.3 — Reglas de combate 🟡 lógica hecha, falta cablearla
- [x] Empalar: daño `×2` en `damageFormula()`
- [x] Esquivar múltiple: `-30%` acumulativo (`dodgePenalty()`)
- [x] Noquear (`knockout()`), Centrarse (`aimBonus()`), Presa (`escapeGrappleChance()`),
      Defenderse `+20%`, Cubierto/tumbado `-20%`, cambio de acción declarada `-20%`
      salvo si es a esquivar o bloquear — todo en `combatModifier()`
- [x] Herida grave = **estrictamente más** de la mitad de los PV máximos
- [ ] **Falta un estado "sorprendido".** `STATUS_EFFECTS` solo tiene `tempoInsane`,
      `indefInsane`, `unconscious`, `criticalWounds`, `dying`, `prone`, `dead`.
      `initiative()` ya acepta el parámetro, pero nadie se lo pasa.
- [ ] Máximo 5 atacantes por objetivo (regla de mesa, quizá no valga automatizar)
- [ ] Combate desarmado bloqueado por arma blanca → sufre el daño del arma
- [ ] Bloquear: límite de 1 por turno

### F4.4 — Distancia y armas de fuego 🟡
- [x] Tabla de alcance en `rangeMultiplier()`, verificada en los 5 tramos y el corte
- [x] `aimBonus()`: `+10%` por cada 5 puntos de DES retrasados
- [ ] Cablearlo a `chat-combat-ranged.js`, que aún usa la regla de CoC7
- [ ] Preparar arma (`-5` DES), recargar, ráfagas (`+5%` por bala, tope doble del %,
      máximo 20 balas/turno), ráfaga a varios objetivos
- [ ] Encasquillado por valor de Disfunción; reparación con habilidad o Maestría/Armería,
      `1D6` turnos
- [ ] Miras telescópicas y silenciadores

### F4.5 — Localización de impactos (opcional) 🟡
- [x] Tabla `1D20` de 7 localizaciones (`hitLocation()`), reparto 3/3/3/3/3/3/2 verificado
- [x] PV por localización según `TAM+CON` (`locationHitPoints()`), 14 bandas verificadas
- [x] `bleedOutTurns()` = `ceil((CON+POD)/2)`
- [ ] Ajuste de mundo para activarla
- [ ] Reserva de PV por localización en el actor y efectos al llegar a 0 o negativo
- [ ] Efectos a 0 o negativo, y efectos en o por debajo de `-X`, por localización
- [ ] Muerte por hemorragia si no se trata en `ceil((CON+POD)/2)` turnos

### F4.6 — Daño 🟡 lógica y tablas hechas, falta cablearlas
- [x] Herida grave = `>50%` de los PV máximos de un solo golpe (`isSevereWound()`)
- [x] Tabla de **Heridas Graves** `1D100`, 14 entradas, como RollTable en
      `packs/es-severe-wounds`. Cobertura 1-100 sin huecos, verificada en generación y
      en el pack construido
- [x] Tabla de pérdidas de Estabilidad Mental en `packs/es-sanity-losses`
- [x] Recuperación semanal en `weeklyHealing()`; Medicina **no** se acumula con Primeros
      Auxilios, es mejor cuidado, no adicional
- [x] `apps/damage-sources.js`: ácido, fuego, asfixia, ahogamiento, caídas, conmoción,
      explosiones, hambre/sed/intemperie. 20 comprobaciones verificadas
- [ ] Herida grave → actúa tantos turnos como PV le queden, luego inconsciente 1 hora
- [ ] Enfermedades y venenos (POT vs CON): usan `resistanceChance()` de F1.5, falta la UI
- [ ] Blindaje: ya se resta en `document-class.js`, revisar contra el manual

---

## F5 — Ficha, estética y magia

**Objetivo:** que se vea moderno y propio, no como CoC7 repintado.

**Criterio de aceptación:** la ficha se abre en Foundry v14 sin avisos de deprecación de
ApplicationV1 y refleja las dos fichas del PDF (pp. 49-50, "clásica" y "alternativa").

### F5.1 — Magia
- [ ] PM = POD; coste por hechizo; PM excedentes no se regeneran
- [ ] Aprender: `INT×5%` si el idioma es conocido, `INT×3%` si no; sin límite memorizados
- [ ] Escritos ajenos: estudiar `21 - INT` días
- [ ] Lanzar: efecto el **turno posterior**; el lanzador no puede hacer nada más;
      una distracción frustra el hechizo
- [ ] Hechizos que cuestan POD directamente

### F5.2 — Ficha
- [ ] Partir de `character-sheet-v3.js` de upstream (ApplicationV2), no de la v2
- [ ] Dos disposiciones según el sistema de cordura activo: "clásica" y "alternativa"
- [ ] Widget de las 3 barras de Estabilidad Mental con casillas marcables
- [ ] Bloque de localización de impactos cuando la regla está activa

### F5.3 — Estética
- [ ] Antes de diseñar, cargar la skill `frontend-design`
- [ ] Paleta y tipografía propias; **no** copiar arte del PDF
- [ ] Refactorizar `styles/*.less`; renombrar el prefijo `coc7-` a `cd100-`
- [ ] Comprobar tema claro y oscuro

### F5.4 — Idiomas
- [ ] Añadir las claves nuevas a los 15 `static/lang/*.json`
- [ ] `npm run translations-check` limpio
- [ ] Español y inglés completos al 100%; el resto puede quedar parcial, documentado
      en el README

---

## F6 — Publicación automática ✅ commit `a6409cd`

**Objetivo:** no volver a montar una release a mano.

- [x] `.github/workflows/release.yml`: al empujar una etiqueta de versión, compila,
      empaqueta y publica la release con `system.json` y `system.zip`
- [x] Sella la versión y las URLs de `manifest` / `download` en el manifiesto a partir
      de la etiqueta
- [x] Paso de verificación que **aborta la release** si el manifiesto empaquetado tiene
      el `id` o la versión equivocados, o le faltan campos obligatorios
- [x] Probado localmente reproduciendo toda la secuencia contra un directorio temporal
- [ ] Falta ejecutarlo de verdad en GitHub (requiere que el repo tenga remoto y push)

### Cómo publicar

```bash
git tag 0.2.0
git push origin 0.2.0
```

También se puede lanzar a mano desde la pestaña Actions (`workflow_dispatch`), indicando
la versión.

### URL de instalación en Foundry

```
https://github.com/EduardoJGilA/cthulhud100-foundryvtt/releases/latest/download/system.json
```

Apunta siempre a la última release, así que Foundry detecta las actualizaciones solo.

> **Dos trampas de este repositorio**, ya sorteadas en el workflow. Si alguien lo
> reescribe, que no las reintroduzca:
>
> 1. **`npm ci` no funciona.** `package-lock.json` está en `.gitignore` (heredado de
>    upstream), así que no hay lockfile. El job usa `npm install`.
> 2. **El build no escribe en `dist/`.** `scripts/webpack-config.js:319-323` sobreescribe
>    `output.path` con la ruta de Foundry sacada de `fvtt.config.json`, que está en
>    `.gitignore` y no existe en CI. El job escribe uno desechable apuntando al workspace
>    y recoge el resultado de `build/Data/systems/cthulhud100`.
>
> El zip se crea **desde dentro** del directorio del sistema. Si se comprime la carpeta
> entera, Foundry recibe un nivel de anidamiento de más y la instalación falla.
>
> **Antes de la primera release de verdad:** subir la versión en `static/system.json`
> (ahora `0.1.0`) y decidir si `compatibility.minimum` sigue siendo `12`. El sistema solo
> se ha probado contra Foundry 14.

---

## Validación cruzada de compendios

Script de comprobación que conviene volver a pasar tras tocar cualquier compendio:

1. Todo `img:` referenciado existe en `static/assets/`
2. Toda habilidad citada en una profesión existe en `es-skills.yaml`
3. Toda `skill.main.name` de un arma existe como habilidad, ignorando la especialización
4. Sin `_id` duplicados entre compendios
5. Sin `cocid` duplicados dentro del mismo pack

Estado actual: **1-4 limpios**. En el 5 quedan 2 duplicados heredados de upstream
(`i.weapon.shuriken` y `rt..system-bouts-of-madness-real-time`); el builder genera ids
distintos, así que no se pierde ningún documento.

> **Colisión de nombres a tener en cuenta.** La habilidad se llama `Esconder/se` y las
> profesiones usan `/` para separar grupos, así que cualquier parser de esas descripciones
> partirá el nombre por la mitad. Hoy no lo hace nadie porque las listas son prosa.

---

## Pendientes transversales

- [x] Cap. 9 "Criaturas de los Mitos" y cap. 10 "Tomos arcanos" extraídos.
      **La spec ya no tiene pendientes**: `reglas-cthulhu-d100.md` §12 y §13
- [x] Compendio de tomos: 10 items en `packs/es-tomes`
- [x] Hojear un libro (`CoC7MentalStability.skimTome()`): tiempo `/10`, EM `/4` redondeando
      arriba; fallar significa no entender nada, **sin ganancia y sin pérdida**
- [x] Campo `leatherySkin` en `models/actor/creature-system.js` — **no es armadura**:
      las armas de fuego hacen daño mínimo y no doblan por empalar
- [x] Compendio de criaturas: **12 perfiles** en `packs/es-creatures`, 8 con piel
      correosa, todos sin CAR ni EST como manda el manual
- [ ] Faltan las criaturas restantes del cap. 9 (Hombre serpiente, Shantak, Shoggoth,
      Color surgido del espacio, Profundo, Perro de Tíndalos…). Sus perfiles cruzan el
      maquetado a dos columnas y hay que transcribirlos con cuidado, no en bloque.
- [ ] **Aplicar** la piel correosa en el cálculo de daño: hoy el campo existe pero
      `chat-damage.js` no lo consulta

> **Errata del manual detectada.** El perfil del Errante dimensional imprime su
> habilidad de Lucha como `425+2D6 %`. Es un error tipográfico por `25+2D6`, coherente
> con todas las demás criaturas. Se ha corregido en el compendio.
- [ ] Decidir si se conserva el sistema de **eras** (`cocidFlag.eras`) de upstream o se elimina
- [x] **Contenido de CoC7 retirado** de los compendios: actores de ejemplo (tenían
      características percentiles, FUE 50 en una escala que acaba en 18), las 50 armas de
      CoC7 que duplicaban las nuestras, items de ejemplo y las tablas de arrebatos de
      locura, que pertenecen a otro sistema de cordura.
      Se conservan fobias y manías (genéricas, sirven para los trastornos del sistema
      alternativo), `roll-requests` y `system-doc`.
- [ ] **`system-doc` documenta las reglas de CoC7** y el código lo consulta
      (`hooks/ready.js:27`). Hay que regenerarlo con las reglas de d100 o desengancharlo.
- [ ] Decidir qué hacer con las funcionalidades de upstream ajenas a d100:
      persecuciones (`chase`), arquetipos, paquetes de experiencia, `talent`, `status`
- [ ] Migración: no hay usuarios previos, así que **no** hace falta script de migración
      desde el fork de 2020
- [ ] `grid.units`: el manual usa **metros**, no pies. Cambiar `ft` → `m` y `distance` a 1,5

---

## Registro de progreso

| Fecha | Fase | Qué se hizo | Quién |
|---|---|---|---|
| 2026-07-21 | — | Análisis del fork, extracción del reglamento, decisión de estrategia, este plan | Claude Opus 4.8 |
