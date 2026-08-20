document.addEventListener('DOMContentLoaded', () => {
  const views = Array.from(document.querySelectorAll('.view'));
  const viewMap = views.reduce((map, el) => {
    if (el.id) map[el.id] = el;
    return map;
  }, {});

  function setActiveView(id) {
    views.forEach((view) => view.classList.toggle('active', view.id === id));
  }

  function navigateTo(id) {
    if (!viewMap[id]) return;
    setActiveView(id);
    history.replaceState(null, '', `#${id}`);
  }

  document.body.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    const targetId = href.replace('#', '');
    if (!targetId) return;
    if (anchor.id === 'btn-contacto' || anchor.dataset.route === 'contacto') return;
    if (viewMap[targetId]) {
      event.preventDefault();
      navigateTo(targetId);
    }
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (viewMap[id]) setActiveView(id);
  });

  const scrollButtons = document.querySelectorAll('.scroll-btn');
  scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const container = document.getElementById(targetId);
      if (!container) return;
      const offset = button.classList.contains('right') ? container.clientWidth * 0.9 : -container.clientWidth * 0.9;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    });
  });

  const initialId = location.hash ? location.hash.replace('#', '') : 'inicio';
  if (viewMap[initialId]) {
    setActiveView(initialId);
  } else {
    setActiveView('inicio');
  }
});

window.addEventListener('DOMContentLoaded', () => {
    
    // 1. REEMPLAZA ESTA URL POR LA DE TU VIDEO DE YOUTUBE:
    const urlDeMiVideo = 'https://youtu.be/umSAA4HgyXw?si=IEMdZVOGzEJ9klYb'; 

    // 2. Espera 10 segundos (10000 milisegundos) antes de mostrar la ventana
    setTimeout(() => {
        
        // Seleccionamos tu contenedor de la línea que me diste
        const contenedor = document.querySelector('.box-vidFloat');
        
        // Esta función extrae automáticamente el ID del video desde cualquier tipo de enlace de YouTube
        const extraerId = (url) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        const videoId = extraerId(urlDeMiVideo);

        if (videoId && contenedor) {
            // Creamos el iframe dinámicamente
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
            iframe.setAttribute('width', '250');
            iframe.setAttribute('height', '150');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');

            contenedor.appendChild(iframe);

            setTimeout(() => {
                iframe.remove(); 
            }, 10000);

        } else {
            console.error("Error: La URL de YouTube no es válida o no se encontró el contenedor '.box-vidFloat'.");
        }

    }, 3000); 
});

async function cargarNoticias() {
    const contenedor = document.getElementById("contenedor-noticias");
    if (!contenedor) {
        console.error("No se encontró el contenedor con ID 'contenedor-noticias'");
        return;
    }
    
    try {
        // Limpiamos el contenedor viejo para empezar la carga limpia
        contenedor.innerHTML = "";
        
        let contador = 1;
        let archivosEncontrados = [];
        let ejecutando = true;

        // 1. Buscamos secuencialmente todos los archivos de texto que existan en la carpeta
        while (ejecutando) {
            const nombreArchivo = contador === 1 ? 'new.txt' : `new${contador}.txt`;
            
            try {
                const respuestaTxt = await fetch(`date/TXT/noticias/${nombreArchivo}?v=${Date.now()}`);
                
                if (respuestaTxt.ok) {
                    const textoCompleto = await respuestaTxt.text();
                    archivosEncontrados.push(textoCompleto);
                    contador++;
                } else {
                    // Si responde 404 u otro error de carga, detenemos el bucle
                    ejecutando = false;
                }
            } catch (e) {
                // Detener en caso de fallo de red
                ejecutando = false;
            }
            
            // Freno de mano de seguridad
            if (contador > 100) break;
        }

        if (archivosEncontrados.length === 0) {
            throw new Error("No se encontró ningún archivo de noticia en la ruta 'date/'.");
        }

        // 2. Volteamos el array para que la noticia más nueva (número más alto) aparezca arriba de todo
        archivosEncontrados.reverse();

        // 3. Procesamos y pintamos cada una de las noticias recuperadas
        archivosEncontrados.forEach(textoCompleto => {
            // Procesador de líneas flexible (Soporta etiquetas con o sin corchetes)
            let noticia = { titulo: "", fecha: "", resumen: "", categoria: "", imagen: "" };
            const lineas = textoCompleto.split('\n').map(l => l.trim());
            let etiquetaActual = "";
            let bloquesContenido = [];

            for (let i = 0; i < lineas.length; i++) {
                const linea = lineas[i];
                const lineaLimpia = linea.replace(/[\[\]]/g, '').toUpperCase();
                
                if (['TITULO', 'FECHA', 'CATEGORIA', 'IMAGEN', 'RESUMEN'].includes(lineaLimpia)) {
                    if (etiquetaActual) {
                        noticia[etiquetaActual] = bloquesContenido.join('\n').trim();
                    }
                    etiquetaActual = lineaLimpia.toLowerCase();
                    bloquesContenido = [];
                } else if (etiquetaActual) {
                    bloquesContenido.push(linea);
                }
            }
            if (etiquetaActual) {
                noticia[etiquetaActual] = bloquesContenido.join('\n').trim();
            }

            // Estructura e inserción en el DOM
            const articuloHTML = document.createElement("article");
            articuloHTML.classList.add("noticia-card");
            articuloHTML.style.marginBottom = "20px"; // Margen inferior para que no se peguen las tarjetas
            
        articuloHTML.innerHTML = `
                ${noticia.imagen ? `<img src="${noticia.imagen}" width="100%" alt="${noticia.titulo || 'Noticia'}" class="noticia-img" onerror="this.style.display='none'">` : ''}
                <div class="noticia-contenido">
                    <span class="noticia-categoria" style="display: inline-block; margin-bottom: 5px;">${noticia.categoria || 'General'}</span>
                    <h2 class="noticia-titulo" style="margin-top: 0;">${noticia.titulo || 'Nueva Noticia'}</h2>
                    <p class="noticia-fecha" style="font-size: 0.9rem; opacity: 0.8;">${noticia.fecha || ''}</p>
                    <p class="noticia-resumen">${(noticia.resumen || '').replace(/\n/g, '<br>')}</p>
                </div>
            `;
            
            contenedor.appendChild(articuloHTML);
        });
        
        // TRUCO DE SEGURIDAD: Nos aseguramos de que el contenedor ignore cualquier ocultamiento por CSS de las vistas
        contenedor.style.display = "block";
        contenedor.style.visibility = "visible";
        
    } catch (error) {
        console.error("Error crítico al renderizar la noticia:", error);
        contenedor.innerHTML = `<p style="text-align: center; color: #f8fafc; padding: 10px;">Error al enlazar datos: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dropdownMenu = document.getElementById('dropdownMenu');

    // 1. Cerrar el menú si el usuario presiona la tecla Escape (Esc)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dropdownMenu.style.display = 'none';
            
            // Restablece el display para que el CSS (:hover) vuelva a funcionar normalmente
            setTimeout(() => {
                dropdownMenu.style.removeProperty('display');
            }, 100);
        }
    });

    // 2. Controlar la experiencia táctil en dispositivos móviles (clics fuera del menú)
    document.addEventListener('click', (event) => {
        const isClickInside = event.target.closest('.dropdown');
        
        if (!isClickInside) {
            dropdownMenu.style.display = 'none';
            setTimeout(() => {
                dropdownMenu.style.removeProperty('display');
            }, 100);
        }
    });
});