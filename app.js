/* ========================================================================
   SAN VALENTÍN NEWS — Lógica Principal
   Desarrollado por: Zero
   Versión: 1.0.0

   ESTRUCTURA DEL ARCHIVO:
   1. Datos de la aplicación (textos, imágenes, cupones, música)
   2. Estado de la aplicación
   3. Inicialización (DOMContentLoaded)
   4. Corazones flotantes
   5. Navegación entre secciones
   6. Carrusel de imágenes
   7. IntersectionObservers (disparadores de animación)
   8. Efecto de escritura (typing)
   9. Misión y confetti
   10. Cupones canjeables
   11. Reproductor de música (vinilo)
   12. Descarga de cupones como PNG
   ======================================================================== */


/* ========================================================================
   1. DATOS DE LA APLICACIÓN
   EDITAR: Aquí puedes personalizar TODO el contenido del periódico
   ======================================================================== */
// ===== DATA =====
// Los datos ahora vienen de config.js (window.appData)
if (!window.appData) {
  console.error('No se encontró config.js. Asegúrate de cargarlo antes de app.js');
}
// ===== CONFIGURACIÓN SUPABASE (Read Only) =====
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-PUBLIC-ANON-KEY';
// Nota: Es seguro exponer la Anon Key en el cliente si tienes RLS configurado o si solo es lectura pública.

// Inicializamos appData con el por defecto (config.js)
let appData = window.appData;

// Función para cargar datos de Supabase si hay ?id=...
async function loadDynamicData() {
  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get('id');

  if (cardId) {
    console.log('Cargando carta personalizada:', cardId);
    try {
      const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from('valentines_cards')
        .select('data')
        .eq('id', cardId)
        .single();

      if (error) throw error;
      if (data && data.data) {
        // Sobrescribimos appData con los datos de Supabase
        appData = { ...appData, ...data.data };
        window.appData = appData; // Actualizamos global también
        console.log('Carta cargada con éxito');
      }
    } catch (err) {
      console.error('Error cargando carta personalizada:', err);
      alert('No se pudo cargar la carta personalizada. Se mostrará la versión por defecto.');
    }
  }
}


// Estado interno — no editar
appData.missionAccepted = null;


/* ========================================================================
   2. ESTADO DE LA APLICACIÓN
   Estas variables controlan el comportamiento dinámico — no necesitas editarlas
   ======================================================================== */
let isPlaying = false;          // ¿El disco de vinilo está girando?
let currentImgIndex = 0;        // Índice actual de la imagen del carrusel
let storyFinished = false;      // ¿Terminó de escribirse la historia?
let activeReasonIndex = 0;      // Índice de la razón que se está escribiendo
let section2Triggered = false;  // ¿Ya se activó el efecto de escritura de la historia?
let section6Triggered = false;  // ¿Ya se activó el efecto de escritura de las razones?


/* ========================================================================
   3. INICIALIZACIÓN — Se ejecuta al cargar la página
   ======================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Primero intentamos cargar datos dinámicos
  if (typeof window.supabase !== 'undefined') {
    await loadDynamicData();
  }

  // Luego configuramos el contenido visual
  setupContent(); // Inyecta los textos y fotos de config.js
  createFloatingHearts();          // Crea los corazones flotantes
  setupCarousel();                  // Configura la rotación automática del carrusel
  setupIntersectionObservers();     // Configura los disparadores de animación por scroll
  populatePrintableCoupons();       // Llena los cupones en la versión para descargar
});

// ===== SETUP CONTENT =====
function setupContent() {
  // 1. Textos Generales
  document.querySelector('.top-nav-name').textContent = appData.partnerName;
  document.querySelector('.cover-title').innerHTML = appData.heroTitle.replace(/\n/g, '<br/>');
  document.querySelector('.story-headline').textContent = appData.articleHeadline;

  // 2. Música
  document.querySelector('.vinyl-cover-img').src = appData.music.coverImage;
  document.querySelector('.player-song').textContent = appData.music.songTitle;
  document.querySelector('.player-artist').textContent = appData.music.artist;

  if (appData.music.audioUrl) {
    const audio = document.getElementById('audio-player');
    audio.src = appData.music.audioUrl;
  }

  // 3. Galería de Imágenes
  const carouselContainer = document.getElementById('carousel-container');
  if (carouselContainer && appData.galleryImages && appData.galleryImages.length > 0) {
    carouselContainer.innerHTML = ''; // Limpiar imágenes hardcoded
    appData.galleryImages.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Recuerdo ${index}`;
      img.className = 'carousel-img';
      if (index === 0) img.classList.add('active');
      carouselContainer.appendChild(img);
    });
  }
}


/* ========================================================================
   4. CORAZONES FLOTANTES
   EDITAR: Cambia la cantidad (12), el símbolo ('♥'), y el rango de tamaño
   ======================================================================== */
