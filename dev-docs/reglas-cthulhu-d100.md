# Cthulhu d100 — Extracción de reglas para implementación en Foundry VTT

Fuente: *Cthulhu d100*, Three Fourteen Games, 2011 (52 pp).
Basado en GORE (Daniel Proctor) → SRD de RuneQuest, licencia OGL.
El PDF autoriza expresamente crear material adicional citando la fuente y sin ánimo de lucro.

Este documento es la especificación funcional. Cada sección apunta al módulo del sistema
que la implementa.

---

## 1. Atributos

Ocho atributos en escala **3–18** (no percentil, a diferencia de CoC7).

| Atributo | Abrev. | Tirada | Equivalente CoC7 |
|---|---|---|---|
| Fuerza | FUE | 3D6 | STR |
| Constitución | CON | 3D6 | CON |
| Destreza | DES | 3D6 | DEX |
| Tamaño | TAM | 2D6+6 | SIZ |
| Inteligencia | INT | 2D6+6 | INT |
| Poder | POD | 3D6 | POW |
| Carisma | CAR | 3D6 | APP |
| Estudios | EST | 3D6+3 | EDU |

Reglas de atributo a 0 / bajo:
- Cualquier atributo salvo CAR por debajo de 4 → personaje inválido, necesita ayuda.
- Cualquier atributo salvo CAR a 0 → muerte.
- INT o POD a 0 → estado vegetativo (vivo).

### Chequeo de atributo
`1D20 ≤ atributo`, o equivalentemente `1D100 ≤ atributo × 5`. Ambos métodos son
estadísticamente equivalentes; el sistema usa el percentil.

---

## 2. Características derivadas

| Derivado | Fórmula |
|---|---|
| Idea | `INT × 5` % |
| Suerte | `POD × 5` % |
| Cultura General | `EST × 5` % |
| Puntos de Vida (PV) | `ceil((TAM + CON) / 2)` |
| Puntos de Magia (PM) | `POD` |
| Modificador al Daño (MD) | tabla por `FUE + TAM` |

> Nota: en CoC7 la Suerte es una reserva tirada aparte. Aquí es **derivada** de POD.

### Tabla de Modificador al Daño (MD)

| FUE+TAM | MD | FUE+TAM | MD |
|---|---|---|---|
| 1–5 | -1D8 | 61–70 | +2D6 |
| 6–10 | -1D6 | 71–80 | +2D8 |
| 11–15 | -1D4 | 81–90 | +2D10 |
| 16–20 | -1D2 | 91–100 | +2D12 |
| 21–25 | 0 | 101–120 | +3D10 |
| 26–30 | +1D2 | 121–140 | +3D12 |
| 31–35 | +1D4 | 141–160 | +4D10 |
| 36–40 | +1D6 | 161–180 | +4D12 |
| 41–45 | +1D8 | 181–200 | +5D10 |
| 46–50 | +1D10 | | |
| 51–60 | +1D12 | | |

Aplicación del MD:
- Combate cuerpo a cuerpo y desarmado: MD completo.
- Armas arrojadizas: **mitad** del MD.
- Armas de fuego: **no se aplica**.

---

## 3. Resolución de chequeos

`1D100` contra el porcentaje efectivo de la habilidad.

| Resultado | Nivel |
|---|---|
| `≤ hab/20` (redondeo abajo) | **Crítico** |
| `≤ hab/5` (redondeo abajo) | **Especial** |
| `≤ hab` | **Éxito** |
| `> hab` | Fallo |
| `96–00` | **Pifia** |

Casos automáticos:
- `01` → siempre éxito crítico automático.
- `00` → siempre fallo y pifia.

> Divergencia clave con CoC7: CoC7 tiene 4 niveles (regular / hard `/2` / extreme `/5` /
> critical `01`) y la pifia depende de si el umbral es <50. Aquí son 3 niveles de éxito
> (`éxito` / `especial` `/5` / `crítico` `/20`) y la pifia es **siempre 96–00**.

### Modificadores de circunstancia

| Circunstancias | Mod. |
|---|---|
| Muy favorables | +20% |
| Favorables | +10% |
| Desfavorables | -10% |
| Muy desfavorables | -20% |

### Chequeos enfrentados

Factor Activo (quien intenta algo) vs Factor Pasivo (quien resiste). Se comparan
puntuaciones de atributo. Base 50%, ±5% por punto de diferencia.

