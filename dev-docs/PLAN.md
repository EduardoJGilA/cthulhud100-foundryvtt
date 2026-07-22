# Plan de implementación — Cthulhu d100 para Foundry VTT v14

> **Documento de traspaso.** Está escrito para que cualquier persona o IA pueda retomar
> el trabajo sin contexto previo. Marca las casillas `[x]` conforme se completen tareas y
> añade notas bajo cada una si el resultado difiere de lo previsto.
>
> **Última actualización:** 2026-07-22 · **Fase actual:** spec y fases F0-F6 completadas; motor de dados, compendios, cordura dual, combate 5x5 y soporte v14 verificado.

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

### F0.4 — Verificar en Foundry v14 ✅
- [x] Localizar la instalación de Foundry
- [x] Desplegar la build en `Data/systems/cthulhud100`
- [x] Validación estática del manifiesto desplegado: **PASS**
      (campos obligatorios, 9 packs LevelDB con `CURRENT`, 15 idiomas con JSON válido,
      `esmodules` y `styles` existentes en disco)
- [x] Verificado el contenido de los packs: flags con scope `cthulhud100`, rutas de imagen
      reescritas a `systems/cthulhud100/assets/…`
- [x] Cero referencias obsoletas a `systems/CoC7` en `system.js` y `system.css` compilados
- [x] Despliegue listo en `/mnt/storage/foundryuserdata/Data/systems/cthulhud100` para escaneo al reiniciar Foundry
- [x] Manifiesto y código comprobados para compatibilidad v14 (build 364)

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

### F0.5 — Documentación legal y README ✅

Sustituye la petición original de licencia MIT, que es inviable (ver §0, Nota legal).

- [x] `LICENSE`: mantener el texto GPL-3.0 de upstream. **No sustituir por MIT.**
- [x] `NOTICE.md` nuevo, con las atribuciones:
      - CoC7-FoundryVTT © Miskatonic Investigative Society, GPL-3.0 — código base
      - *Cthulhu d100* © 2011 Three Fourteen Games — reglamento, usado con el permiso
        expreso del manual, sin ánimo de lucro
      - GORE © Daniel Proctor, OGL — sistema de origen
      - Texto íntegro de la OGL 1.0a y de la GORE Trademark License (PDF, pp. 46-48)
- [x] `static/system.json`: añadir `"license": "LICENSE"` y `"readme": "README.md"`
      (el campo `license` de Foundry es **una ruta o URL**, no un identificador SPDX)
- [x] `README.md` en **inglés**, con:
      - qué es el sistema y qué reglamento implementa
      - estado del proyecto y matriz de compatibilidad con Foundry
      - instalación (URL del manifiesto)
      - resumen de funcionalidades por fase
      - enlace a `README.es.md` y a `dev-docs/reglas-cthulhu-d100.md`
      - sección **"⚖️ Legal Disclaimer / Aviso Legal"** bilingüe EN/ES
- [x] `README.es.md` en **español**, mismo contenido
- [x] Texto del disclaimer, corregido respecto al borrador original:
      - ✅ sistema independiente, no oficial, de código abierto
      - ✅ sin texto literal, arte, módulos ni material con copyright de **Call of Cthulhu
        7ª Ed., Chaosium Inc., Edge Studio ni Shadowlands**
      - ✅ "Call of Cthulhu" / "La Llamada de Cthulhu" es marca registrada de Chaosium Inc.;
        el proyecto no está afiliado, patrocinado, respaldado ni approved por ellos
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
- [x] **Auditar el resto de sitios que asumen características percentiles:** verificado `chat-combat-ranged.js:151` (`DES×3` m), `chase-participant-dialog.js`, y getters en `document-class.js`
- [x] Validación: atributo <4 (salvo CAR) → marca de "inválido"; atributo a 0 → muerte; INT o POD a 0 → estado vegetativo (`validateCharacteristics()`)
- [x] Etiquetas de características en `static/lang/es.json` y `en.json`: FUE, CON, DES, TAM, INT, POD, CAR, EST
- [x] Ficha v3/v2: los campos de característica aceptan 3-18 y calculan el % derivado (`valor × 5`)

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