function createFloatingHearts() {
  const container = document.getElementById('floating-hearts');

  // EDITAR: Cambia 12 por la cantidad de corazones que quieras
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '♥';     // EDITAR: Cambia el símbolo del corazón
    heart.style.left = (Math.random() * 100) + '%';          // Posición horizontal aleatoria
    heart.style.animationDelay = (Math.random() * 15) + 's'; // Retardo aleatorio
    heart.style.fontSize = (Math.random() * 15 + 10) + 'px'; // EDITAR: Tamaño entre 10px y 25px
    container.appendChild(heart);
  }
}


/* ========================================================================
   5. NAVEGACIÓN ENTRE SECCIONES
   Controla el scroll horizontal suave entre las 7 secciones
   ======================================================================== */
function scrollToSection(index) {
  const container = document.getElementById('scroll-container');
  const width = window.innerWidth;
  container.scrollTo({ left: width * index, behavior: 'smooth' });
}


/* ========================================================================
   6. CARRUSEL DE IMÁGENES (Sección 2)
   EDITAR: Cambia el intervalo de rotación (4000ms = 4 segundos)
   ======================================================================== */
function setupCarousel() {
  if (appData.galleryImages.length <= 1) return;  // No rotar si solo hay una imagen

  // EDITAR: Cambia 4000 por el intervalo deseado en milisegundos
  setInterval(() => {
    const imgs = document.querySelectorAll('.carousel-img');
    imgs[currentImgIndex].classList.remove('active');
    currentImgIndex = (currentImgIndex + 1) % appData.galleryImages.length;
    imgs[currentImgIndex].classList.add('active');

    // Actualiza el texto del pie de foto
    document.getElementById('carousel-caption').textContent =
      `Fig 1.${currentImgIndex + 1}: Momentos Inolvidables`;
  }, 4000);
}


/* ========================================================================
   7. INTERSECTION OBSERVERS — Disparadores de animación
   Detectan cuándo una sección entra en la pantalla para activar efectos
   ======================================================================== */
function setupIntersectionObservers() {

  // EDITAR: threshold: 0.15 = el efecto se activa cuando el 15% de la sección es visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Sección 2 (Historia) — activa el efecto de escritura del artículo
      if (entry.target.id === 'section-1' && !section2Triggered) {
        section2Triggered = true;
        typeText('story-typed-text', 'story-cursor', appData.articleBody, () => {
          storyFinished = true;
          const wrapper = document.getElementById('story-next-wrapper');
          wrapper.classList.remove('hidden');
          wrapper.classList.add('visible');
        });
      }

      // Sección 6 (Razones) — activa el efecto de escritura secuencial
      if (entry.target.id === 'section-5' && !section6Triggered) {
        section6Triggered = true;
        typeReasons();
      }
    });
  }, { threshold: 0.15 });

  // Observar las secciones que tienen efecto de escritura
  const s1 = document.getElementById('section-1');
  const s5 = document.getElementById('section-5');
  if (s1) observer.observe(s1);
  if (s5) observer.observe(s5);
}


/* ========================================================================
   8. EFECTO DE ESCRITURA (TYPING)
   Escribe texto carácter por carácter, simulando una máquina de escribir
   EDITAR: Cambia la velocidad de escritura (30ms por carácter)
   ======================================================================== */
