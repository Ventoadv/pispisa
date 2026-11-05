# Pispisa L'Ottico · Home page: mappatura HTML → Elementor

Prototipo: `index.html` + `assets/css/style.css` + `assets/js/main.js`.
Ogni `<section class="el-section">` diventa un **Container** di primo livello. Le classi `pp-*` vanno nel campo *Avanzate > Classi CSS* del container/widget, così lo stile e le animazioni GSAP si agganciano senza modifiche.

## Impostazioni globali (Kit)
| Token CSS | Elementor | Valore |
|---|---|---|
| `--pp-red` | Colore primario | #E30613 |
| `--pp-logo-red` | Rosso pieno del logo | #E30613 |
| `--pp-black` | Colore secondario (nero) | #111111 |
| `--pp-ink` | Titoli | #111111 |
| `--pp-text` | Testo | #4D4D4D |
| `--pp-light` / `--pp-soft` | Sfondi sezioni (grigio chiarissimo) | #F6F6F6 / #F4F4F4 |
| `--pp-font-head` | Font primario (titoli) | Poppins 600–800 |
| `--pp-font-body` | Font testo | Montserrat 400–600 |
| `--pp-font-display` | Font H1 (simile al logo) | Montserrat 600, corsivo 600 |

Breakpoint: tablet 1024, mobile 767 (uguali ai default Elementor).

## Logo e maschere
- `assets/img/logo-pispisa.svg` (rosso, due righe) e `logo-pispisa-white.svg` (bianco, per sfondi scuri): logo ufficiale, da usare in Site Logo. Convertiti dagli EPS forniti dal cliente, con il rosso portato a #E30613.
- `assets/img/logo-icon.svg` (rosso) e `logo-icon-white.svg`: icona ufficiale "l'O" vettoriale, da usare come Icona SVG personalizzata.
- `assets/img/logo-mask.svg`: sagoma ricavata dall'icona ufficiale (apostrofo + O piena, senza la "l"). In Elementor: widget **Immagine > Stile > Maschera > Forma: Personalizzata** → caricare `logo-mask.svg`, Dimensione: Adatta, Posizione: Centro. Stesso effetto della classe `.pp-mask`.

## Sezioni
| # | Sezione (classe) | Struttura Elementor | Widget nativi |
|---|---|---|---|
| H | Header `pp-header` | Theme Builder > Header, Container 3 colonne a pillola con effetto liquid glass (CSS personalizzato: `.pp-header__inner`). *Effetti di movimento > Sticky: In alto*, senza nascondere l'header allo scroll | Off-Canvas (trigger hamburger), Site Logo, Pulsante, Icon Box (telefono) |
| M | Menu `pp-menu` | Widget **Off-Canvas** (Elementor 3.2x) a tutto schermo, oppure Popup full-screen | Nav Menu verticale, Icon List (negozi), Pulsante |
| 1 | Hero `pp-hero` | Container 2 colonne | Heading H1 (`pp-hero__title pp-split`), Heading H2, 2 Pulsanti, 3 Counter, Immagine con maschera (`pp-hero__img`), Icon Box (badge 1966) |
| – | Nastro `pp-marquee` | Container full width rosso | Widget HTML o Testo (animazione CSS inclusa) |
| 2 | Servizi `pp-services` | Container con classe `pp-services`; dentro `pp-services__viewport` > `pp-services__track` > card `pp-card` | **Loop Carousel** / Carousel per le card (su mobile swipe). Lo scroll orizzontale "pinnato" su desktop è gestito da `main.js` (ScrollTrigger) |
| B1–B3 | Interruzioni `pp-break` | Container full width, altezza min 78vh, *Sfondo: immagine*, *Overlay sfondo: colore/gradiente + opacità*, *Effetti di movimento > Scorrimento verticale* (parallax nativo) | Heading display |
| 3 | Chi siamo `pp-about` | Container 2 colonne | Immagine con maschera, Text Path o SVG (timbro rotante), Heading, Text Editor, 4 container timeline (o Icon List), Pulsante |
| 4 | Punti vendita `pp-stores` | Container griglia 3 colonne (tablet 2, mobile 1) | per card: Immagine con maschera, Heading, Price List o Icon List (orari), Pulsante tel., link Maps |
| 5 | FAQ `pp-faq` | Container 2 colonne, colonna sinistra *Sticky* | **Accordion** nativo (attivare *FAQ Schema*) |
| 6 | Contatti `pp-contact` | Container box rosso arrotondato | Heading, Testo, Form (Elementor Pro) o Fluent Forms già in uso |
| F | Footer `pp-footer` | Theme Builder > Footer | Site Logo, 4× Nav Menu / Icon List, Social Icons, Nav Menu orizzontale legale (Privacy, Cookie, Preferenze cookie collegato a CookieYes, Note legali, Accessibilità) |

## Animazioni (main.js)
Caricare in *Elementor > Codice personalizzato* (fine `<body>`): GSAP 3.12, ScrollTrigger, Lenis (CDN cdnjs/jsdelivr) e poi `main.js`.
- Smooth scroll Lenis sincronizzato con ScrollTrigger.
- Header: sfondo sfocato dopo 40px, nascosto scorrendo in giù e riproposto scorrendo in su.
- Menu: apertura a cerchio (clip-path) con link in stagger. Esc chiude.
- Hero: titolo diviso in parole con reveal, immagine con maschera che si apre con scala e rotazione, contatori, parallax in uscita.
- Servizi: pin e scroll orizzontale su desktop con mouse, barra di avanzamento; su touch/tablet carosello swipe con scroll-snap.
- Interruzioni: parallax dello sfondo e reveal del testo.
- Chi siamo: linea della timeline disegnata allo scroll, timbro circolare rotante.
- FAQ: apertura animata, una risposta alla volta.
- `prefers-reduced-motion` disattiva le animazioni.

## Icone
File SVG in `assets/icons/`. In Elementor usare il widget Icona o Icon Box con "Carica SVG", colore = Primario globale.

## Da fornire / verificare
- Foto reali (le immagini in `assets/img/*.jpg` sono segnaposto con l'etichetta del soggetto previsto).
- P.IVA, link Instagram/YouTube/LinkedIn, testi FAQ definitivi.
