// ==========================================================
// main.js - Control Central y Máquina de Estados del Juego
// ==========================================================

import { iniciarNivel1 } from './bloques/nivel1.js';
import { iniciarNivel2 } from './bloques/nivel2.js';
import { iniciarNivel3 } from './bloques/nivel3.js'; 

// ==================== CONFIGURACIÓN DE AUDIO ====================
const MUSICA_FONDO = new Audio('src/audio/musica/loop_principal.mp3');
MUSICA_FONDO.loop = true;
MUSICA_FONDO.volume = 0.25; 

const SONIDO_ACIERTO = new Audio('src/audio/sfx/acierto.mp3');
const SONIDO_ERROR = new Audio('src/audio/sfx/error.mp3');
const SONIDO_EXITO_NIVEL = new Audio('src/audio/sfx/exito.mp3');

if (SONIDO_ACIERTO) SONIDO_ACIERTO.volume = 0.5;
if (SONIDO_ERROR) SONIDO_ERROR.volume = 0.4;
if (SONIDO_EXITO_NIVEL) SONIDO_EXITO_NIVEL.volume = 0.6;

// Variable de control para la narración activa actual
let narracionActual = null;

// ==================== ESTADO GLOBAL ====================
const estadoGlobal = {
    pantallaActual: 'pantalla-inicio',
    puntajeTotal: 0,
    audioPermitido: false,
    nivelActual: 1,           
    nivelEnCurso: null,       
    juegoActivo: false
};

let pantallaInicio, escenarioJuego, modalMensaje, modalComoJugar, spanPuntajeGlobal;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    pantallaInicio = document.getElementById('pantalla-inicio');
    escenarioJuego = document.getElementById('escenario-juego');
    modalMensaje = document.getElementById('modal-mensaje');
    modalComoJugar = document.getElementById('modal-como-jugar');
    
    if (!escenarioJuego) {
        escenarioJuego = document.createElement('div');
        escenarioJuego.id = 'escenario-juego';
        escenarioJuego.className = 'pantalla';
        document.getElementById('app').appendChild(escenarioJuego);
    }
    
    if (!document.getElementById('puntaje-global')) {
        const puntajeDiv = document.createElement('div');
        puntajeDiv.id = 'puntaje-global';
        puntajeDiv.style.position = 'absolute';
        puntajeDiv.style.top = '15px';
        puntajeDiv.style.right = '25px';
        puntajeDiv.style.background = 'rgba(255, 255, 255, 0.9)';
        puntajeDiv.style.border = '3px solid var(--azul-preescolar)';
        puntajeDiv.style.color = 'var(--fiusha-preescolar)';
        puntajeDiv.style.padding = '8px 18px';
        puntajeDiv.style.borderRadius = '30px';
        puntajeDiv.style.fontWeight = '900';
        puntajeDiv.style.fontSize = '1.3rem';
        puntajeDiv.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
        puntajeDiv.style.zIndex = '1000';
        puntajeDiv.innerText = `⭐ PUNTOS: 0`;
        document.getElementById('app').appendChild(puntajeDiv);
        spanPuntajeGlobal = puntajeDiv;
    } else {
        spanPuntajeGlobal = document.getElementById('puntaje-global');
    }
    
    inicializarEscala();
    configurarManejadoresEventos();
    
    document.body.addEventListener('pointerdown', habilitarAudioGlobal, { once: true });
});

function inicializarEscala() {
    const ajustar = () => {
        const escalaX = window.innerWidth / 1024;
        const escalaY = window.innerHeight / 768;
        const escala = Math.min(escalaX, escalaY, 1);
        document.documentElement.style.setProperty('--escala-juego', escala);
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    window.addEventListener('orientationchange', ajustar);
}

function habilitarAudioGlobal() {
    if (estadoGlobal.audioPermitido) return;
    estadoGlobal.audioPermitido = true;
    MUSICA_FONDO.play().catch(e => console.log('Música diferida:', e));
    
    reproducirNarracion('src/sonidos/L1/instruccion_portada.mp3'); 
}

function reproducirSonido(tipo) {
    if (!estadoGlobal.audioPermitido) return;
    let sonido;
    if (tipo === 'acierto') sonido = SONIDO_ACIERTO;
    else if (tipo === 'error') sonido = SONIDO_ERROR;
    else if (tipo === 'exito') sonido = SONIDO_EXITO_NIVEL;
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(e => console.log('SFX Bloqueado:', e));
    }
}

