# Plan de implementación — Cthulhu d100 para Foundry VTT v14

> **Documento de traspaso.** Está escrito para que cualquier persona o IA pueda retomar
> el trabajo sin contexto previo. Marca las casillas `[x]` conforme se completen tareas y
> añade notas bajo cada una si el resultado difiere de lo previsto.
>
> **Última actualización:** 2026-07-21 · **Fase actual:** F0 no iniciada

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
- ⚠️ **Pendiente de confirmar con el usuario:** ruta de instalación de Foundry v14 para
  pruebas (habitualmente `~/foundrydata/Data/systems/`).

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
coc7/system.js              ← punto de entrada ESM
coc7/constants.js
coc7/models/actor/          ← global-system.js, character-system.js, npc-system.js,
                              creature-system.js, vehicle-system.js, container-system.js,
                              document-class.js (157 KB), sheets v2/v3
coc7/models/item/           ← skill, weapon, armor, spell, book, occupation, archetype,
                              talent, setup, status, chase, experience-package
coc7/models/active-effect/
coc7/models/fields/
coc7/apps/                  ← check.js (1233 líneas), dice-pool.js, chat-combat-melee.js,
                              chat-combat-ranged.js, san-check-card.js, roll-dialog.js…
coc7/hooks/
coc7/setup/
coc7/tours/
coc7/manual/
```

Build: `npm install` → `npm run build` (webpack, modo producción) o `npm run watch`.

### Divergencias clave CoC7 → Cthulhu d100

Esta tabla resume dónde duele. Detalle completo en `dev-docs/reglas-cthulhu-d100.md`.

| Área | CoC7 | Cthulhu d100 | Punto de ataque |
|---|---|---|---|
| Atributos | percentil (3d6×5) | **escala 3-18** | `coc7/models/actor/global-system.js:120` |
| Niveles de éxito | regular / hard `/2` / extreme `/5` / crit `01` | éxito / **especial `/5`** / **crítico `/20`** | `coc7/apps/dice-pool.js:1325` `#populateThresholdRanges()` |
| Pifia | 96 si umbral <50, si no 100 | **siempre 96-00** | `coc7/apps/dice-pool.js:1293` |
| PV | `(SIZ+CON)/10` | `ceil((TAM+CON)/2)` | `character-system.js` |
| PM | `POW/5` | `POD` | `character-system.js` |
| Suerte | reserva propia tirada | **derivada** `POD×5` | `character-system.js` |
| MD | tabla DB percentil | tabla por `FUE+TAM`, 19 tramos, `-1D8`→`+5D10` | nueva tabla |
| Cordura | SAN única | **dos sistemas seleccionables**; el "alternativo" no tiene equivalente | módulo nuevo |
| Combate | tirada enfrentada | **tablas cruzadas 5×5** Esquiva/Bloqueo | `chat-combat-melee.js`, `-ranged.js` |
| Iniciativa | DEX percentil | **DES 3-18** | `coc7/apps/` combat |
| Habilidades | lista CoC7 | lista distinta, 5 categorías | compendio nuevo |
| Armas | campos CoC7 | + `PR`, `empalar`, `bloquear`, `disfunción` | `weapon-system.js` |

---

## Convenciones de trabajo