function typeText(targetId, cursorId, text, onComplete) {
  const target = document.getElementById(targetId);
  const cursor = document.getElementById(cursorId);
  let index = 0;

  // EDITAR: Cambia 30 por la velocidad deseada en milisegundos (menor = más rápido)
  const intervalId = setInterval(() => {
    if (index > text.length) {
      clearInterval(intervalId);
      if (cursor) cursor.classList.add('done');  // Oculta el cursor al terminar
      if (onComplete) onComplete();              // Ejecuta la función callback
      return;
    }
    target.textContent = text.slice(0, index);
    index++;
  }, 30);
}

// Escribe todas las razones una por una de forma secuencial
function typeReasons() {
  typeNextReason(0);
}

function typeNextReason(index) {
  if (index >= appData.reasons.length) {
    // Todas las razones se escribieron — muestra el botón "Dedicatoria"
    const wrapper = document.getElementById('reasons-next-wrapper');
    wrapper.classList.remove('hidden');
    return;
  }

  activeReasonIndex = index;
  const targetId = 'reason-' + index;
  const cursorId = 'reason-cursor-' + index;

  // Escribe la razón actual y cuando termina, pasa a la siguiente
  typeText(targetId, cursorId, appData.reasons[index], () => {
    typeNextReason(index + 1);
  });
}


/* ========================================================================
   9. MISIÓN Y CONFETTI (Sección 3)
   EDITAR: Cambia los colores del confetti y el tiempo de auto-navegación
   ======================================================================== */
function toggleMission(selection) {
  appData.missionAccepted = selection;

  // Actualiza la apariencia de los botones
  const btnYes = document.getElementById('btn-yes');
  const btnYesCourse = document.getElementById('btn-yes-course');
  btnYes.classList.remove('selected');
  btnYesCourse.classList.remove('selected');

  if (selection === 'yes') {
    btnYes.classList.add('selected');
  } else {
    btnYesCourse.classList.add('selected');
  }

  // Muestra el mensaje de respuesta con animación
  const response = document.getElementById('mission-response');
  response.classList.remove('hidden');
  response.classList.add('visible');

  // Muestra el botón de "Ver Regalos"
  const nextWrapper = document.getElementById('mission-next-wrapper');
  nextWrapper.classList.remove('hidden');

  // Lanza el confetti 🎉
  fireConfetti();

  // EDITAR: Cambia 1500 por el tiempo de espera antes de ir a la siguiente sección (en ms)
  setTimeout(() => scrollToSection(3), 1500);
}

// Animación de confetti con partículas desde ambos lados de la pantalla
function fireConfetti() {
  if (typeof confetti === 'undefined') return;

  // EDITAR: Ajusta la duración del confetti (3000ms = 3 segundos)
  const duration = 3000;
  const end = Date.now() + duration;

  function frame() {
    // Confetti desde la izquierda
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ef4444', '#f87171', '#fecaca']   // EDITAR: Colores del confetti
    });
    // Confetti desde la derecha
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ef4444', '#f87171', '#fecaca']   // EDITAR: Colores del confetti
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }
  frame();
}


/* ========================================================================
   10. CUPONES CANJEABLES (Sección 4)
   Al hacer click en un cupón, se marca como "CANJEADO" con sello y fecha
   ======================================================================== */
function redeemTicket(id) {
  const ticket = appData.tickets.find(t => t.id === id);
  if (!ticket || ticket.redeemed) return;  // Si ya fue canjeado, no hacer nada

  // Marcar como canjeado con la fecha actual
  ticket.redeemed = true;
  ticket.redeemedDate = new Date().toLocaleDateString('es-ES');

  // Agregar estilo visual de "canjeado" al elemento HTML
  const ticketEl = document.getElementById('ticket-' + id);
  ticketEl.classList.add('redeemed');

  // Mostrar el sello con animación
  const stamp = document.getElementById('stamp-' + id);
  stamp.classList.remove('hidden');
  stamp.classList.add('visible');

  // Mostrar la fecha en el sello
  const stampDate = document.getElementById('stamp-date-' + id);
  stampDate.textContent = ticket.redeemedDate;
}