function reproducirNarracion(rutaArchivo) {
    if (!estadoGlobal.audioPermitido || !rutaArchivo) return;
    
    try {
        if (narracionActual) {
            narracionActual.pause();
            narracionActual.currentTime = 0;
        }
        narracionActual = new Audio(rutaArchivo);
        narracionActual.volume = 0.90; 
        narracionActual.play().catch(e => console.log('Narración bloqueada temporalmente:', e));
    } catch (error) {
        console.error("Error al reproducir la voz narrativa:", error);
    }
}

function actualizarPuntajeGlobal(puntos) {
    estadoGlobal.puntajeTotal += puntos;
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.innerText = `⭐ PUNTOS: ${estadoGlobal.puntajeTotal}`;
    }
}

function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('visible'));
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) pantalla.classList.add('visible');
    estadoGlobal.pantallaActual = idPantalla;
    
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.style.display = idPantalla === 'escenario-juego' ? 'block' : 'none';
    }
}

function configurarManejadoresEventos() {
    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) {
        btnIniciar.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            estadoGlobal.nivelActual = 1;
            estadoGlobal.puntajeTotal = 0;
            actualizarPuntajeGlobal(0);
            iniciarNivelActual();
        });
    }
}

// ==================== INYECTOR Y CONTROLADOR DE NIVELES ====================
async function iniciarNivelActual() {
    if (estadoGlobal.nivelEnCurso && typeof estadoGlobal.nivelEnCurso.limpiar === 'function') {
        estadoGlobal.nivelEnCurso.limpiar();
    }
    
    if (narracionActual) {
        narracionActual.pause();
        narracionActual.currentTime = 0;
    }
    
    mostrarPantalla('escenario-juego');
    estadoGlobal.juegoActivo = true;
    
    const callbacks = {
        sumarPuntos: (puntos) => actualizarPuntajeGlobal(puntos),
        reproducirSonido: (tipo) => reproducirSonido(tipo),
        reproducirNarracion: (ruta) => reproducirNarracion(ruta), 
        finalizarNivel: (exito, puntosObtenidos) => {
            estadoGlobal.juegoActivo = false;
            
            if (exito) {
                reproducirSonido('exito');
                reproducirNarracion(`src/sonidos/L${estadoGlobal.nivelActual}/logrado_exito.mp3`);
                
                setTimeout(() => {
                    if (estadoGlobal.nivelActual === 1 || estadoGlobal.nivelActual === 2) {
                        // TEXTO IDÉNTICO WORD NIVELES 1 Y 2
                        mostrarModalMensaje(
                            `¡Felicidades! Has descubierto que la vida es un gran regalo.`,
                            () => {
                                estadoGlobal.nivelActual++;
                                iniciarNivelActual();
                            },
                            'Siguiente Nivel',
                            'exito-nivel'
                        );
                    } else if (estadoGlobal.nivelActual === 3) {
                        // TEXTO IDÉNTICO WORD NIVEL 3 + CIERRE GLOBAL DEL DOCUMENTO
                        mostrarModalMensaje(
                            `¡Felicidades! Ya sabes cómo cuidar la casa donde todos vivimos.\n\n🏆 ¡Felicidades! Descubriste los grandes regalos 🏆`,
                            () => {
                                mostrarPantalla('pantalla-inicio');
                                estadoGlobal.nivelActual = 1;
                                estadoGlobal.puntajeTotal = 0;
                                actualizarPuntajeGlobal(0);
                            },
                            'Volver al Inicio',
                            'exito-nivel'
                        );
                    }
                }, 2500); 
                
            } else {
                mostrarModalMensaje(
                    `Inténtalo de nuevo para descubrir todos los regalos.`,
                    () => {
                        iniciarNivelActual(); 
                    },
                    'Reintentar',
                    'error-nivel'
                );
            }
        },
        mostrarModal: (mensaje, exito) => {
            if (exito) {
                const txt = estadoGlobal.nivelActual === 3 
                    ? `¡Felicidades! Ya sabes cómo cuidar la casa donde todos vivimos.` 
                    : `¡Felicidades! Has descubierto que la vida es un gran regalo.`;
                mostrarModalMensaje(txt, null, 'Genial', 'exito-nivel');
            } else {
                mostrarModalMensaje(`Inténtalo de nuevo para descubrir todos los regalos.`, null, 'Entendido', 'error-nivel');
            }
        }
    };

    // CORRECCIÓN CENTRAL: Mensaje de instrucción dinámico e idéntico al Word por nivel
    let instruccionTexto = "";
    switch(estadoGlobal.nivelActual) {
        case 1:
            instruccionTexto = "¡Atrapa los regalos de la creación!";
            break;
        case 2:
            instruccionTexto = "Toca las partes de tu cuerpo y descubre por qué son un tesoro.";
            break;
        case 3:
            instruccionTexto = "Elige las ilustraciones que ayudan a cuidar la casa en donde todos vivimos.";
            break;
        default:
            instruccionTexto = "Elige las ilustraciones correctas.";
    }

    // Desplegar el modal visual correcto en pantalla
    mostrarModalMensaje(
        instruccionTexto,
        () => {
            ejecutarLogicaNivel(callbacks);
        }, 
        '¡VAMOS!',
        'intro-nivel'
    );

    reproducirNarracion(`src/sonidos/L${estadoGlobal.nivelActual}/instruccion_portada.mp3`);
}

