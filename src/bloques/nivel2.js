export async function iniciarNivel2(callbacks) {
    const { sumarPuntos, reproducirSonido, finalizarNivel, mostrarModal } = callbacks;
    
    const PUNTOS_POR_ACIERTO = 20;
    let puntajeNivel = 0;
    let aciertos = 0;
    const totalPartes = 6;
    let juegoActivo = true;
    let personajeSeleccionado = null;
    let piezaClickeadaPreviamente = null;
    
    // Base de rutas unificada
    const BASE_PATH = 'src/imgs/n2/';  
    
    let escenario = document.getElementById('escenario-juego');
    if (!escenario) {
        escenario = document.createElement('div');
        escenario.id = 'escenario-juego';
        escenario.className = 'pantalla';
        document.getElementById('app').appendChild(escenario);
    }
    
    // Limpiar y mostrar
    escenario.innerHTML = '';
    escenario.classList.add('visible');
    escenario.style.backgroundColor = '#fdfaf2';
    
    // ---------- PASO 1: Selección de personaje ----------
    mostrarSeleccionPersonaje();
    
    function mostrarSeleccionPersonaje() {
        const seleccionHTML = `
            <div class="nivel2-seleccion">
                <h2>🌟 Elige tu personaje 🌟</h2>
                <div class="personajes-container">
                    <div class="personaje-card" data-personaje="santi">
                        <img src="${BASE_PATH}santi/Santi_silueta.png" alt="Santi" onerror="this.src='https://placehold.co/150x150?text=Santi'">
                        <p>👦 Santi</p>
                    </div>
                    <div class="personaje-card" data-personaje="ana">
                        <img src="${BASE_PATH}ana/Ana_silueta.png" alt="Ana" onerror="this.src='https://placehold.co/150x150?text=Ana'">
                        <p>👧 Ana</p>
                    </div>
                </div>
            </div>
        `;
        escenario.innerHTML = seleccionHTML;
        
        document.querySelectorAll('.personaje-card').forEach(card => {
            card.addEventListener('click', () => {
                personajeSeleccionado = card.dataset.personaje;
                console.log(`Personaje seleccionado: ${personajeSeleccionado}`);
                iniciarJuegoArrastre();
            });
        });
    }
    
    // ---------- PASO 2: Juego de arrastre ----------
    function iniciarJuegoArrastre() {
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const personajeCap = capitalize(personajeSeleccionado);
        
        // Mapeo dinámico de imágenes
        const partes = {
            cabeza: { img: `${BASE_PATH}${personajeSeleccionado}/Cabeza_${personajeCap}.png`, audio: 'Mi cabeza y mi carita son regalos de Dios.' },
            manos: { img: `${BASE_PATH}${personajeSeleccionado}/Manos_${personajeCap}.png`, audio: 'Con mis manitas puedo hacer cosas buenas.' },
            ojos: { img: `${BASE_PATH}${personajeSeleccionado}/Ojos_${personajeCap}.png`, audio: 'Con mis ojos veo maravillas.' },
            oidos: { img: `${BASE_PATH}${personajeSeleccionado}/Orejas_${personajeCap}.png`, audio: 'Con mis oídos escucho con atención.' },
            pies: { img: `${BASE_PATH}${personajeSeleccionado}/Pies_${personajeCap}.png`, audio: 'Con mis pies camino y juego.' },
            corazon: { img: `${BASE_PATH}${personajeSeleccionado}/Corazon.png`, audio: 'Papá Dios me dio un corazón para amar.' }
        };
        
        const siluetaImg = `${BASE_PATH}${personajeSeleccionado}/${personajeCap}_silueta.png`;

        // Estructura HTML con la clase dinámica del personaje en el contenedor principal
        const juegoHTML = `
            <div class="nivel2-contenedor personaje-${personajeSeleccionado}">
                <div class="nivel2-header">
                    <div class="puntaje-n2">⭐ Puntos: <span id="puntos-n2">${puntajeNivel}</span></div>
                    <div class="progreso-n2">🎯 Aciertos: <span id="aciertos-n2">${aciertos}</span> / ${totalPartes}</div>
                </div>
                
                <div class="nivel2-area-juego">
                    <div class="silueta-container">
                        <!-- CAPA 1: Silueta base (fondo) -->
                        <img src="${siluetaImg}" alt="Silueta" class="capa-personaje silueta-base">
                        
                        <!-- CAPAS 2 a 7: Piezas ocultas que se revelan al acertar -->
                        <img src="${partes.cabeza.img}"  id="destino-cabeza"  class="capa-personaje pieza-destino-capa hidden" data-parte="cabeza">
                        <img src="${partes.manos.img}"   id="destino-manos"   class="capa-personaje pieza-destino-capa hidden" data-parte="manos">
                        <img src="${partes.ojos.img}"    id="destino-ojos"    class="capa-personaje pieza-destino-capa hidden" data-parte="ojos">
                        <img src="${partes.oidos.img}"   id="destino-oidos"   class="capa-personaje pieza-destino-capa hidden" data-parte="oidos">
                        <img src="${partes.pies.img}"    id="destino-pies"    class="capa-personaje pieza-destino-capa hidden" data-parte="pies">
                        <img src="${partes.corazon.img}" id="destino-corazon" class="capa-personaje pieza-destino-capa hidden" data-parte="corazon">
                        
                        <!-- Zonas de drop (invisibles pero interactivas) -->
                        <div class="drop-capturador zona-cabeza"  data-parte="cabeza"></div>
                        <div class="drop-capturador zona-manos"   data-parte="manos"></div>
                        <div class="drop-capturador zona-ojos"    data-parte="ojos"></div>
                        <div class="drop-capturador zona-oidos"   data-parte="oidos"></div>
                        <div class="drop-capturador zona-pies"    data-parte="pies"></div>
                        <div class="drop-capturador zona-corazon" data-parte="corazon"></div>
                    </div>
                    
                    <!-- Almacén de piezas sueltas (lado derecho) -->
                    <div class="partes-container" id="partes-container"></div>
                </div>
                
                <div class="mensaje-final-n2 hidden" id="mensaje-final-n2"></div>
            </div>
        `;
        escenario.innerHTML = juegoHTML;
        
        // ---------- Sincronización Automática de Zonas Drop con CSS ----------
        setTimeout(() => {
            const partesKeys = ['cabeza', 'manos', 'ojos', 'oidos', 'pies', 'corazon'];
            partesKeys.forEach(parte => {
                const destino = document.getElementById(`destino-${parte}`);
                const zona = document.querySelector(`.zona-${parte}`);
                if (destino && zona) {
                    // Copiar posición horizontal y ancho calculado desde el CSS del personaje actual
                    zona.style.top = destino.style.top || getComputedStyle(destino).top;
                    zona.style.left = destino.style.left || getComputedStyle(destino).left;
                    zona.style.width = destino.style.width || getComputedStyle(destino).width;
                    
                    // Alturas proporcionales interactivas para las cajas de colisión
                    if (parte === 'cabeza') zona.style.height = '35%';
                    else if (parte === 'ojos') zona.style.height = '10%';
                    else if (parte === 'oidos') zona.style.height = '12%';
                    else if (parte === 'corazon') zona.style.height = '12%';
                    else if (parte === 'manos') zona.style.height = '15%';
                    else if (parte === 'pies') zona.style.height = '15%';
                }
            });
        }, 50);

        // ---------- Generar piezas sueltas (mezcladas) ----------
        const llavesMezcladas = Object.keys(partes).sort(() => Math.random() - 0.5);
        const partesContainer = document.getElementById('partes-container');
        
        llavesMezcladas.forEach(key => {
            const data = partes[key];
            const parteDiv = document.createElement('div');
            parteDiv.className = 'parte-arrastrable';
            parteDiv.setAttribute('data-parte', key);
            parteDiv.setAttribute('draggable', 'true');
            
            const img = document.createElement('img');
            img.src = data.img;
            img.alt = key;
            img.onerror = () => console.error(`Error: No se pudo cargar la pieza [${key}] en: ${data.img}`);
            
            parteDiv.appendChild(img);
            
            // Eventos Drag & Drop
            parteDiv.addEventListener('dragstart', handleDragStart);
            parteDiv.addEventListener('dragend', handleDragEnd);
            
            // Soporte para clic (accesibilidad en tabletas)
            parteDiv.addEventListener('click', () => handleSeleccionPorClick(key));
            
            partesContainer.appendChild(parteDiv);
        });
        
        // ---------- Configurar zonas de drop ----------
        document.querySelectorAll('.drop-capturador').forEach(zona => {
            zona.addEventListener('dragover', (e) => e.preventDefault());
            zona.addEventListener('drop', handleDrop);
            // Clic directo en la zona si hay pieza seleccionada
            zona.addEventListener('click', () => {
                if (zona.classList.contains('completado')) return;
                if (piezaClickeadaPreviamente) {
                    procesarVerificacion(piezaClickeadaPreviamente, zona.dataset.parte);
                    piezaClickeadaPreviamente = null;
                }
            });
        });
        
        // ---------- Variables de arrastre ----------
        let draggedParte = null;
        
        function handleDragStart(e) {
            if (!juegoActivo) return;
            draggedParte = this;
            e.dataTransfer.setData('text/plain', this.getAttribute('data-parte'));
            this.style.opacity = '0.4';
        }
        
        function handleDragEnd(e) {
            if (draggedParte) draggedParte.style.opacity = '1';
            draggedParte = null;
        }
        
        function handleDrop(e) {
            e.preventDefault();
            if (!juegoActivo) return;
            const zonaDestino = e.currentTarget;
            if (zonaDestino.classList.contains('completado')) return;
            const parteId = e.dataTransfer.getData('text/plain');
            const parteEsperada = zonaDestino.dataset.parte;
            procesarVerificacion(parteId, parteEsperada);
        }
        
        // ---------- Selección por clic (modo táctil) ----------
        function handleSeleccionPorClick(parteId) {
            if (!juegoActivo) return;
            document.querySelectorAll('.parte-arrastrable').forEach(p => p.classList.remove('seleccionada'));
            
            if (piezaClickeadaPreviamente === parteId) {
                piezaClickeadaPreviamente = null;
                return;
            }
            piezaClickeadaPreviamente = parteId;
            const elemento = document.querySelector(`.parte-arrastrable[data-parte="${parteId}"]`);
            if (elemento) elemento.classList.add('seleccionada');
        }
        
        // ---------- Verificación centralizada ----------
        function procesarVerificacion(parteId, parteEsperada) {
            if (parteId !== parteEsperada) {
                if (reproducirSonido) reproducirSonido('error');
                mostrarFeedback('❌ ¡Ups! Inténtalo de nuevo.', 'error');
                return;
            }
            
            const capaDestino = document.getElementById(`destino-${parteId}`);
            if (capaDestino && !capaDestino.classList.contains('hidden')) {
                mostrarFeedback('⚠️ Ya colocaste esa parte.', 'error');
                return;
            }
            
            if (capaDestino) {
                capaDestino.classList.remove('hidden');
            }
            
            const zonaDrop = document.querySelector(`.drop-capturador[data-parte="${parteId}"]`);
            if (zonaDrop) {
                zonaDrop.classList.add('completado');
            }
            
            aciertos++;
            puntajeNivel += PUNTOS_POR_ACIERTO;
            if (sumarPuntos) sumarPuntos(PUNTOS_POR_ACIERTO);
            if (reproducirSonido) reproducirSonido('acierto');
            
            const audioTexto = partes[parteId].audio;
            mostrarFeedback(`🎵 ${audioTexto}`, 'acierto');
            
            const elementoOriginal = document.querySelector(`.parte-arrastrable[data-parte="${parteId}"]`);
            if (elementoOriginal) elementoOriginal.remove();
            
            document.getElementById('puntos-n2').innerText = puntajeNivel;
            document.getElementById('aciertos-n2').innerText = aciertos;
            
            if (aciertos === totalPartes) {
                juegoActivo = false;
                const mensaje = '🎉 ¡Felicidades! Has descubierto que tu cuerpo es un gran regalo. 🎉';
                const mensajeDiv = document.getElementById('mensaje-final-n2');
                mensajeDiv.innerText = mensaje;
                mensajeDiv.classList.remove('hidden');
                
                if (mostrarModal) mostrarModal(mensaje, true);
                if (finalizarNivel) finalizarNivel(true, puntajeNivel);
                agregarBotonContinuar();
            }
        }
        
        // ---------- Feedback visual ----------
        function mostrarFeedback(texto, tipo) {
            const contenedor = document.querySelector('.nivel2-contenedor');
            if (!contenedor) return;
            const feedback = document.createElement('div');
            feedback.className = `feedback-pop ${tipo === 'acierto' ? 'fb-exito' : 'fb-error'}`;
            feedback.innerText = texto;
            contenedor.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2500);
        }
        
        // ---------- Botón para continuar ----------
        function agregarBotonContinuar() {
            const btn = document.createElement('button');
            btn.innerText = '➡️ Siguiente nivel';
            btn.className = 'btn-continuar-n2';
            btn.addEventListener('click', () => {
                if (finalizarNivel) finalizarNivel(true, puntajeNivel, { continuar: true });
            });
            document.getElementById('mensaje-final-n2').appendChild(btn);
        }
    }
    
    // ---------- Limpieza del nivel ----------
    return {
        limpiar: () => {
            juegoActivo = false;
            if (escenario) {
                escenario.classList.remove('visible');
                escenario.innerHTML = '';
            }
            piezaClickeadaPreviamente = null;
        }
    };
}