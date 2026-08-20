// date/notificaciones.js
(function () {
    // 1. Pedir permisos al cargar la página
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // 2. Función para disparar la notificación nativa del SO / Móvil
    function lanzarNotificacion(titulo, mensaje, icono) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(titulo, {
                body: mensaje,
                icon: icono || '/favicon.ico',
                badge: '/favicon.ico',
                vibrate: [200, 100, 200]
            });
        }
    }

    // 3. Revisar si hay nuevo contenido al cargar la página
    window.addEventListener('load', async () => {
        try {
            const cacheBuster = `?v=${Date.now()}`;
            
            // Consultar las rutas existentes
            const [resNoticia, resRecurso, resProyecto] = await Promise.allSettled([
                fetch(`date/TXT/noticias/new.txt${cacheBuster}`),
                fetch(`date/TXT/recursos/recurso.txt${cacheBuster}`),
                fetch(`date/TXT/proyectos/proyectos.txt${cacheBuster}`)
            ]);

            const txtNoticia = resNoticia.status === 'fulfilled' && resNoticia.value.ok ? await resNoticia.value.text() : null;
            const txtRecurso = resRecurso.status === 'fulfilled' && resRecurso.value.ok ? await resRecurso.value.text() : null;
            const txtProyecto = resProyecto.status === 'fulfilled' && resProyecto.value.ok ? await resProyecto.value.text() : null;

            // Obtener lo guardado previamente en el navegador
            const guardadoNoticia = localStorage.getItem('last_news_content');
            const guardadoRecurso = localStorage.getItem('last_resource_content');
            const guardadoProyecto = localStorage.getItem('last_project_content');

            // Detectar cambios y notificar
            if (txtNoticia && guardadoNoticia && guardadoNoticia !== txtNoticia) {
                lanzarNotificacion("DXon - Nueva Noticia", "Se ha publicado una nueva noticia en la plataforma.");
            } else if (txtRecurso && guardadoRecurso && guardadoRecurso !== txtRecurso) {
                lanzarNotificacion("DXon - Nuevo Recurso/PDF", "Hay un nuevo recurso listo para descargar.");
            } else if (txtProyecto && guardadoProyecto && guardadoProyecto !== txtProyecto) {
                lanzarNotificacion("DXon - Nuevo Libro/Proyecto", "Se ha agregado un nuevo proyecto a la lista.");
            }

            // Actualizar referencias en localStorage
            if (txtNoticia) localStorage.setItem('last_news_content', txtNoticia);
            if (txtRecurso) localStorage.setItem('last_resource_content', txtRecurso);
            if (txtProyecto) localStorage.setItem('last_project_content', txtProyecto);

        } catch (error) {
            console.error("Error al verificar novedades para notificaciones:", error);
        }
    });
})();