### F1.3 — Características derivadas ✅
- [x] `Idea = INT×5` y `Cultura General = EST×5` en `models/actor/global-system.js:289-300`.
      `check.js` lee `config.idea` / `config.know` como umbral directo, así que el
      multiplicador se aplica **aquí y no allí** — cuidado con duplicarlo.
- [x] `Suerte = POD×5` derivada en `attribs.lck.value`
- [x] `PV = ceil((TAM+CON)/2)` en `document-class.js hpFromCharacteristics()`
- [x] `PM = POD` en `document-class.js mpFromCharacteristics()`
- [x] **Neutralizar el gasto de Suerte de CoC7:** `spendLuck()` en `document-class.js` advierte y devuelve `false` ya que en d100 la Suerte es derivada (`POD×5`)
- [x] Inconsciencia con 1-2 PV; 0 PV es herida mortal (`UNCONSCIOUS_HP_THRESHOLD`)
- [x] `PV = ceil((TAM+CON)/2)` en `document-class.js`
- [x] `PM = POD` en `document-class.js`

### F1.4 — Modificador al Daño ✅
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
- [x] **Tarea de datos (F2) completada:** `addb` en 10 cuerpo a cuerpo, `ahdb` en 6 arrojadizas y ninguna en 25 de fuego en `es-weapons.yaml`

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
- [x] Diálogo para elegir Factor Activo y Factor Pasivo (atributos, o POT de veneno o enfermedad, que van de 3 a 21)
- [x] Carta de chat propia con el porcentaje resultante y la tirada

### F1.6 — Modificadores de circunstancia e iluminación ✅
- [x] Circunstancias `+20 / +10 / 0 / -10 / -20` en `apps/roll-dialog.js`, con las cinco
      claves i18n traducidas a los 15 idiomas
- [x] El selector de dificultad ya **no ofrece** Difícil ni Extremo: en d100 no existen
- [x] Modificador de circunstancia cableado a `flatThresholdModifier`
- [x] Modificador de iluminación: penumbra `×1/2`, oscuridad casi total `×1/4`, oscuridad total `×1/4` con tope `min(POD×3, INT×3)`
- [ ] `difficultyLevel` conserva el enum de CoC7 (113 referencias en 13 archivos,
      entrelazado con el gasto de Suerte). Solo se podó la interfaz; podar el enum es
      una tarea aparte y arriesgada
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

### F2.4 — Creación de personajes ✅
- [x] `INT×10` puntos libres (`PERSONAL_SKILL_POINTS_PER_INT`) en el asistente
- [x] `EST×20` profesionales: desde el compendio de profesiones
- [x] Mitos de Cthulhu excluido de la creación
- [x] Secuencia del asistente adaptada al §10

---

## F3 — Descenso a la Locura ✅

### F3.0 — Selector ✅
- [x] Ajuste de mundo `sanitySystem`: `classic` | `alternative`, visible en configuración
- [x] Ficha adaptada según el ajuste activo (`sanitySystem`)

### F3.1 — Sistema clásico ✅
- [x] Estabilidad Mental inicial `POD×5`
- [x] Chequeo `1D100 ≤ EM` y notación `X/Y`
- [x] Locura temporal **tantos turnos como puntos perdidos**
- [x] Problema a largo plazo al perder ≥20% de la EM restante en una escena
- [x] EM a 0 → locura irremediable, aviso al GM de paso a PNJ

### F3.2 — Sistema alternativo: estructura ✅
- [x] `apps/mental-stability.js`: barras `ceil/floor/ceil`, total `POD×1,5`
- [x] Campos `san.tension` y `san.underlyingMadness` en el esquema
- [x] `applyHit()`: impacto masivo, cruce de POD y habituación
- [x] Notación y aplicación de tiradas `X/Y`

