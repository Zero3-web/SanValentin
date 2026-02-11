/* ========================================================================
   ARCHIVO DE CONFIGURACIÓN — SAN VALENTÍN NEWS
   ========================================================================
   Aquí es donde puedes personalizar todo el contenido de tu página.
   Cambia los textos, enlaces de imágenes y opciones de música.
*/

window.appData = {
    // 1. NOMBRE DE TU PAREJA
    partnerName: "Mi Amor",

    // 2. TEXTO DE LA PORTADA
    // Usa \n para saltos de línea
    heroTitle: "Edición \n Amor.",

    // 3. GALERÍA DE FOTOS (Historia)
    // Sube tus fotos a la carpeta 'assets/images/' y pon sus nombres aquí.
    // Ejemplo: "assets/images/foto1.jpg"
    galleryImages: [
        "imagenes/imagen1.png",
        "imagenes/imagen2.png"
    ],

    // 4. HISTORIA PRINCIPAL
    articleHeadline: "La Pareja Perfecta",
    articleBody: "Dicen que las mejores historias de amor no tienen final, pero la nuestra es mi favorita porque tiene el mejor comienzo. Cada día contigo es una nueva página llena de risas, aventuras y mucho cariño. Eres mi persona favorita en el mundo.",

    // 5. MÚSICA
    // Sube tu canción a 'assets/music/' y pon el nombre aquí.
    music: {
        songTitle: "Just the Way You Are",
        artist: "Bruno Mars",
        // Ruta de tu archivo de música (ej. 'assets/music/cancion.mp3')
        audioUrl: "musica/musica.mp3",
    },

    // 6. CUPONES
    // Puedes agregar o quitar cupones aquí.
    tickets: [
        { id: 1, text: "Cena Romántica", redeemed: false },
        { id: 2, text: "Noche de Pelis", redeemed: false },
        { id: 3, text: "Abrazos Ilimitados", redeemed: false },
        { id: 4, text: "Masaje de Espalda", redeemed: false } // Ejemplo de nuevo cupón
    ],

    // 7. RAZONES POR LAS QUE TE AMO
    // Estas se escriben automáticamente en la sección final
    reasons: [
        "Por tu forma de hacerme reír.",
        "Por cómo me apoyas en todo.",
        "Por tu sonrisa que ilumina mi día.",
        "Por los pequeños detalles.",
        "Simplemente por ser tú."
    ]
};