| Dif. | % éxito | Dif. | % éxito |
|---|---|---|---|
| +10 o más | Automático | -1 | 45% |
| +9 | 95% | -2 | 40% |
| +8 | 90% | -3 | 35% |
| +7 | 85% | -4 | 30% |
| +6 | 80% | -5 | 25% |
| +5 | 75% | -6 | 20% |
| +4 | 70% | -7 | 15% |
| +3 | 65% | -8 | 10% |
| +2 | 60% | -9 | 5% |
| +1 | 55% | -10 o menos | Imposible |
| 0 | 50% | | |

Fórmula: `50 + (activo - pasivo) × 5`, acotada a `[0, 100]` con extremos automáticos.

### Iluminación

| Nivel | Efecto |
|---|---|
| Penumbra | habilidad a la **mitad** |
| Oscuridad casi total | habilidad a **un cuarto** |
| Oscuridad total | habilidad a un cuarto, con **tope** `min(POD×3, INT×3)` % |

Radios de luz: vela/cerillas 30 cm · antorcha/candil 1,5 m · hoguera 5 m · gran hoguera 15 m.

---

## 4. Experiencia

- **Tiradas de Mejora**: el GM marca la habilidad cuando se usa con éxito notable.
  Al final del escenario: `1D100`; si supera el porcentaje actual → `+1D3`.
  Resultados de 98+ siempre suben, aunque la habilidad esté por encima.
- **Estudio y práctica**: 2 semanas intensivas por cada 10% (o fracción) que se tenga
  al empezar. Al terminar, chequeo de POD → `+1D3`; si falla, tiempo perdido.
- **Mentores**: alguien con al menos 10% más reduce el tiempo un 25%.

---

## 5. Habilidades

Base entre paréntesis. `*` = requiere especialización (se compran y suben por separado).

### Conocimientos
| Habilidad | Base |
|---|---|
| Burocracia | 10% |
| Ciencias naturales `*` | 0% (Biología 5%) |
| Ciencias ocultas | 5% |
| Ciencias sociales y humanidades `*` | 0% (Antropología 5%, Arqueología 5%, Ciencias Políticas 5%, Criminología 5%, Geografía 10%, Historia 10%) |
| Idiomas `*` | Materno `EST×5`, otros 0% |
| Manejo de archivos | 25% |
| Medicina | 0% |
| Mitos de Cthulhu | 0% |
| Primeros auxilios | 15% |
| Psicoanálisis | 0% |
| Psicología | 5% |

### Vocacionales
| Habilidad | Base |
|---|---|
| Arte `*` | 5% (Canto, Danza, Escritura, Escultura, Interpretación, Música, Pintura) |
| Bricolaje | 20% |
| Maestrías `*` | 0% (Electricidad 5%, Mecánica 20%; Armería, Cerrajería, Electrónica, Falsificación) |

### Sensoriales
| Habilidad | Base |
|---|---|
| Discreción | 10% |
| Esconder/se | 15% |
| Escuchar | 25% |
| Orientación | 15% |
| Percibir | 25% |
| Seguir rastros | 10% (-10% acumulativo por día transcurrido) |
| Supervivencia | 15% |

### Sociales
| Habilidad | Base |
|---|---|
| Autoridad | `(EST + CAR)` % |
| Bajos fondos | 10% |
| Embaucar | 10% |
| Intimidar | `TAM×2` o `INT×2` % (a elección del jugador) |
| Oratoria | 10% |
| Protocolo | `EST×2` % |

### De acción
| Habilidad | Base |
|---|---|
| Armas de Cuerpo a Cuerpo `*` | según arma (ver cap. 8) |
| Armas de Fuego `*` | según arma (ver cap. 8) |
| Conducir | 25% |
| Esquivar | `DES×2` % |
| Forma física | `DES+FUE` % |
| Lucha | `DES×2` % |

Notas:
- **Mitos de Cthulhu** no puede recibir puntos en la creación del personaje.
- Idiomas: 50% para entender, 60%+ para identificar acento/jerga. Modificadores
  +20% (mensaje claro) / +10% (términos complejos) si solo se necesita comprender.

---

## 6. Descenso a la Locura — DOS sistemas seleccionables

El manual ofrece dos mecánicas completas. El sistema debe permitir elegir una por mundo
(setting de juego).

### 6a. Sistema "clásico"