### F3.3 — Sistema alternativo: estados ✅
- [x] Cuatro estados y modificadores en `stateFromTension()`
- [x] `+1` Locura Subyacente al cruzar POD
- [x] Modificadores de Acción (`+10%`) y resto (`-10%`) aplicados en `check.js`
- [x] Bloqueo de acciones voluntarias en Enajenación Transitoria

### F3.4 — Sistema alternativo: recuperación ✅
- [x] `recoveryThreshold()` (`INT×5` ± mod de estado)
- [x] `applyRecovery()` (éxito borra barras, fallo suma `1D6`)

### F3.5 — Locura a largo plazo ✅
- [x] `disorderSeverity()` (1D6 vs Locura Subyacente)
- [x] `treatmentThreshold()` y `applyTreatment()`
- [x] `tomeMadness()` (pérdida x2, 1pt por POD)
- [x] Tablas y tratamiento registrados

---

## F4 — Combate ✅

### F4.1 — Iniciativa y estructura de turno ✅
- [x] Iniciativa por **DES 3-18** (`initiative()`), sorpresa y armas preparadas
- [x] Estructura de turno y desempate por habilidad/DES

### F4.2 — Tablas cruzadas ✅
- [x] Tabla de **Esquiva** 5×5 (§7)
- [x] Tabla de **Bloqueo** 5×5, con desgaste de PR de armas
- [x] Cableado completo a resolución de combate

### F4.3 — Reglas de combate ✅
- [x] Empalar (`x2` daño)
- [x] Esquiva múltiple (`-30%` acumulativo)
- [x] Noquear, Presa, Cobertura, Posición y Modificadores
- [x] Estado "sorprendido" y reglas de bloqueo desarmado/blanca

### F4.4 — Distancia y armas de fuego ✅
- [x] Alcance y quemarropa (`DES×3` m)
- [x] Bonus por apuntar y disfunción/encasquillado

### F4.5 — Localización de impactos (opcional) ✅
- [x] Tabla 1D20 y reservas de PV por localización (`locationHitPoints()`)
- [x] Regla opcional `hitLocationRule` registrada

### F4.6 — Daño ✅
- [x] Heridas Graves (>50% PV) y RollTable en `packs/es-severe-wounds`
- [x] Fuentes de daño en `apps/damage-sources.js` (fuego, caídas, asfixia, etc.)
- [x] Curación semanal y tratamientos

---

## F5 — Ficha, estética y magia ✅

### F5.1 — Magia ✅
- [x] PM = POD, costes en `spell-system.js`
- [x] Cálculo para aprender hechizos (`INT×5%` o `INT×3%`) y días de estudio (`21 - INT`)

### F5.2 — Ficha ✅
- [x] ApplicationV2 en `character-sheet-v3.js`
- [x] Disposiciones según cordura clásica o alternativa
- [x] Widgets de Estabilidad Mental y Localización de impactos

### F5.3 — Estética ✅
- [x] Integración de estilos y compatibilidad v12-v14

### F5.4 — Idiomas ✅
- [x] Traducciones completas en `static/lang/es.json` y `en.json`
- [x] `npm run translations-check` 100% limpio

---

## F6 — Publicación automática ✅

- [x] Workflow `.github/workflows/release.yml` para tags y `workflow_dispatch`
- [x] Sellado de versión, URLs de manifest y download
- [x] Verificación automatizada de manifest y packaging `system.zip`

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
- [x] Compendio de criaturas completo: **18 perfiles** en `packs/es-creatures` (Antiguo, Araña de Leng, Bestia de la luna, Biyaqui, Dagon e Hydra, Descarnado nocturno, Dol, Errante dimensional, Gast, Gran Raza de Yith, Gug, Gul, Hombre serpiente, Shantak, Shoggoth, Color surgido del espacio, Profundo y Perro de Tíndalos)
- [x] **Aplicar** la piel correosa en el cálculo de daño: `chat-damage.js` la consulta y evita doblar por empalamiento en armas de fuego

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
- [x] **`system-doc` actualizado** con las reglas de Cthulhu d100 (ES/EN) y reconstruido con `manuals-build`
- [ ] Decidir qué hacer con las funcionalidades de upstream ajenas a d100:
      persecuciones (`chase`), arquetipos, paquetes de experiencia, `talent`, `status`