/* ========================================================================
   11. REPRODUCTOR DE MÚSICA — Vinilo (Sección 5)
   EDITAR: Este reproduce solo visualmente — no reproduce audio real
   Si quieres agregar audio real, agrega un elemento <audio> en index.html
   y llama a audioElement.play() / audioElement.pause() desde aquí
   ======================================================================== */
// ===== MUSIC PLAYER =====
function togglePlay() {
  isPlaying = !isPlaying;

  const vinyl = document.getElementById('vinyl-record');
  const tonearm = document.getElementById('tonearm');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const progressFill = document.getElementById('progress-fill');
  const audio = document.getElementById('audio-player');

  if (isPlaying) {
    // Estado: Reproduciendo
    vinyl.classList.add('spinning');       // El disco gira
    tonearm.classList.add('playing');      // El brazo se mueve al disco
    playIcon.classList.add('hidden');      // Oculta ícono de play
    pauseIcon.classList.remove('hidden');  // Muestra ícono de pausa
    progressFill.classList.add('playing'); // La barra de progreso avanza

    // Reproducir audio real si existe
    if (audio.src) {
      audio.play().catch(e => console.log('Audio autoplay prevented:', e));
    }
  } else {
    // Estado: Pausado — congela la rotación actual del disco
    const computedStyle = window.getComputedStyle(vinyl);
    const transform = computedStyle.getPropertyValue('transform');
    vinyl.classList.remove('spinning');
    vinyl.style.transform = transform;
    void vinyl.offsetHeight;  // Forzar repintado del navegador
    vinyl.style.transform = '';

    tonearm.classList.remove('playing');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    progressFill.classList.remove('playing');

    // Pausar audio real
    if (audio.src) {
      audio.pause();
    }
  }
}


/* ========================================================================
   12. DESCARGA DE CUPONES COMO IMAGEN PNG (Sección 7)
   Usa html2canvas para generar una imagen de los cupones y descargarla
   ======================================================================== */
function handleDownloadCoupons() {
  const element = document.getElementById('printable-coupons');
  if (!element) {
    console.error('No se encontró el elemento de cupones');
    return;
  }

  // Verificar que html2canvas esté disponible
  if (typeof html2canvas === 'undefined') {
    alert('html2canvas no está disponible. Verifica la conexión a internet.');
    return;
  }

  console.log('Generando imagen de cupones...');
  html2canvas(element, {
    scale: 2,                    // EDITAR: Resolución de la imagen (2 = alta calidad)
    backgroundColor: '#ffffff',
    useCORS: true,               // Permite cargar imágenes de otros dominios
    logging: false,
  }).then(canvas => {
    // Crear un enlace de descarga temporal
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    // EDITAR: El nombre del archivo descargado
    link.download = `Cupones_Para_${appData.partnerName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Descarga completada');
  }).catch(err => {
    console.error('Error al generar la imagen:', err);
    alert('Hubo un error al generar la imagen. Inténtalo de nuevo.');
  });
}


/* ========================================================================
   CUPONES IMPRIMIBLES — Genera el contenido del bloque oculto
   Este bloque se usa solo para generar la imagen PNG de descarga
   ======================================================================== */
function populatePrintableCoupons() {
  const container = document.getElementById('printable-tickets-list');
  const nameEl = document.getElementById('coupon-partner-name');
  nameEl.textContent = appData.partnerName;

  // Crear un ticket imprimible por cada cupón definido en appData.tickets
  appData.tickets.forEach(ticket => {
    const div = document.createElement('div');
    div.className = 'printable-ticket';
    div.innerHTML = `
      <span class="printable-ticket-text">${ticket.text}</span>
      <span class="printable-ticket-valid">Válido para siempre</span>
    `;
    container.appendChild(div);
  });
}

// Función para iniciar la música automáticamente al comenzar
function startMusicJourney() {
  if (!isPlaying) {
    togglePlay();
  }
}