- Estabilidad Mental inicial = `POD × 5`.
- Chequeo `1D100 ≤ EM actual`. Éxito → pérdida mínima; fallo → pérdida mayor.
  Notación `X/Y` (p. ej. `0/1D6`, `1/1D6+1`).
- Pérdida grande de golpe → chequeo de **Idea**; si tiene éxito, el PJ comprende y
  enloquece temporalmente durante tantos turnos como puntos de EM perdidos.
- Perder ≥20% de la EM restante en una escena → problema psicológico a largo plazo.
- EM a 0 → locura irremediable, el PJ pasa a PNJ.

### 6b. Sistema "alternativo" (Tensión / Estabilidad Mental)

Mecánica original del manual, **sin equivalente en CoC7**. Es la parte con más trabajo.

**Estructura de datos**: tres barras de casillas.
- Barra 1: `ceil(POD/2)` casillas
- Barra 2: `floor(POD/2)` casillas
- Barra 3: `ceil(POD/2)` casillas
- Total ≈ `POD × 1,5`

Ejemplo POD 13 → barras de 7 / 6 / 7.

**Impactos**: se usa la notación `X/Y` del sistema clásico pero **se ignora la primera
cifra** — siempre se tira `Y`. Cada jugador tira por separado.

**Estados y modificadores**:

| Estado | Condición | Habilidades de Acción | Resto de habilidades |
|---|---|---|---|
| Tranquilo | solo marcas en barra 1 | — | — |
| Intranquilo | barra 1 llena + ≥1 en barra 2 | +10% | -10% |
| Tenso | barra 2 llena + ≥1 en barra 3 | +20% | -20% |
| Enajenación Transitoria | las tres barras llenas | no puede actuar voluntariamente | |

- Al tachar la **última casilla de la barra 2** (impactos = POD) → gana 1 punto de
  **Locura Subyacente**.
- Tres barras llenas y siguen los impactos → se ignoran.
- **Impacto masivo**: si un único impacto supera el total de casillas (`POD×1,5`),
  contar cuántas veces los puntos igualan el POD → tachar esa cantidad de casillas de
  **Locura Subyacente**, y el resto se anota normalmente en la barra 1.

**Enajenación Transitoria**: el GM toma el control. Amenaza asequible → la ataca;
amenaza superior → huye; sin amenaza física → posición fetal.

**Vuelta a la normalidad**: al cesar el estímulo, chequeo de `INT×5`%:

| Estado | Mod. al chequeo |
|---|---|
| Tranquilo | +10% |
| Intranquilo | — |
| Tenso | -10% |
| Enajenación Transitoria | -20% |

- Éxito → se borran **todas** las marcas de las tres barras.
- Fallo → `+1D6` puntos de tensión.
- Cada hora sin nuevos impactos → nuevo chequeo con +10% acumulativo.

**Locura a largo plazo**: al final de cada sesión, `1D6`. Si el resultado es **menor**
que los puntos de Locura Subyacente → se desarrolla un trastorno.
Gravedad = `Locura Subyacente - resultado del dado`. Sin máximo.

| Gravedad | Agudeza | Ejemplo |
|---|---|---|
| 1 | Esporádico | Limpia los cubiertos antes de usarlos |
| 2 | Leve | Con luna llena baja todas las persianas |
| 3 | Media | Enciende y apaga la luz dos veces al salir |
| 4 | Grave | No puede ingerir nada de color rojo |
| 5 | Severa | No puede pisar la sombra de una persona |
| 6 | Incapacitante | Entra en crisis al ver a alguien pelirrojo |

- Los puntos de Locura Subyacente **no** se pierden al desarrollar el trastorno.
- Segundo trastorno: puede agudizar el primero (`max(antiguo, nuevo) + 1`) o ser paralelo.
- **Acostumbrarse a la tensión**: cada impacto de tensión se reduce en tantos puntos
  como Locura Subyacente tenga el personaje.

**Tratamiento médico**: chequeo mensual de Psicología o Psicoanálisis con `-10%` por
punto de gravedad. Éxito → -1 grado y -1 punto de Locura Subyacente. Crítico → -2 y -2.
Gravedad 1–3 ambulatorio; 4+ requiere internamiento.

**Tomos de los Mitos**: causan Locura Subyacente directamente. Si el tomo tiene valores
de otro sistema, tirar la pérdida y **multiplicar por 2**; cada vez que el resultado
iguale el POD del lector (o fracción) → +1 punto de Locura Subyacente.

