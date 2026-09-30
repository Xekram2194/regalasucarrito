const DEFAULTS = {
  titulo: "Este Detalle es Para Tí MANUEL",
  mensaje: "Hoy es el Día de Hot Wheels y no podía dejarlo pasar sin ti. 🚗❤️\n\nEres lo más especial que tengo. Verte feliz me hace la persona más dichosa. Te regalo este detalle porque mereces todo lo bueno, y más.\n\nTú eres mi favorito, mi todo. Te quiero con todo mi corazón.\n\nFeliz día, mi vida. ❤️",
  frases: [
    "🏍️ Contigo la carretera es mejor",
    "🏎️ Acelerando hacia lo que viene",
    "🏍️ Gracias por ser tú",
    "🏎️ Eres mi persona favorita",
    "🏍️ Contigo hasta lo simple brilla",
    "🏎️ Feliz día para ti",
    "🏍️ Contigo siempre a mil por hora",
    "🏎️ Eres único",
    "🏍️ Me alegra conocerte",
    "🏎️ Contigo el día pesa menos",
    "🏍️ Un gracias que no necesita fecha",
    "🏎️ Tu risa le hace bien a mis días",
    "🏍️ Hoy celebro tenerte cerca",
    "🏎️ Apareces cuando más hace falta",
    "🏍️ Solo para ti, sin freno",
    "🏎️ Feliz día, pienso en ti con cariño",
    "🏍️ Contigo todo lugar es bonito",
    "🏎️ Gracias por estar ahí",
    "🏍️ Que este día te alcance hoy",
    "🏎️ Contigo las tardes se hacen cortas",
    "🏍️ No necesito un motivo para quererte",
    "🏎️ Quiero que sepas cuánto importas",
    "🏍️ Gracias por sumar luz a mis días",
    "🏎️ Aquí siempre tienes un lugar",
    "🏍️ Contigo todo es mejor",
    "🏎️ A toda velocidad",
    "🏍️ Eres pura energía",
    "🏎️ Siempre brillas",
    "🏍️ Un detalle azul para ti",
    "🏎️ Eres mi persona favorita"
  ],
  fotos: [
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img1.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img2.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img3.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img4.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img5.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img6.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img7.png",
    "https://raw.githubusercontent.com/Rafael-codex/Imagnes-de-hot-wells/main/img8.png",
    "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.min.js"
  ],
  musica: "https://raw.githubusercontent.com/Rafael-codex/musicas/main/_teamo%20%20_amor%20_reflexion%20_el%20_ella(MP3).mp3"
};

const CONFIG = (window.DEDICA && window.DEDICA.merge)
  ? window.DEDICA.merge(DEFAULTS, window.DEDICA.config)
  : DEFAULTS;
