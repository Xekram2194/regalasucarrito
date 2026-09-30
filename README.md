# 🏍️ Mi Biker — Moto & Carro Hot Wheels 🚗

Página web de dedicatoria animada en 3D. Muestra una galaxia azul donde una
moto hecha de partículas se transforma en un carro y vuelve a ser moto, rodeada
de frases, fotos que orbitan y música de fondo. Está pensada como un detalle
para alguien especial.

## Resumen de la página

- **Pantalla de inicio:** un mensaje "Toca Aquí - Mi Biker" con una imagen que
  late. Al tocarla empieza la música y se muestra la escena. El toque hace
  falta porque los navegadores no dejan reproducir audio sin interacción.
- **Escena 3D (Three.js):**
  - Una figura de partículas que alterna entre **moto** y **carro**: se queda
    6 s en cada forma y tarda 2.4 s en transformarse.
  - Una galaxia en espiral de 4 brazos, anillos brillantes, un halo de luz y un
    fondo de estrellas.
  - **Frases** y **fotos** que orbitan alrededor del centro.
- **Título** fijo arriba con efecto de brillo.
- **Botón 📩** (abajo a la derecha): abre una carta con un mensaje. Se cierra
  con la ✕, tocando fuera de la carta o con `Esc`.
- **Controles:** arrastra para girar la cámara; usa la rueda del ratón o
  pellizca en el móvil para acercar o alejar.
- **Adaptada a móvil:** en teléfonos usa menos partículas y menos resolución
  para que vaya fluida.

## Estructura del proyecto

```
hotweels/
├── index.html        # Estructura de la página (HTML)
├── css/
│   └── styles.css    # Estilos: pantalla de inicio, título, botón y carta
├── js/
│   ├── config.js     # Contenido editable: título, mensaje, frases, fotos y música
│   └── main.js       # Lógica: escena 3D, animaciones, controles y audio
└── README.md
```

## Cómo personalizarla

Todo el contenido está en [`js/config.js`](js/config.js), dentro del objeto
`DEFAULTS`:

| Campo     | Qué es                                                    |
|-----------|-----------------------------------------------------------|
| `titulo`  | Texto que aparece arriba de la pantalla                   |
| `mensaje` | Texto de la carta; separa los párrafos con una línea vacía |
| `frases`  | Lista de frases que flotan en la galaxia                  |
| `fotos`   | URLs de las imágenes que orbitan                          |
| `musica`  | URL del archivo MP3 de fondo                              |

Las imágenes y la música tienen que estar en URLs públicas que permitan CORS
(por ejemplo, `raw.githubusercontent.com`).

## Cómo abrirla

Abre `index.html` en el navegador. Hace falta conexión a internet, porque
Three.js, la fuente *Indie Flower*, las fotos y la música se cargan desde
internet.

Para publicarla, sube la carpeta completa a un hosting estático, como GitHub
Pages, Netlify o Vercel.

## Tecnologías

- HTML5, CSS3 y JavaScript sin frameworks
- [Three.js r148](https://threejs.org/) para el render 3D con WebGL
- Google Fonts: *Indie Flower*