### Tabla de pérdidas de Estabilidad Mental (referencia)

| Situación | Pérdida |
|---|---|
| Encontrar un animal muerto, velas y un recipiente con sangre | 0/1D2 |
| Ver un cadáver por sorpresa | 0/1D3 |
| Encontrar un cadáver calcinado | 0/1D3 |
| Encontrar los restos de una ceremonia con sacrificio humano | 0/1D4 |
| Ver los restos del sacrificio humano | 1/1D4+1 |
| Despertar atado en un entorno extraño | 0/1D6 |
| Ser atacado de forma organizada por ratas o insectos | 0/1D6 |
| Ver un gul o un profundo | 1/1D6 |
| Verte obligado a matar a un conocido inocente | 1/1D6+1 |
| Ver como un conocido te elige como sacrificio | 0/1D10 |
| Ser el sacrificio humano en una ceremonia | 1/1D10 |
| Ver como el cielo se tiñe de rojo | 2/2D10+1 |
| Ver al Gran Cthulhu | 1D10/1D100 |

---

## 7. Combate

- Turno = **12 segundos**. 5 turnos por minuto.
- **Iniciativa por DES** (atributo 3–18, no percentil). Empate → mayor % en la
  habilidad implicada. Si persiste → simultáneo.
- **Declaración de acciones** antes del turno, en orden decreciente de iniciativa.
  Cambiar la acción declarada → `-20%` (excepto si se cambia a esquivar o bloquear).

### Secuencia
1. Atacar: `1D100` vs habilidad del arma.
2. Reacción del objetivo: esquivar o bloquear (consume su acción del turno).
3. Resolución de daño: dados del arma + MD.
4. Aplicación: restar la armadura, luego descontar PV.

### Tabla de Esquiva

Filas = Atacante, columnas = Defensor. **El resultado se aplica al Atacante.**

| At \ Def | Pifia | Fallo | Éxito | Especial | Crítico |
|---|---|---|---|---|---|
| **Pifia** | Falla | Falla | Pifia | Pifia | Pifia |
| **Fallo** | Falla | Falla | Falla | Pifia | Pifia |
| **Éxito** | Empala | Golpea | Falla | Falla | Pifia |
| **Especial** | Máx. D | Empala | Golpea | Falla | Falla |
| **Crítico** | Máx. D | Máx. D | Empala | Golpea | Falla |

### Tabla de Bloqueo

| At \ Def | Pifia | Fallo | Éxito | Especial | Crítico |
|---|---|---|---|---|---|
| **Pifia** | Falla | Falla | Pifia | Pifia | Pifia |
| **Fallo** | Falla | Falla | Falla | Pifia (-6 PR) | Pifia (-4 PR) |
| **Éxito** | Empala | Golpea | Falla | Falla | Pifia (-2 PR) |
| **Especial** | Máx. D | Empala | Golpea | Falla | Falla |
| **Crítico** | Máx. D | Máx. D | Empala | Golpea | Falla |

`Máx. D` = daño máximo del arma. `-N PR` = el arma del Atacante pierde esos Puntos de
Resistencia.

### Reglas de combate

| Regla | Efecto |
|---|---|
| **Empalar** | Ataque con resultado ≤ 1/5 del % efectivo (= Especial) → daño ×2. La armadura se aplica normal. Esquiva/bloqueo especial o crítico lo anula; éxito simple lo reduce a daño normal |
| **Bloquear** | Máximo 1 por turno. El objeto usado recibe el daño original |
| **Esquivar** | Se puede esquivar más de un ataque; del segundo en adelante `-30%` acumulativo |
| **Nº de atacantes** | Máximo 5 oponentes sobre un objetivo |
| **Combate desarmado** | Bloqueado por arma blanca → el desarmado sufre el daño del arma |
| **Noquear** | Declarar antes de tirar. Daño ≥ Herida Grave → inconsciente `1D10+10` turnos. Daño de Herida Leve → falla, inflige daño mínimo del arma sin MD |
| **Centrarse en un objetivo** | `+10%` por cada 5 puntos de DES que retrase |
| **Presa** | Éxito → víctima inmovilizada este turno y el siguiente. Enfrentado FUE vs FUE para desarmar. Liberarse: `DES×3`% |
| **Defenderse** | Solo defensiva → `+20%` a esquivar/bloquear hasta el turno siguiente |
| **Esperar** | Reduce la DES efectiva a voluntad (nunca por debajo de 1) |
| **Sorpresa** | DES a la mitad para iniciativa, solo el primer turno. Puede bloquear/esquivar con DES normal |
| **Cubierto o tumbado** | `-20%` a Esquivar propio; `-20%` a quien le ataque a distancia |