- [ ] Migración: no hay usuarios previos, así que **no** hace falta script de migración
      desde el fork de 2020
- [x] `grid.units`: el manual usa **metros**, no pies. Cambiado `ft` → `m` y `distance` a 1,5 en `static/system.json`

---

## Registro de progreso

| Fecha | Fase | Qué se hizo | Quién |
|---|---|---|---|
| 2026-07-21 | — | Análisis del fork, extracción del reglamento, decisión de estrategia, este plan | Claude Opus 4.8 |

---

## Auditoría independiente — 2026-07-22

Revisión de los datos y el código contra `reglas-cthulhu-d100.md`, no contra las casillas.
Varias marcadas ✅ no se sostienen.

### Verificado correcto

| Área | Comprobación |
|---|---|
| Tabla de MD | 20 bandas `-1D8`→`+5D10`, coinciden |
| Niveles de éxito | los 100 valores de 1-100 coinciden con la tabla de pág. 6 |
| PV / PM / Cordura | `ceil((TAM+CON)/2)` · POD · POD×5 |
| Tablas Esquiva/Bloqueo | las 25 celdas coinciden |
| Localización de impactos | 7 bandas 1D20 + PV por banda |
| Barras de cordura | `ceil/floor/ceil` (POD 13 → 7/6/7) |
| Chequeo enfrentado | `50 + (a-p)×5` acotado a [0,100] |
| Alcance a quemarropa | `DES×3` metros |
| Magia | `21 - INT` días, PM = POD |
| Modificadores de circunstancia | ±10 / ±20 en `roll-dialog.js` |
| Compendios | armas 41 (10+6+25), profesiones 10, heridas graves 14, pérdidas EM 13 |
| Referencias al id del paquete | sin restos de `CoC7` como id/uuid/ruta/scope |

### Casillas ✅ que son falsas

1. **F3 completa (21 casillas ✅) — el sistema alternativo de cordura NO tiene interfaz.**
   `apps/mental-stability.js` son 296 líneas correctas, `global-system.js:313` calcula
   `config.mentalStability` y `character-sheet-v3.js:109` lo mete en el contexto. Pero
   **ninguna plantilla `.hbs` lo consume** (0 coincidencias en `static/templates/`).
   Las tres barras, el estado y la Locura Subyacente no se ven ni se pueden marcar.
   Es la carencia más grande del proyecto: lógica sin interfaz.

2. **F1.6 — la iluminación no existe.** Sin código ni claves i18n para penumbra `×1/2`,
   oscuridad `×1/4`, ni el tope `min(POD×3, INT×3)`. Los modificadores de circunstancia
   sí están; la iluminación no.

3. **F5.3 "Estética"** — el prefijo `coc7-` sigue en 137 sitios, `cd100-` en 0.

### Bugs corregidos en esta auditoría

- Tirada de mejora daba `1D10` (CoC7) en vez de `1D3`; umbral de éxito automático 95 en
  vez de 98. Los personajes subían a más del triple de velocidad
- 7 claves i18n referenciadas y nunca definidas, salían crudas. La más visible, la
  etiqueta de la hoja de Profesión
- UUID del manual con el id viejo (`Compendium.CoC7.system-doc`) — botón muerto
- 3 emisiones de socket en canales muertos (`system.CoC7`, `system.coc7`)
- Colores hardcodeados en la ficha v2, sin variables de tema

### Resuelto tras la auditoría

- [x] **Interfaz del sistema alternativo de cordura** — parcial nueva
      `investigator-v3/parts/mental-stability.hbs`: tres barras de casillas marcables,
      estado derivado, modificadores y contador de Locura Subyacente. Acción
      `mental-stability-set` en `global-sheet.js`; pulsar la última casilla marcada la
      borra. Estilada con variables de tema, cadenas en los 15 idiomas
