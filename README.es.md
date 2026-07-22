# Cthulhu d100 para Foundry VTT

Una implementación independiente, no oficial y de código abierto del reglamento **Cthulhu d100** (Three Fourteen Games, 2011) para [Foundry Virtual Tabletop](https://foundryvtt.com).

*Leer en otros idiomas: [Español](README.es.md) | [English](README.md).*

---

## 📌 Descripción general

**Cthulhu d100** es un reglamento español de rol de horror lovecraftiano basado en GORE/OGL (Three Fourteen Games, 2011). Este sistema para Foundry VTT implementa sus mecánicas principales, compendios, tablas de combate y sistemas de cordura.

### Matriz de compatibilidad
| Versión del Sistema | Versión de Foundry VTT | Estado |
|---|---|---|
| 0.1.0+ | **v14** (v14.364+) | Verificado / Objetivo principal |
| 0.1.0+ | **v13** | Soportado |
| 0.1.0+ | **v12** | Versión mínima soportada |

---

## 📦 Instalación

Para instalar en Foundry VTT:
1. Abre la pestaña **Sistemas de juego** en el menú de configuración de Foundry VTT.
2. Haz clic en **Instalar sistema**.
3. Pega la siguiente URL del manifiesto en el campo **URL del manifiesto** en la parte inferior:
   ```text
   https://github.com/EduardoJGilA/cthulhud100-foundryvtt/releases/latest/download/system.json
   ```
4. Haz clic en **Instalar**.

---

## ✨ Funcionalidades

- **Atributos y Derivados:** Características en escala 3–18 (`FUE`, `CON`, `DES`, `TAM`, `INT`, `POD`, `CAR`, `EST`). Cálculo automático de PV `ceil((TAM+CON)/2)`, PM (`POD`), Suerte (`POD×5`), Idea (`INT×5`) y Cultura General (`EST×5`).
- **Modificador al Daño (MD):** Tabla de 20 tramos según `FUE+TAM` que abarca desde `-1D8` hasta `+5D10`.
- **Niveles de Éxito y Motor de Dados:** Resolución d100 estándar con Crítico (`5% superior` / `redondear(habilidad/20)`), Especial (`20% superior` / `redondear(habilidad/5)`), Éxito Normal (`≤ habilidad`), Fallo (`> habilidad`) y Pifia (`96–00`).
- **Doble Sistema de Cordura:** Soporte tanto para Cordura Clásica (`POD×5`) como para el sistema alternativo de Estabilidad Mental con 3 barras interactivas (`ceil/floor/ceil`, total `POD×1.5`), modificadores de estado y seguimiento de locura subyacente.
- **Resolución de Combate:** Tablas cruzadas 5×5 de Esquiva y Bloqueo (§7), iniciativa basada en DES (3–18), mecánicas de alcance, empalamientos, heridas graves y reglas de localización de impactos.
- **Compendios Localizados:** Compendios completos en español para Habilidades (33 ítems en 5 categorías con fórmulas base dinámicas), Armas (41 ítems), Profesiones (10 ocupaciones), Heridas Graves, Pérdidas de Estabilidad Mental, Tomos Arcanos (10 ítems) y Criaturas de los Mitos (12 perfiles).

Para ver la especificación técnica completa, consulta [`dev-docs/reglas-cthulhu-d100.md`](dev-docs/reglas-cthulhu-d100.md).

---

## ⚖️ Aviso Legal / Legal Disclaimer

- **Independiente y No Oficial:** Este proyecto es un sistema de código abierto independiente creado por la comunidad. **No** está afiliado, patrocinado, respaldado ni aprobado por Chaosium Inc., Edge Studio, Shadowlands ni ninguna editorial oficial de La Llamada de Cthulhu.
- **Marcas Registradas:** "Call of Cthulhu" y "La Llamada de Cthulhu" son marcas registradas de Chaosium Inc. Este proyecto no contiene texto de ambientación, arte ni módulos protegidos por derechos de autor de La Llamada de Cthulhu 7ª Edición o publicaciones de Chaosium.
- **Origen del Reglamento y Atribución:** Este sistema implementa las mecánicas del reglamento **Cthulhu d100** publicado por Three Fourteen Games (2011). Se distribuye sin ánimo de lucro al amparo de la autorización expresa del propio manual (*"Puede crearse material adicional utilizando el reglamento aquí presentado siempre que se haga referencia a la fuente original y que no se realice con afán de lucro"*).
- **Licencia de Software:** Todo el código de este repositorio se distribuye bajo la licencia **GNU General Public License v3.0 (GPL-3.0)**, al ser un trabajo derivado de Cd100-FoundryVTT © Miskatonic Investigative Society. Consulta [`LICENSE`](LICENSE) y [`NOTICE.md`](NOTICE.md).

---

## 📄 Licencia y Créditos

- **Código de Software:** GPL-3.0 (ver [`LICENSE`](LICENSE)).
- **Atribuciones Legales y OGL:** Ver [`NOTICE.md`](NOTICE.md).