- **Un commit por tarea** completada, mensaje en inglés, Conventional Commits.
  Terminar el cuerpo con `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **No** hacer push ni abrir PR salvo petición explícita del usuario.
- Antes de cerrar una fase, ejecutar su bloque "Criterio de aceptación" completo.
- Si una tarea revela que el plan está equivocado, **actualizar este documento** en el
  mismo commit.
- Los identificadores de tarea (`F1.3`) son estables: úsalos al referirte al trabajo.

---

## F0 — Bootstrap del fork

**Objetivo:** que el sistema, sin ninguna regla cambiada, arranque en Foundry v14 con el
identificador y la marca de Cthulhu d100. Ninguna mecánica se toca en esta fase.

**Criterio de aceptación de la fase:** se puede crear un mundo en Foundry v14 con el
sistema `cthulhud100`, abrir una ficha de personaje y hacer una tirada sin errores en la
consola del navegador.

### F0.1 — Preparar el árbol
- [ ] Confirmar que `develop` está limpio y que existe la rama `legacy/2020-fork-ia-attempt`
      (`git branch -a`, `git log legacy/2020-fork-ia-attempt -1` → `712e752`)
- [ ] Crear rama de trabajo `feat/upstream-8.14-rebase` desde `develop`
- [ ] Borrar del árbol todo el código del fork de 2020: `module/`, `templates/`, `packs/`,
      `styles/`, `less/`, `artwork/`, `lang/`, `coc7g.css`, `gulpfile.js`, `.eslintrc.json`,
      `system.json`, `template.json`
- [ ] Copiar el árbol completo de upstream 8.14 (excepto `.git/`)
- [ ] Conservar de nuestro repo: `docs/`, `.gitignore`, `.claude/`, `.agents/`
- [ ] `git add -A && git commit` — mensaje: `feat: rebase onto upstream CoC7 8.14`

### F0.2 — Renombrar el sistema
- [ ] `static/system.json`: `id` de `CoC7` → `cthulhud100`
- [ ] `static/system.json`: `title` → `Cthulhu d100`, `description`, `version` → `0.1.0`,
      `authors`, `url`, `manifest`, `download` apuntando a `EduardoJGilA/cthulhud100-foundryvtt`
- [ ] Buscar y sustituir la ruta `systems/cthulhud100/` → `systems/cthulhud100/` en todo el árbol
      (`grep -rl "systems/CoC7"` — afecta a `.hbs`, `.less`, `.yaml` y `.js`)
- [ ] Decidir y documentar aquí si el *namespace* JS `CoC7` interno se renombra o se
      mantiene. **Recomendación: mantenerlo** en F0 para no romper 194 archivos; renombrar
      es una tarea aparte de bajo valor.
- [ ] `package.json`: `name` → `fvtt-cthulhud100`, `description`, `repository`, `homepage`
- [ ] Compendios: renombrar `system: CoC7` → `cthulhud100` en `compendiums/*.yaml` y en
      los `packs` de `static/system.json`

### F0.3 — Compilar
- [ ] `npm install` sin errores
- [ ] `npm run build` genera la carpeta de distribución sin errores
- [ ] `npm run compendiums-build` genera los packs LevelDB
- [ ] `npm run eslint` limpio (o registrar aquí las excepciones aceptadas)

### F0.4 — Verificar en Foundry v14
- [ ] Preguntar al usuario la ruta de instalación de Foundry si aún no se conoce
- [ ] Instalar la build (symlink o copia) en `Data/systems/cthulhud100`
- [ ] Crear un mundo de prueba, abrir ficha de personaje, lanzar una tirada
- [ ] Consola del navegador sin errores ni avisos de deprecación bloqueantes
- [ ] Anotar aquí la versión exacta de Foundry probada: `_______`

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

**Criterio de aceptación:** una ficha con FUE 13 / TAM 14 muestra MD `0`; una habilidad al
50% produce Crítico con `01-02`, Especial con `03-10`, Éxito con `11-50`, Fallo con `51-95`
y Pifia con `96-00`.

### F1.1 — Atributos en escala 3-18
- [ ] `coc7/models/actor/global-system.js:120` `defineSchemaCharacteristics()`: renombrar
      las ocho claves a `fue con des tam int pod car est` **o** mantener las claves internas
      de CoC7 (`str con dex siz int pow app edu`) y traducir solo en la capa de idioma.
      **Recomendación: mantener las claves internas**, cambiar solo etiquetas y fórmulas.
      Reduce muchísimo el riesgo y el `document-class.js` de 157 KB sigue funcionando.
      Decisión tomada: `_______`
- [ ] Fórmulas por defecto: `str con dex pow app` → `3D6`; `siz int` → `2D6+6`; `edu` → `3D6+3`
- [ ] Introducir el concepto de **multiplicador de característica**: el valor almacenado es
      3-18 y el porcentaje de chequeo es `valor × 5`. Localizar todos los sitios que asumen
      que la característica ya es un porcentaje
- [ ] Validación: atributo <4 (salvo CAR) → marca de "inválido"; atributo a 0 → muerte;
      INT o POD a 0 → estado vegetativo
- [ ] Etiquetas en los 15 `static/lang/*.json`: FUE, CON, DES, TAM, INT, POD, CAR, EST
      (traducidas por idioma; el inglés puede conservar STR/CON/DEX/SIZ/INT/POW/APP/EDU)

### F1.2 — Niveles de éxito
- [ ] `coc7/apps/dice-pool.js:91` `successLevel`: redefinir a
      `fumble / failure / regular / special / critical` (desaparece `hard`)
- [ ] `coc7/apps/dice-pool.js:1325` `#populateThresholdRanges()`: umbrales
      `crítico = floor(hab/20)`, `especial = floor(hab/5)`, `éxito = hab`
- [ ] `coc7/apps/dice-pool.js:1293`: pifia **siempre** 96-00, eliminar la condición `<50`
- [ ] `01` → éxito crítico automático; `00` → fallo y pifia automáticos
- [ ] Actualizar los iconos y textos de nivel de éxito en `dice-pool.js:690-703`
- [ ] Revisar `coc7/apps/check.js` (1233 líneas) por referencias a `hard`
- [ ] Revisar las plantillas de chat en `static/templates/chat/` que muestren niveles

### F1.3 — Características derivadas
- [ ] `Idea = INT×5`, `Suerte = POD×5`, `Cultura General = EST×5`
- [ ] La **Suerte deja de ser una reserva gastable** y pasa a ser derivada. Localizar y
      neutralizar el sistema de gasto de Luck de CoC7 (`luck` en `character-system.js`,
      `roll-normalize.js`, botones de "push" con suerte)
- [ ] `PV = ceil((TAM+CON)/2)`
- [ ] `PM = POD`; los PM por encima del tope se usan pero no se regeneran
- [ ] Inconsciencia con 1-2 PV; recupera consciencia con ≥3

### F1.4 — Modificador al Daño
- [ ] Implementar la tabla de 19 tramos por `FUE+TAM` (`dev-docs/reglas-cthulhu-d100.md` §2)
- [ ] Aplicación diferenciada: cuerpo a cuerpo/desarmado → MD completo;
      arrojadizas → **mitad**; armas de fuego → **no se aplica**

### F1.5 — Chequeos enfrentados
- [ ] Fórmula `50 + (activo - pasivo) × 5`, acotada a `[0,100]`
- [ ] `+10` o más → éxito automático; `-10` o menos → imposible
- [ ] Integrar con `coc7/apps/chat-opposed-message.js`

### F1.6 — Modificadores de circunstancia e iluminación
- [ ] Circunstancias: `+20 / +10 / -10 / -20` en el diálogo de tirada
- [ ] Iluminación: penumbra `×1/2`, oscuridad casi total `×1/4`, oscuridad total `×1/4`
      con tope `min(POD×3, INT×3)`

---

## F2 — Habilidades, armas y profesiones

**Objetivo:** compendios propios que sustituyan por completo a los de CoC7.

**Criterio de aceptación:** crear un investigador desde cero usando solo los compendios del
sistema, con reparto de `EST×20` + `INT×10` puntos.

### F2.1 — Compendio de habilidades
- [ ] Borrar `compendiums/en-skills.yaml` y crear `compendiums/es-habilidades.yaml`
      (+ traducciones) con las 5 categorías de `dev-docs/reglas-cthulhu-d100.md` §5:
      Conocimientos, Vocacionales, Sensoriales, Sociales, De acción
- [ ] Respetar el formato de upstream: `_id`, `name`, `type: skill`, `img`, `system.base`,
      `system.properties`, `flags.<id>.cocidFlag`
- [ ] Marcar con `specialization: true` las que la requieren: Ciencias naturales, Ciencias
      sociales y humanidades, Idiomas, Arte, Maestrías, Armas de Cuerpo a Cuerpo,
      Armas de Fuego
- [ ] Bases derivadas de atributo: Idioma materno `EST×5`, Autoridad `(EST+CAR)`,
      Intimidar `TAM×2` o `INT×2` a elección del jugador
- [ ] **Mitos de Cthulhu** con bandera que impida asignarle puntos en la creación
- [ ] Iconos: reutilizar `static/assets/icons/skills/` de upstream; no importar arte del PDF

### F2.2 — Armas
- [ ] `coc7/models/item/weapon-system.js`: añadir campos `pr` (Puntos de Resistencia),
      `empalar` (bool), `bloquear` (bool), `disfuncion` (int), `disparosPorTurno`
- [ ] Escopetas: soportar los tres valores daño/alcance (corta/media/larga)
- [ ] Compendio con las 3 tablas del §11: 10 cuerpo a cuerpo, 6 a distancia, 25 de fuego
- [ ] Reglas de disfunción/encasquillado por tipo de arma
- [ ] Objetos inanimados con PR; a 0 PR quedan inservibles

### F2.3 — Profesiones
- [ ] Las 10 profesiones del §10 como items de tipo `occupation`
- [ ] Puntos: `EST×20` profesionales + `INT×10` libres
- [ ] Modelar los grupos separados por `/` y las opciones "a elección"

### F2.4 — Creación de personajes
- [ ] Adaptar el asistente de creación de upstream
      (`coc7-investigator-wizard.less`, apps correspondientes) a la secuencia del §10

---

## F3 — Descenso a la Locura

**Objetivo:** los dos sistemas de cordura del manual, seleccionables por mundo.
**La parte con más trabajo original de todo el proyecto.**

**Criterio de aceptación:** con el sistema alternativo activo, un PJ con POD 13 muestra
barras de 7/6/7 casillas; al llenar la primera y marcar una de la segunda pasa a
"Intranquilo" y sus habilidades de Acción reciben `+10%` mientras el resto recibe `-10%`.

### F3.0 — Selector
- [ ] Ajuste de mundo `sanitySystem`: `clasico` | `alternativo`
- [ ] La ficha muestra un bloque u otro según el ajuste

### F3.1 — Sistema clásico
- [ ] Estabilidad Mental inicial `POD×5`
- [ ] Chequeo `1D100 ≤ EM`; notación de pérdida `X/Y`
- [ ] Pérdida grande → chequeo de Idea → locura temporal tantos turnos como puntos perdidos
- [ ] Perder ≥20% de la EM restante en una escena → problema a largo plazo
- [ ] EM a 0 → locura irremediable, el PJ pasa a PNJ
- [ ] Reaprovechar `coc7/apps/san-check-card.js` de upstream, que ya es muy parecido

### F3.2 — Sistema alternativo: estructura
- [ ] Modelo de datos: 3 barras. Barra 1 `ceil(POD/2)`, barra 2 `floor(POD/2)`,
      barra 3 `ceil(POD/2)`
- [ ] Contador de **Locura Subyacente**
- [ ] Impactos: se ignora la primera cifra de `X/Y`, siempre se tira `Y`; cada jugador tira
      por separado

### F3.3 — Sistema alternativo: estados
- [ ] Tranquilo → sin modificadores
- [ ] Intranquilo (barra 1 llena + ≥1 en barra 2) → Acción `+10%`, resto `-10%`
- [ ] Tenso (barra 2 llena + ≥1 en barra 3) → Acción `+20%`, resto `-20%`
- [ ] Enajenación Transitoria (3 barras llenas) → no puede actuar voluntariamente
- [ ] Al tachar la última casilla de la barra 2 → `+1` Locura Subyacente
- [ ] Con las 3 barras llenas, los impactos posteriores se ignoran
- [ ] **Impacto masivo** (> `POD×1,5` en un solo golpe): contar cuántas veces los puntos
      igualan el POD → tachar esa cantidad en Locura Subyacente; el resto va a la barra 1
- [ ] Los modificadores de estado deben distinguir habilidades **de Acción** del resto:
      requiere que cada habilidad conozca su categoría (viene de F2.1)

### F3.4 — Sistema alternativo: recuperación
- [ ] Chequeo `INT×5%` al cesar el estímulo, con modificador por estado
      (Tranquilo `+10`, Intranquilo `0`, Tenso `-10`, Enajenación `-20`)
- [ ] Éxito → borra las tres barras. Fallo → `+1D6` puntos de tensión
- [ ] Cada hora sin impactos → nuevo chequeo con `+10%` acumulativo

### F3.5 — Locura a largo plazo
- [ ] Al final de sesión: `1D6`; si es **menor** que la Locura Subyacente → trastorno
- [ ] Gravedad = `Locura Subyacente - resultado`, sin máximo
- [ ] Tabla de gravedad 1-6 con ejemplos (§6b)
- [ ] Los puntos de Locura Subyacente **no** se pierden al desarrollar el trastorno
- [ ] Segundo trastorno: agudizar (`max(antiguo,nuevo)+1`) o paralelo, a elección del GM
- [ ] **Acostumbrarse a la tensión**: cada impacto se reduce en tantos puntos como
      Locura Subyacente tenga el personaje
- [ ] Tratamiento: chequeo mensual de Psicología/Psicoanálisis con `-10%` por grado;
      éxito `-1` grado y `-1` punto; crítico `-2` y `-2`. Gravedad 1-3 ambulatorio, 4+ internamiento
- [ ] Tomos de los Mitos: pérdida `×2`; cada vez que iguale el POD (o fracción)
      → `+1` Locura Subyacente
- [ ] Tabla de pérdidas de referencia (§6b) como RollTable del compendio

---

## F4 — Combate

**Objetivo:** secuencia de combate del manual, con tablas cruzadas en vez de tirada
enfrentada.

**Criterio de aceptación:** un atacante con Especial contra un defensor que esquiva con
Fallo produce "Empala" (daño ×2); el mismo atacante contra un defensor con Crítico produce
"Falla".

### F4.1 — Iniciativa y estructura de turno
- [ ] Iniciativa por **DES 3-18**; empate → mayor % en la habilidad implicada;
      empate persistente → simultáneo
- [ ] Turno de 12 segundos, 5 por minuto
- [ ] **Declaración de acciones** en orden decreciente de iniciativa; cambiar lo declarado
      → `-20%`, salvo si se cambia a esquivar o bloquear

### F4.2 — Tablas cruzadas
- [ ] Tabla de **Esquiva** 5×5 (§7). Resultado aplicado al **Atacante**
- [ ] Tabla de **Bloqueo** 5×5, incluida la pérdida de PR del arma del atacante
      (`-6 PR`, `-4 PR`, `-2 PR` según celda)
- [ ] Resultados posibles: `Falla`, `Golpea`, `Empala`, `Máx. D`, `Pifia`
- [ ] Reescribir `coc7/apps/chat-combat-melee.js` y `chat-combat-ranged.js`

### F4.3 — Reglas de combate
- [ ] Empalar: ataque Especial → daño `×2`; armadura normal; esquiva/bloqueo especial o
      crítico lo anula, éxito simple lo reduce a daño normal
- [ ] Bloquear: máximo 1 por turno; el objeto recibe el daño original
- [ ] Esquivar: múltiple, `-30%` acumulativo del segundo en adelante
- [ ] Máximo 5 atacantes por objetivo
- [ ] Combate desarmado bloqueado por arma blanca → sufre el daño del arma
- [ ] Noquear, Centrarse (`+10%` por 5 DES retrasados), Presa, Defenderse (`+20%`),
      Esperar, Sorpresa (DES a la mitad el primer turno), Cubierto/tumbado (`-20%`)

### F4.4 — Distancia y armas de fuego
- [ ] Tabla de alcance: `DES×3` m → `×2`; alcance básico → `×1`; 2× → `/2`; 3× → `/4`; 4× → `/8`.
      **Se aplica antes que los demás modificadores**
- [ ] Preparar arma (`-5` DES), recargar, ráfagas (`+5%` por bala, tope doble del %,
      máximo 20 balas/turno), ráfaga a varios objetivos
- [ ] Encasquillado por valor de Disfunción; reparación con habilidad o Maestría/Armería,
      `1D6` turnos
- [ ] Miras telescópicas y silenciadores

### F4.5 — Localización de impactos (opcional)
- [ ] Ajuste de mundo para activarla
- [ ] Tabla `1D20` de 7 localizaciones
- [ ] PV por localización según `TAM+CON` (tabla de 7 columnas)
- [ ] Efectos a 0 o negativo, y efectos en o por debajo de `-X`, por localización
- [ ] Muerte por hemorragia si no se trata en `ceil((CON+POD)/2)` turnos

### F4.6 — Daño
- [ ] Categorías: leve (≤50% PV), grave (>50% de una vez), mortal (PV a 0)
- [ ] Herida grave → actúa tantos turnos como PV le queden, luego inconsciente 1 hora
- [ ] Tabla de **Heridas Graves** `1D100`, 14 entradas, como RollTable
- [ ] Recuperación `1D3` PV/semana, `+1D3` con Primeros Auxilios ≥30%, `+2D3` con Medicina
- [ ] Blindaje: se resta antes de aplicar a PV
- [ ] Otras fuentes: ácido, asfixia, ahogamiento, caídas, conmoción, explosiones, fuego,
      enfermedades (POT vs CON), veneno, hambre/sed/intemperie

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

## Pendientes transversales

- [ ] Extraer del PDF el cap. 9 "Criaturas de los Mitos" (pp. 38-43) y añadirlo a
      `dev-docs/reglas-cthulhu-d100.md`; luego crear el compendio de criaturas
- [ ] Extraer del PDF el cap. 10 "Tomos arcanos" (pp. 44-45): mecánica de hojear y estudiar
- [ ] Decidir si se conserva el sistema de **eras** (`cocidFlag.eras`) de upstream o se elimina
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