### Ataques a distancia

| Distancia | Habilidad |
|---|---|
| ≤ `DES×3` metros | `×2` |
| ≤ Alcance Básico | `×1` |
| ≤ 2× Alcance Básico | `/2` |
| ≤ 3× Alcance Básico | `/4` |
| ≤ 4× Alcance Básico | `/8` |

Este ajuste se aplica **antes** que los demás modificadores.

| Regla | Efecto |
|---|---|
| **Preparar el arma** | Desenfundar/amartillar → `-5` DES para iniciativa |
| **Recargar** | 1 turno = 2 balas o cambiar cargador; 2 turnos = cinta de ametralladora. Cargar 1 + disparar el mismo turno → DES a la mitad |
| **Ráfagas** | `+5%` por cada bala después de la primera, hasta el doble del %. Tope 20 balas/turno. Impactos = tirada aleatoria sobre nº de balas |
| **Ráfaga a varios objetivos** | Sin bonificación por bala; se resuelve por separado |
| **Encasquillado** | Tirada ≥ valor de Disfunción del arma. No automáticas: no dispara ese turno. Automáticas: chequeo de habilidad o Maestría/Armería; éxito → `1D6` turnos para recuperarla |
| **Miras telescópicas** | Retrasar iniciativa a la mitad de DES → doble alcance efectivo, y Objetivo cercano hasta `DES×6` m. No combinable con Centrarse. Con rifles, apuntar con mira → alcance base `×4` sin alterar DES |
| **Silenciador** | Alcance efectivo `/2`, dura `1D100+10` disparos |

### Localización de impactos (opcional)

`1D20`:

| 1D20 | Localización |
|---|---|
| 1–3 | Pierna derecha |
| 4–6 | Pierna izquierda |
| 7–9 | Abdomen |
| 10–12 | Torso |
| 13–15 | Brazo derecho |
| 16–18 | Brazo izquierdo |
| 19–20 | Cabeza |

**PV por localización** (por suma de TAM + CON):

| Localización | 6–10 | 11–15 | 16–20 | 21–25 | 26–30 | 31–35 | 36–40 |
|---|---|---|---|---|---|---|---|
| Cada pierna | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| Abdomen | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| Torso | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| Cada brazo | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| Cabeza | 2 | 3 | 4 | 5 | 6 | 7 | 8 |

**Localización a 0 o negativo (sin superar los PV originales en negativo)**:
- Cabeza: inconsciente. Pierde 1 PV/asalto salvo chequeo de CON o ayuda médica.
- Torso: inconsciente con hemorragia (mismo efecto).
- Abdomen: cae al suelo, piernas no responden, se arrastra a 1/4 de Movimiento, hemorragia.
- Extremidades: inútil hasta recuperar ≥1 PV o recibir primeros auxilios. Pierna →
  derribado, al levantarse mitad de movimiento. Brazo → suelta lo que porte.

**Localización en o por debajo de `-X`** (el negativo iguala o supera los PV originales):
- Cabeza: muerte inmediata.
- Torso o abdomen: inconsciente al instante + `CON×4`% cada turno o muerte. Aunque
  supere los chequeos, muere si no se trata en `ceil((CON+POD)/2)` turnos.
- Extremidades: miembro inútil + `CON×4`% o pierde el conocimiento. Muere si no se
  restablece en `ceil((CON+POD)/2)` turnos. Pierna → no puede mantenerse en pie,
  `-30%` a Discreción y Esquivar.

---

## 8. Daño

### Categorías de herida
- **Herida leve**: ≤50% del máximo de PV. Varias que sumen >50% en 24 h → `CON×4`%
  para evitar la inconsciencia (sin usar la tabla de Heridas Graves).
- **Herida grave**: >50% de los PV originales de una sola vez. El personaje solo puede
  actuar tantos turnos como PV le queden, luego inconsciente 1 hora. Efectos a largo
  plazo → tabla de Heridas Graves. Se puede conceder un chequeo de Suerte para librarse.
- **Herida mortal**: PV a 0. Solo se evita la muerte con Primeros auxilios o tratamiento
  médico antes de que acabe el turno siguiente.