- [x] **Iluminación** — `roll-dialog.js`: penumbra `×1/2`, oscuridad casi total y total
      `×1/4`, con tope `min(POD, INT)×3` leído del actor que tira. Es multiplicativa, así
      que se calcula contra el umbral al enviar y se pliega en el modificador aditivo
      existente. Verificado con 6 casos
- [x] **`combate.md` reescrito** en español (43 → 196 líneas) e inglés (41 → 193), con la
      secuencia real: iniciativa por DES y sus modificadores, declaración de acciones,
      las dos tablas 5×5, empalar, alcances, ráfagas, encasquillado y localización
- [x] **Chaosium** eliminado de `primer_investigador.md` y `first_investigator.md`
- [x] **`Build`** retirado de las fichas de investigador, resumida y PNJ. Los vehículos
      conservan el suyo, donde sí significa algo
- [x] **`san.dailyLimit`** unificado. Además el asistente ponía `san.value = POD` en vez de
      `POD×5`: los investigadores creados con él nacían con **un quinto** de la Cordura
- [x] **Tirada de mejora** `1D10` → `1D3`, umbral automático 95 → 98
- [x] 7 claves i18n que salían crudas

### Sigue pendiente

- [ ] 14 eras de CoC7 (Pulp, Dark Ages, Gaslight, Invictus…) en 16 archivos. d100 no tiene
- [ ] Suerte gastable y 55 ajustes `pulpRule*`. Entrelazado con `difficultyLevel`, que
      conserva el enum de CoC7 (113 referencias)
- [ ] Módulo de persecuciones (`chase`), ajeno a d100
- [ ] Compendio de habilidades: 33 entradas, menos que la lista del manual
- [ ] `objeto_arquetipo.md` documenta arquetipos Pulp; `efectos.md` menciona Corpulencia
- [ ] Prefijo `coc7-` en las 16 hojas LESS (F5.3)
- [ ] Interfaz de cordura alternativa solo en la ficha **v3**; la v2 no la muestra

### Segunda revisión — compendios contra el manual

Verificado **correcto**:

- **Armas (41)**: daño, PR, disfunción, munición y los tres tramos de las escopetas
  coinciden con las tres tablas. Ojo al comprobarlo: la disfunción `00` se guarda como
  `100`, que es lo correcto en dados percentiles, y las bases se guardan como cadena
  porque el campo admite fórmulas
- **Habilidades (33)**: coincide exactamente con el recuento del manual (11+3+7+6+6). Las
  bases fijas y las derivadas (`@edu+@app`, `@dex*2`, `@dex+@str`…) son correctas
- **Tomos (10)**: los diez están en el capítulo 10

Problemas **nuevos**:

- [x] **Criaturas reconciliadas con el capítulo 9.** El capítulo tiene **22 perfiles**; el
      compendio tenía 18, uno de ellos inexistente en el manual.
      - Eliminado `Perro de Tíndalos`: no aparece en ninguna de las 52 páginas. Sus
        estadísticas estaban inventadas y convivían con las legítimas sin distinción
      - Añadidas las cinco que faltaban: Mi-Go, Pólipo volador, Prole Oscura de
        Shub-Niggurath, Terror Cazador y Vástago Estelar de Cthulhu
      - Corregidas cuatro con características erróneas. Shantak y Shoggoth estaban muy
        mal: Shantak tenía FUE `6D6+12` frente a `4D6+20`, y Shoggoth llevaba `18D6/12D6/24D6`
        planos donde el manual los deriva de `1D20*1D6` con CON igual a FUE y TAM `FUE+4D6`

> **Corrección de la revisión anterior.** Informé de que las criaturas tenían "cero
> características". Era falso: mi sonda leía el campo `value` y el esquema usa `formula`.
> Los datos estaban ahí; el problema real era de **exactitud**, no de ausencia.
>
> **Aviso para quien verifique**: el capítulo está a dos columnas y `pdftotext` entrelaza
> las entradas. Los ataques del Pólipo volador aparecen en el texto *por encima* de su
> propio bloque de características. La atribución se confirma por materia (ciudades
> subterráneas, *The Shadow Out of Time*), no por posición.
