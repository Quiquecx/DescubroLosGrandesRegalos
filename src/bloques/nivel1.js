// src/bloques/nivel1.js - Atrapa los regalos de la creación (Versión MEGA VISUAL)
export async function iniciarNivel1(callbacks) {
    const { sumarPuntos, reproducirSonido, finalizarNivel, mostrarModal } = callbacks;
    
    const TIEMPO_LIMITE = 45; 
    const PUNTOS_POR_REGALO = 10;
    const PENALIZACION_TRAMPA = -15; 
    const MIN_REGALOS_PARA_APROBAR = 8; 
    
    let puntajeNivel = 0;
    let regalosAtrapados = 0;
    let tiempoRestante = TIEMPO_LIMITE;
    let temporizadorInterval = null;
    let juegoActivo = true;
    
    const listaRegalos = [
        'Calamar.png', 'Chimpance.png', 'Clabel.png', 'Cometa.png',
        'Flor.png', 'Foca.png', 'Ganso.png', 'Hormiguero.png',
        'Lirio 02.png', 'Lirio.png', 'Margarita.png', 'Marte.png',
        'Neptuno.png', 'Pinguino.png', 'Rosa.png', 'Saturno.png',
        'Urano.png', 'Venus.png', 'estrella.png', 'Pag_29_A.png',
        'Pag_29_B.png', 'Pag_29_C.png'
    ];

    const listaTrampas = ['Basura.png']; 
    
    let escenario = document.getElementById('escenario-juego');
    if (!escenario) {
        escenario = document.createElement('div');
        escenario.id = 'escenario-juego';
        escenario.className = 'pantalla';
        document.getElementById('app').appendChild(escenario);
    }
    
    escenario.innerHTML = '';
    escenario.classList.add('visible');
    
    escenario.style.backgroundImage = `url('src/imgs/n1/Fondo Portadilla L1B1.png')`;
    escenario.style.backgroundSize = 'cover';
    escenario.style.backgroundPosition = 'center';
    
    const juegoHTML = `
        <div class="nivel1-contenedor">
            <div class="nivel1-header">
                <div class="temporizador">⏱️ <span id="tiempo">${tiempoRestante}</span> s</div>
                <div class="puntaje">⭐ Puntos: <span id="puntos-nivel1">0</span></div>
            </div>
            
            <div id="area-regalos" class="area-regalos-full"></div>

            <div class="papa-dios-inferior-izq">
                <div class="mensaje-caja-mini">🎁 ¡Atrapa los regalos!</div>
                <img src="src/imgs/n1/regalos/Papa Dios.png" alt="Papá Dios" class="papa-dios-grande-img">
            </div>
            
            <div class="mensaje-final hidden" id="mensaje-final-nivel1"></div>
        </div>
    `;
    escenario.insertAdjacentHTML('beforeend', juegoHTML);
    
    const areaRegalos = document.getElementById('area-regalos');
    const tiempoSpan = document.getElementById('tiempo');
    const puntosSpan = document.getElementById('puntos-nivel1');
    const mensajeFinalDiv = document.getElementById('mensaje-final-nivel1');
    
    function generarElementoFlotante() {
        if (!juegoActivo) return;
        
        const esTrampa = Math.random() < 0.30;
        const nombreArchivo = esTrampa 
            ? listaTrampas[Math.floor(Math.random() * listaTrampas.length)]
            : listaRegalos[Math.floor(Math.random() * listaRegalos.length)];
            
        const elementoDiv = document.createElement('div');
        elementoDiv.className = 'regalo-flotante';
        elementoDiv.setAttribute('data-atrapado', 'false');
        if (esTrampa) {
            elementoDiv.classList.add('objeto-trampa');
        }
        
        const img = document.createElement('img');
        img.src = `src/imgs/n1/regalos/${nombreArchivo}`;
        img.alt = esTrampa ? 'Trampa' : 'Regalo';
        
        // ¡TAMAÑOS COLOSALES DE PIEZAS! (De 65px/75px suben a 115px y 135px)
        img.style.width = esTrampa ? '115px' : '135px'; 
        img.style.height = 'auto';
        img.style.pointerEvents = 'none'; 
        elementoDiv.appendChild(img);
        
        // Punto de origen ajustado al centro del nuevo Papá Dios gigante
        elementoDiv.style.left = '140px';
        elementoDiv.style.top = '480px';
        elementoDiv.style.transform = 'scale(0.1)';
        elementoDiv.style.opacity = '0';
        
        elementoDiv.style.transition = 'all 0.55s cubic-bezier(0.1, 0.8, 0.35, 1)';
        
        areaRegalos.appendChild(elementoDiv);
        
        // Destinos de dispersión por la pantalla (evitando que se salgan del marco lateral derecho)
        const destinoX = 280 + Math.random() * 580; 
        const alturaImpulso = 40 + Math.random() * 90; 
        
        // FASE 1: ¡Disparo hacia arriba!
        setTimeout(() => {
            if (!juegoActivo || !elementoDiv.parentNode) return;
            elementoDiv.style.left = `${destinoX}px`;
            elementoDiv.style.top = `${alturaImpulso}px`;
            elementoDiv.style.transform = 'scale(1)';
            elementoDiv.style.opacity = '1';
        }, 50);
        
        // FASE 2: Gravedad y caída
        setTimeout(() => {
            if (!juegoActivo || !elementoDiv.parentNode || elementoDiv.getAttribute('data-atrapado') === 'true') return;
            // Caída ligeramente más lenta (2.6s) para darles tiempo de reaccionar al nuevo tamaño gigante
            elementoDiv.style.transition = 'top 2.6s linear, transform 0.2s ease, opacity 0.2s ease';
            elementoDiv.style.top = '790px'; 
        }, 600);
        
        // Eliminación del mapa
        setTimeout(() => {
            if (elementoDiv.parentNode) {
                elementoDiv.remove();
            }
        }, 3300);
        
        // Captura
        elementoDiv.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (!juegoActivo || elementoDiv.getAttribute('data-atrapado') === 'true') return;
            
            elementoDiv.setAttribute('data-atrapado', 'true');
            elementoDiv.style.transition = 'transform 0.15s ease, opacity 0.15s ease';
            
            if (esTrampa) {
                elementoDiv.style.transform = 'scale(0.5) rotate(-25deg)';
                elementoDiv.style.opacity = '0';
                
                puntajeNivel += PENALIZACION_TRAMPA;
                if (puntajeNivel < 0) puntajeNivel = 0;
                
                if (sumarPuntos) sumarPuntos(PENALIZACION_TRAMPA);
                if (reproducirSonido) reproducirSonido('error'); 
            } else {
                elementoDiv.style.transform = 'scale(1.3)';
                elementoDiv.style.opacity = '0';
                
                puntajeNivel += PUNTOS_POR_REGALO;
                regalosAtrapados++;
                
                if (sumarPuntos) sumarPuntos(PUNTOS_POR_REGALO);
                if (reproducirSonido) reproducirSonido('acierto');
            }
            
            puntosSpan.innerText = puntajeNivel;
            setTimeout(() => { elementoDiv.remove(); }, 200);
        });
    }
    
    let intervaloGeneracion = setInterval(generarElementoFlotante, 900); // 900ms para compensar el tamaño y que no se sature la pantalla
    
    temporizadorInterval = setInterval(() => {
        if (!juegoActivo) return;
        
        if (tiempoRestante <= 1) {
            clearInterval(temporizadorInterval);
            clearInterval(intervaloGeneracion);
            juegoActivo = false;
            
            const exito = regalosAtrapados >= MIN_REGALOS_PARA_APROBAR;
            const mensaje = exito 
                ? '🎉 ¡Felicidades! Has descubierto grandes regalos de la creación. 🎉'
                : `¡Oh no! Lograste atrapar ${regalosAtrapados} regalos buenos. Necesitas al menos ${MIN_REGALOS_PARA_APROBAR}. ¡Inténtalo de nuevo!`;
            
            mensajeFinalDiv.innerHTML = `<p>${mensaje}</p>`;
            mensajeFinalDiv.classList.remove('hidden');
            
            if (mostrarModal) mostrarModal(mensaje, exito);
            if (finalizarNivel) finalizarNivel(exito, puntajeNivel);
            
            agregarBotonReintentar();
        } else {
            tiempoRestante--;
            tiempoSpan.innerText = tiempoRestante;
        }
    }, 1000);
    
    function agregarBotonReintentar() {
        const botonReintentar = document.createElement('button');
        botonReintentar.innerText = '🔁 Jugar de nuevo';
        botonReintentar.className = 'btn-principal';
        botonReintentar.style.marginTop = '20px';
        botonReintentar.addEventListener('click', () => {
            limpiarNivel();
            iniciarNivel1(callbacks);
        });
        mensajeFinalDiv.appendChild(botonReintentar);
    }
    
    function limpiarNivel() {
        if (temporizadorInterval) clearInterval(temporizadorInterval);
        if (intervaloGeneracion) clearInterval(intervaloGeneracion);
        juegoActivo = false;
        areaRegalos.innerHTML = '';
        escenario.classList.remove('visible');
    }
    
    return { limpiar: limpiarNivel };
}