- **Inconsciencia**: con 1 o 2 PV restantes. Vuelve en sí al recuperar ≥3.

### Recuperación
`1D3` PV por semana de reposo. `+1D3` con cuidados de alguien con ≥30% en Primeros
Auxilios, o `+2D3` con Medicina.

### Tabla de Heridas Graves (`1D100`)

| 1D100 | Tipo | Pérdida | Descripción |
|---|---|---|---|
| 01–11 | I | 1D3 CAR | Cicatrices acusadas, no se pueden ocultar |
| 12–21 | II | 1D3 INT | Herida en la cabeza. Máximo 65% en habilidades SOCIALES |
| 22–31 | III | 1D3 FUE | Heridas en extremidades superiores, posible pérdida de dedos |
| 32–41 | IV | 1D3 DES y 1D3 Mov | Trauma grave en pierna o pie |
| 42–51 | V | 1D3 DES y 1D3 Mov | Abdomen herido, posibles órganos dañados |
| 52–61 | VI | 1D6 CAR | Como I pero más severo |
| 62–71 | VII | 1D6 FUE | Como III + pérdida permanente de 1D3 PV irrecuperables |
| 72–81 | VIII | 1D6 DES y 1D6 Mov | Como IV, pero el miembro queda amputado |
| 82–91 | IX | 1D3 FUE y 1D3 CON **o** 1D6 CON y 1D6 Mov | Como V, pero más grave |
| 92–93 | X | 1D6 DES | Un brazo queda inútil |
| 94–97 | XI | 1D6 DES | Ambos brazos inútiles |
| 98 | XII | 1D3 CON, 1D3 CAR y 1D3 DES | Secuelas por todo el cuerpo |
| 99 | XIII | 1D6 CAR | El PJ pierde parte de la cara |
| 00 | XIV | 1D4 a 4 atributos al azar | Traumatismo múltiple |

### Otras fuentes de daño

| Fuente | Efecto |
|---|---|
| **Ácido** | Fuerte `1D6+1` · Medio `1D4` · Débil `1D3-1`, por turno |
| **Asfixia** | Aguanta `CON/2` turnos, después `1D6` PV/turno. Con esfuerzo físico, desde el primer turno |
| **Ahogamiento** | Fallo en Forma física → `DES×5`% para flotar; cada fallo baja a `DES×4`%, `DES×3`%… hasta `DES`%. Cada fracaso `1D6` PV |
| **Caídas** | `1D6` PV por cada 3 m a partir del cuarto. Chequeo de DES → `-1D6` al total |
| **Conmoción** | Puede defenderse o moverse, no atacar. `CON×5`% cada turno para recuperarse |
| **Explosiones** | Daño completo dentro del radio base. `-1D6` PV por cada radio adicional de distancia |
| **Fuego** | Vela 1 · Antorcha `1D6` (Suerte o prende la ropa) · Gran hoguera `1D6+2` (prende ropa y pelo) · Habitación en llamas `1D6+2` (Suerte o asfixia) · Lava/forja `3D6`. Protección común aguanta `1D6` turnos. Daño ≥ mitad de PV máx → `1D4` puntos de atributo perdidos, al menos 1 de CAR |
| **Enfermedades** | POT 3–21. Enfrentado POT (activo) vs CON (pasivo). Segundo chequeo posterior: éxito → fase más grave; fallo → curación |
| **Veneno** | POT 3–21. Enfrentado POT vs CON. Por defecto la POT es también la pérdida de PV |
| **Hambre / sed / intemperie** | Aguanta `CON` días sin comida; `-10%` a todo desde el 3.er día. Aguanta `CON×4` horas sin agua (`CON×3` o `CON×2` en desierto). Aun superando chequeos, `-1` PV por día y por condición adversa |

### Blindaje
Se resta el valor de protección al daño **antes** de aplicarlo a los PV.

### Objetos inanimados
Todo objeto tiene Puntos de Resistencia (PR). A 0 PR queda inservible. Se puede declarar
un ataque contra un objeto portado por un adversario; el GM puede aplicar modificadores
negativos por tamaño o exposición parcial.

---

## 9. Magia

- Reserva inicial de PM = `POD`. Se descuenta al formular hechizos.
- PM por encima del tope (PM recibidos de deidades o absorbidos) se usan con normalidad
  pero **no se regeneran**.
