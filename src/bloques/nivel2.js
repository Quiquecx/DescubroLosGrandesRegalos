// src/bloques/nivel2.js - Mi cuerpo es un tesoro (Versión INTEGRADA CON EL WORD)
import { mostrarModalInstruccionNivel2 } from '../main.js';

export async function iniciarNivel2(callbacks) {
    const { sumarPuntos, reproducirSonido, reproducirNarracion, finalizarNivel, mostrarModal } = callbacks;
    
    const PUNTOS_POR_ACIERTO = 20;
    let puntajeNivel = 0;
    let aciertos = 0;
    const totalPartes = 6;
    let juegoActivo = true;
    let personajeSeleccionado = null;
    let piezaClickeadaPreviamente = null;
    
    const BASE_PATH = 'src/imgs/n2/';  
    
    let escenario = document.getElementById('escenario-juego');
    if (!escenario) {
        escenario = document.createElement('div');
        escenario.id = 'escenario-juego';
        escenario.className = 'pantalla';
        document.getElementById('app').appendChild(escenario);
    }
    
    escenario.innerHTML = '';
    escenario.classList.add('visible');
    escenario.style.backgroundColor = '#fdfaf2';
    
    // El juego inicia directo en completo silencio pidiendo la selección
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
                
                // MEJORA INTERACTIVA: Disparar audio de vozSeleccionPersonajeL2 y al terminar abrir la instrucción
                reproducirNarracion('src/sonidos/L2/vozSeleccionPersonajeL2.mp3', () => {
                    // Este bloque se ejecuta exactamente cuando finaliza la pista de audio
                    mostrarModalInstruccionNivel2(() => {
                        iniciarJuegoArrastre();
                    });
                });
            });
        });
    }
    
    function iniciarJuegoArrastre() {
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const personajeCap = capitalize(personajeSeleccionado);
        
        const partes = {
            cabeza: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Cabeza_${personajeCap}.png`, 
                text: 'Mi cabeza y mi carita son regalos de Dios para expresarme.',
                audioUrl: 'src/sonidos/L2/CaritaConOjosCerrados.mp3'
            },
            manos: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Manos_${personajeCap}.png`, 
                text: 'Con mis manitas puedo hacer cosas buenas.' ,
                audioUrl: 'src/sonidos/L2/manos.mp3'
            },
            pies: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Pies_${personajeCap}.png`, 
                text: 'Con mis pies puedo caminar, jugar y hacer el bien.' ,
                audioUrl: 'src/sonidos/L2/pies.mp3'
            },
            oidos: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Orejas_${personajeCap}.png`, 
                text: 'Con mis oídos escucho con atención.' ,
                audioUrl: 'src/sonidos/L2/oidos.mp3'
            },
            ojos: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Ojos_${personajeCap}.png`, 
                text: 'Con mis ojos puedo ver las maravillas de la creación.' ,
                audioUrl: 'src/sonidos/L2/ojosAbiertos.mp3'
            },
            corazon: { 
                img: `${BASE_PATH}${personajeSeleccionado}/Corazon.png`, 
                text: 'Papá Dios me dio un corazón para amar y hacer el bien.' ,
                audioUrl: 'src/sonidos/L2/corazon.mp3'
            }
        };
        
        const siluetaImg = `${BASE_PATH}${personajeSeleccionado}/${personajeCap}_silueta.png`;

        const juegoHTML = `
            <div class="nivel2-contenedor personaje-${personajeSeleccionado}">
                <div class="nivel2-header">
                    <div class="puntaje-n2">⭐ Puntos: <span id="puntos-n2">${puntajeNivel}</span></div>
                    <div class="progreso-n2">🎯 Aciertos: <span id="aciertos-n2">${aciertos}</span> / ${totalPartes}</div>
                </div>
                
                <div class="nivel2-area-juego">
                    <div class="silueta-container">
                        <img src="${siluetaImg}" alt="Silueta" class="capa-personaje silueta-base">
                        
                        <img src="${partes.cabeza.img}"  id="destino-cabeza"  class="capa-personaje pieza-destino-capa hidden" data-parte="cabeza">
                        <img src="${partes.manos.img}"   id="destino-manos"   class="capa-personaje pieza-destino-capa hidden" data-parte="manos">
                        <img src="${partes.pies.img}"    id="destino-pies"    class="capa-personaje pieza-destino-capa hidden" data-parte="pies">
                        <img src="${partes.oidos.img}"   id="destino-oidos"   class="capa-personaje pieza-destino-capa hidden" data-parte="oidos">
                        <img src="${partes.ojos.img}"    id="destino-ojos"    class="capa-personaje pieza-destino-capa hidden" data-parte="ojos">
                        <img src="${partes.corazon.img}" id="destino-corazon" class="capa-personaje pieza-destino-capa hidden" data-parte="corazon">
                        
                        <div class="drop-capturador zona-cabeza"  data-parte="cabeza"></div>
                        <div class="drop-capturador zona-manos"   data-parte="manos"></div>
                        <div class="drop-capturador zona-pies"    data-parte="pies"></div>
                        <div class="drop-capturador zona-oidos"   data-parte="oidos"></div>
                        <div class="drop-capturador zona-ojos"    data-parte="ojos"></div>
                        <div class="drop-capturador zona-corazon" data-parte="corazon"></div>
                    </div>
                    
                    <div class="partes-container" id="partes-container"></div>
                </div>
            </div>
        `;
        escenario.innerHTML = juegoHTML;
        
        setTimeout(() => {
            const partesKeys = ['cabeza', 'manos', 'pies', 'oidos', 'ojos', 'corazon'];
            partesKeys.forEach(parte => {
                const destino = document.getElementById(`destino-${parte}`);
                const zona = document.querySelector(`.zona-${parte}`);
                if (destino && zona) {
                    zona.style.top = destino.style.top || getComputedStyle(destino).top;
                    zona.style.left = destino.style.left || getComputedStyle(destino).left;
                    
                    if (parte === 'cabeza') zona.style.height = '35%';
                    else if (parte === 'ojos') zona.style.height = '10%';
                    else if (parte === 'oidos') zona.style.height = '12%';
                    else if (parte === 'corazon') zona.style.height = '12%';
                    else if (parte === 'manos') zona.style.height = '15%';
                    else if (parte === 'pies') zona.style.height = '15%';
                }
            });
        }, 50);

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
            
            parteDiv.appendChild(img);
            
            parteDiv.addEventListener('dragstart', handleDragStart);
            parteDiv.addEventListener('dragend', handleDragEnd);
            parteDiv.addEventListener('click', () => handleSeleccionPorClick(key));
            
            partesContainer.appendChild(parteDiv);
        });
        
        document.querySelectorAll('.drop-capturador').forEach(zona => {
            zona.addEventListener('dragover', (e) => e.preventDefault());
            zona.addEventListener('drop', handleDrop);
            zona.addEventListener('click', () => {
                if (zona.classList.contains('completado')) return;
                if (piezaClickeadaPreviamente) {
                    procesarVerificacion(piezaClickeadaPreviamente, zona.dataset.parte);
                    piezaClickeadaPreviamente = null;
                }
            });
        });
        
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
            
            const parteData = partes[parteId];
            mostrarFeedback(`🎵 ${parteData.text}`, 'acierto');
            
            if (reproducirNarracion) {
                reproducirNarracion(parteData.audioUrl);
            }
            
            const elementoOriginal = document.querySelector(`.parte-arrastrable[data-parte="${parteId}"]`);
            if (elementoOriginal) elementoOriginal.remove();
            
            document.getElementById('puntos-n2').innerText = puntajeNivel;
            document.getElementById('aciertos-n2').innerText = aciertos;
            
            if (aciertos === totalPartes) {
                juegoActivo = false;
                const mensaje = '¡Felicidades! Has descubierto que la vida es un gran regalo.';
                
                // Se removieron las alertas internas de finalización del archivo local
                if (finalizarNivel) finalizarNivel(true, puntajeNivel);
            }
        }
        
        function mostrarFeedback(texto, tipo) {
            const contenedor = document.querySelector('.nivel2-contenedor');
            if (!contenedor) return;
            const feedback = document.createElement('div');
            feedback.className = `feedback-pop ${tipo === 'acierto' ? 'fb-exito' : 'fb-error'}`;
            feedback.innerText = texto;
            contenedor.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2500);
        }
    }
    
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