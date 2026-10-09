# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `K`       | Cambiar skin |

## Skins

Cuatro apariencias cosméticas para la nave (no afectan al gameplay). Pulsa `K` para ciclar entre ellas en cualquier momento: el HUD muestra el nombre de la skin elegida durante 2 s. La selección se guarda en `localStorage` y se recuerda al recargar la página.

| Skin        | Color        | Detalle                       |
| ----------- | ------------ | ----------------------------- |
| CLÁSICA     | Blanco       | Silueta clásica, llama naranja |
| INTERCEPTOR | Magenta      | Casco afilado con doble llama  |
| GALERA      | Dorado       | Cabina rellenada               |
| COMETA      | Verde        | Panel interior en el casco     |

Con el power-up ⚡ Velocidad la llama se vuelve cian en todas las skins.

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 300 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- **Power-up ⚡ Velocidad**: ~15% de probabilidad de soltarlo al destruir un asteroide. Al recogerlo la nave acelera al doble (520 px/s²) durante 5 segundos; la llama se vuelve cian y el HUD muestra el tiempo restante. Dura 8 s en el campo si no se recoge.
- **Power-up Escudo**: ~10% de probabilidad de soltarlo al destruir un asteroide (anillo violeta con icono de escudo). Al recogerlo la nave queda protegida durante **5 segundos** y el escudo **absorbe hasta 3 impactos** con asteroides o estrellas fugaces. Cada impacto consume un golpe, destella el anillo y da invencibilidad breve (parpadeo) para no perder los golpes de una sola vez. Se apaga al agotarse los golpes o el tiempo (parpadea al estar por expirar), se pierde al morir o al avanzar de nivel, y el HUD muestra los golpes y segundos restantes. Dura 8 s en el campo si no se recoge.
- **Estrella fugaz** (asteroide especial): aparece cada 6–12 s desde un borde del campo, cruzándolo a 260–340 px/s (varias veces la velocidad de un asteroide pequeño). Es una estrella de 5 puntas amarilla con estela que **desaparece a los 5 s** si no la destruyen (parpadea y se desvanece al estar por expirar). Da **300 puntos**, no se fragmenta al ser destruida, no suelta power-ups y mata al chocar con la nave (el Escudo activo absorbe ese impacto). Su presencia no bloquea el avance de nivel.
- **Skins de nave**: 4 apariencias cosméticas (silueta, color y detalle) seleccionables con `K` en caliente; la elegida se persiste en `localStorage`. Los iconos de vidas del HUD reflejan la skin activa.