- Bajar el POD reduce el máximo recuperable de PM.
- Hechizos muy poderosos pueden costar POD directamente.

### Aprender hechizos
- Memorizar leyendo con tiempo y tranquilidad: `INT×5`% si el idioma es conocido,
  `INT×3`% si no. Sin límite de hechizos memorizados.
- También se puede lanzar leyendo el texto en el momento.
- Escritos por otra persona para uso propio: hay que estudiarlos `21 - INT` días para
  entenderlos plenamente.

### Lanzar hechizos
- Salvo indicación contraria, el efecto se produce **el turno posterior** al lanzamiento.
- Durante la formulación el lanzador no puede realizar ninguna otra acción. Una
  distracción (un estruendo, un empujón) puede frustrar el hechizo.

---

## 10. Creación de personajes

1. Tirar atributos (ver §1).
2. Calcular derivados (ver §2).
3. Elegir profesión (opcional, solo orientativa).
4. Repartir puntos de habilidad:
   - `EST × 20` puntos entre las habilidades de su campo profesional.
   - `INT × 10` puntos entre cualesquiera habilidades de la ficha.
   - Se suman a las bases que ya tenga cada habilidad.
   - **Mitos de Cthulhu** no puede recibir puntos.

### Profesiones

Los grupos de habilidades se separan con `/`.

| Profesión | Habilidades |
|---|---|
| **Anticuario** | Ciencias ocultas, Ciencias sociales y humanidades (Historia + hasta 2 a elección), Idioma (uno no nativo), Manejo de archivos / Embaucar |
| **Detective de la policía** | Burocracia, Ciencias sociales y humanidades (Criminalística) / Discreción, Esconder/se, Escuchar, Percibir / Autoridad, Intimidar / Armas de Fuego (Armas Cortas + hasta 1 más) |
| **Detective privado** | Burocracia / Arte (Interpretación) / Discreción, Esconder/se, Escuchar, Percibir / Bajos Fondos, Intimidar / Armas de Cuerpo a Cuerpo (una a elección), Armas de Fuego (Armas Cortas), Lucha |
| **Diletante** | Ciencias sociales y humanidades (al menos 2 a elección) / Arte (una a elección) / Autoridad, Protocolo |
| **Escritor** | Ciencias sociales y humanidades (1–3 a elección), Idiomas (uno además del nativo), Manejo de Archivos / Arte (Escritura) / Percibir / Autoridad |
| **Explorador** | Burocracia, Ciencias naturales (una), Ciencias sociales y humanidades (al menos una), Idiomas (uno además del nativo), Primeros Auxilios / Orientación, Percibir, Seguir rastros, Supervivencia / Armas de Fuego (Armas Largas), Forma Física |
| **Médico** | Ciencias naturales (Biología o Farmacología + hasta 1 más), Idiomas (latín), Manejo de archivos, Medicina, Primeros auxilios, Psicología / Percibir / Autoridad |
| **Periodista** | Ciencias sociales y humanidades (al menos una), Manejo de archivos / Arte (Escritura) / Discreción, Esconder/se, Escuchar, Percibir / una de: Psicología, Bajos fondos o Embaucar |
| **Profesor universitario** | Burocracia, Ciencias naturales (al menos 2) **o** Ciencias sociales y humanidades (al menos 2), Idiomas (al menos uno además del nativo), Manejo de archivos / Autoridad, Oratoria |
| **Religioso** | Ciencias naturales (una), Ciencias ocultas, Ciencias sociales y humanidades (al menos una), Idiomas (al menos uno además del nativo), Psicología / Autoridad, Oratoria |

---

## 11. Armas

### Armas de cuerpo a cuerpo

| Nombre | Hab. base | Especialización | Daño | Empalar/Bloquear | PR |
|---|---|---|---|---|---|
| Navaja | 25% | Cortas | 1D4 | sí/no | 6 |
| Daga | 20% | Cortas | 1D4+2 | sí/no | 8 |
| Hacha pequeña | 15% | Cortas | 1D6 | sí/no | 6 |
| Porra | 25% | Cortas | 1D8 | no/no | 10 |
| Espada | 5% | Largas | 2D8 | sí/sí | 18 |
| Cimitarra | 15% | Largas | 1D8+2 | sí/sí | 19 |
| Lanza corta | 10% | Largas | 1D8 | sí/sí | 7 |
| Vara de metal | 25% | Largas | 1D8 | no/sí | 20 |
| Hacha de bombero | 15% | Largas | 2D6+2 | sí/sí | 10 |
| Motosierra | 20% | Largas | 2D8 | sí/sí | 20 |