async function ejecutarLogicaNivel(callbacks) {
    let instancia;
    if (estadoGlobal.nivelActual === 1) {
        instancia = await iniciarNivel1(callbacks);
    } else if (estadoGlobal.nivelActual === 2) {
        instancia = await iniciarNivel2(callbacks);
    } else if (estadoGlobal.nivelActual === 3) {
        instancia = await iniciarNivel3(callbacks);
    }
    estadoGlobal.nivelEnCurso = instancia;
}

function mostrarModalMensaje(mensaje, onCerrar, textoBoton = 'Continuar', tipoEstilo = 'default') {
    if (!modalMensaje) {
        modalMensaje = document.createElement('div');
        modalMensaje.id = 'modal-mensaje';
        modalMensaje.className = 'modal hidden';
        modalMensaje.innerHTML = `
            <div class="modal-contenido">
                <span class="cerrar-modal">&times;</span>
                <p id="modal-mensaje-texto"></p>
                <button id="modal-mensaje-btn" class="btn-modal">${textoBoton}</button>
            </div>
        `;
        document.getElementById('app').appendChild(modalMensaje);
    }
    
    const contenido = modalMensaje.querySelector('.modal-contenido');
    const textoP = modalMensaje.querySelector('#modal-mensaje-texto');
    const btn = modalMensaje.querySelector('#modal-mensaje-btn');
    
    if (textoP) textoP.innerText = mensaje;
    if (btn) btn.innerText = textoBoton;
    
    contenido.className = 'modal-contenido';
    if (tipoEstilo !== 'default') {
        contenido.classList.add(`modal-${tipoEstilo}`);
    }
    
    const cerrarSpan = modalMensaje.querySelector('.cerrar-modal');
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);
    
    const cerrarFn = () => {
        modalMensaje.classList.add('hidden');
        if (onCerrar) onCerrar();
    };
    
    nuevoBtn.addEventListener('click', cerrarFn);
    if (cerrarSpan) {
        const nuevoSpan = cerrarSpan.cloneNode(true);
        cerrarSpan.parentNode.replaceChild(nuevoSpan, cerrarSpan);
        nuevoSpan.addEventListener('click', cerrarFn);
    }
    
    modalMensaje.classList.remove('hidden');
}