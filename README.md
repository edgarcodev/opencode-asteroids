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
- **Estrella fugaz** (asteroide especial): aparece cada 6–12 s desde un borde del campo, cruzándolo a 260–340 px/s (varias veces la velocidad de un asteroide pequeño). Es una estrella de 5 puntas amarilla con estela que **desaparece a los 5 s** si no la destruyen (parpadea y se desvanece al estar por expirar). Da **300 puntos**, no se fragmenta al ser destruida, no suelta power-ups y mata al chocar con la nave. Su presencia no bloquea el avance de nivel.