### Armas a distancia

| Nombre | Hab. base | Alcance | Daño | PR |
|---|---|---|---|---|
| Cerbatana | 25% | 15 m | 1D2 | 6 |
| Daga | 20% | 5 m | 1D6 | 8 |
| Dardo | 15% | 20 m | 1D4 | — |
| Jabalina | 25% | 40 m | 1D6 | 8 |
| Arco largo | 5% | 175 m | 2D8 | 7 |
| Piedra | 15% | 10 m | 1D4 | — |

### Armas de fuego

| Nombre | Especialización | Daño | Alcance | Disparos/turno | Munición | PR | Disfunción |
|---|---|---|---|---|---|---|---|
| .22 Automática | Armas Cortas | 1D6 | 10 m | 3 | 6 | 6 | 00 |
| .32 Automática | Armas Cortas | 1D8 | 15 m | 3 | 8 | 8 | 99 |
| .32 Revólver | Armas Cortas | 1D8 | 15 m | 3 | 6 | 10 | 00 |
| .357 Revólver | Armas Cortas | 2D6 | 18 m | 1 | 6 | 11 | 00 |
| .38 Automática | Armas Cortas | 1D10 | 15 m | 2 | 6 | 8 | 99 |
| .38 Revólver | Armas Cortas | 1D10 | 15 m | 2 | 6 | 10 | 00 |
| 9 mm Automática | Armas Cortas | 1D10 | 18 m | 3 | 17 | 8 | 98 |
| .44 Revólver | Armas Cortas | 2D6+2 | 28 m | 1 | 6 | 12 | 00 |
| .45 Automática | Armas Cortas | 1D10+2 | 15 m | 1 | 7 | 8 | 00 |
| .45 Revólver | Armas Cortas | 1D10+2 | 15 m | 1 | 6 | 10 | 00 |
| .22 Bolt-action | Armas Largas | 1D6+2 | 28 m | 1 | 6 | 9 | 99 |
| .30-06 Bolt-action | Armas Largas | 2D6+4 | 100 m | 1/2 | 5 | 12 | 00 |
| .30-06 Semiautom. | Armas Largas | 2D6+4 | 115 m | 2 | 5 | 12 | 95 |
| AK-47 | Armas Largas | 2D6+1 | 80 m | 2/auto | 30 | 12 | 97 |
| Cal. 10, 2 cañones | Armas Largas | 4D6+2 / 2D6+1 / 1 | 10/18/45 m | 1 o 2 | 2 | 12 | 00 |
| Cal. 12, 2 cañones | Armas Largas | 4D6 / 2D6 / 1D6 | 10/20/45 m | 1 o 2 | 2 | 12 | 00 |
| Cal. 12 semiautom. | Armas Largas | 4D6 / 2D6 / 1D6 | 10/20/45 m | 2 | 5 | 10 | 00 |
| Uzi 9 mm | AA. Automáticas | 1D10 | 35 m | 2/auto | 32 | 8 | 98 |
| Skorpion .32 | AA. Automáticas | 1D8 | 18 m | 3 o auto | 20 | 6 | 96 |
| Thompson .45 | AA. Automáticas | 1D10+2 | 18 m | 1/auto | 30 | 8 | 96 |
| M249 | A. de Fuego (arm. pesada) | 2D8 | 100 m | auto | 100 | 11 | 96 |
| Bren Mark 1 | A. de Fuego (arm. pesada) | 2D6+4 | 100 m | auto | 30 | 11 | 00 |
| Explosivos plásticos | Demoliciones | 6D6 / 6 m | — | n/a | n/a | 15 | 99 |
| Granada de mano | Lanzar | 4D6 / 4 m | Lanzar | 1 o 2 | n/a | 8 | 99 |
| Lanzallamas | Lanzallamas | 2D6 + Fuego | 10 m | 1 | 10 | 6 | 93 |

Las escopetas tienen tres valores de daño/alcance según la distancia (corta/media/larga).

---

## Pendiente de extraer

- Cap. 9 — Criaturas de los Mitos (pp. 38–43): formato de perfil y estadísticas.
- Cap. 10 — Tomos arcanos (pp. 44–45): mecánica de hojear y estudiar libros.
