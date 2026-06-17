// ==========================================================
// main.js - Control Central y Máquina de Estados del Juego
// ==========================================================

// Importar módulos de niveles
import { iniciarNivel1 } from './bloques/nivel1.js';
import { iniciarNivel2 } from './bloques/nivel2.js';
import { iniciarNivel3 } from './bloques/nivel3.js'; 

// ==================== CONFIGURACIÓN DE AUDIO ====================
const MUSICA_FONDO = new Audio('src/audio/musica/loop_principal.mp3');
MUSICA_FONDO.loop = true;
MUSICA_FONDO.volume = 0.3;

const SONIDO_ACIERTO = new Audio('src/audio/sfx/acierto.mp3');
const SONIDO_ERROR = new Audio('src/audio/sfx/error.mp3');
const SONIDO_EXITO_NIVEL = new Audio('src/audio/sfx/exito.mp3');

if (SONIDO_ACIERTO) SONIDO_ACIERTO.volume = 0.5;
if (SONIDO_ERROR) SONIDO_ERROR.volume = 0.4;
if (SONIDO_EXITO_NIVEL) SONIDO_EXITO_NIVEL.volume = 0.6;

// ==================== ESTADO GLOBAL ====================
const estadoGlobal = {
    pantallaActual: 'pantalla-inicio',
    puntajeTotal: 0,
    audioPermitido: false,
    nivelActual: 1,           // 1, 2 o 3
    nivelEnCurso: null,       // Instancia del nivel activo (para limpieza de memoria)
    juegoActivo: false
};

// ==================== ELEMENTOS DEL DOM ====================
let pantallaInicio, escenarioJuego, modalMensaje, modalComoJugar;
let spanPuntajeGlobal;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    pantallaInicio = document.getElementById('pantalla-inicio');
    escenarioJuego = document.getElementById('escenario-juego');
    modalMensaje = document.getElementById('modal-mensaje');
    modalComoJugar = document.getElementById('modal-como-jugar');
    
    // Crear escenario si no existe en el HTML
    if (!escenarioJuego) {
        escenarioJuego = document.createElement('div');
        escenarioJuego.id = 'escenario-juego';
        escenarioJuego.className = 'pantalla';
        document.getElementById('app').appendChild(escenarioJuego);
    }
    
    // Mostrador dinámico de puntaje global (Estilo Preescolar)
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
    precargarImagenes();
    
    // Soporte unificado Touch/Mouse para la primera interacción obligatoria de audio
    document.body.addEventListener('pointerdown', habilitarAudioGlobal, { once: true });
});

// ==================== ESCALA RESPONSIVA MANTENIENDO CONTENEDOR RÍGIDO ====================
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

// ==================== PRECARGA OPTIMIZADA DE ASSETS ====================
function precargarImagenes() {
    const imagenes = [
        'src/img/regalos/Papa Dios.png',
        'src/img/regalos/Flor.png',
        'src/img/n1/Fondo Portadilla L1B1.png',
        'src/images/n2/ana/Ana_silueta.png',
        'src/images/n2/santi/Santi_silueta.png',
        'src/imgs/intro/portada.png',
        'src/imgs/intro/Titulos-01.png',
        'src/imgs/intro/logo corto de cruz.png'
    ];
    imagenes.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ==================== CONTROLADOR DE AUDIO GLOBAL ====================
function habilitarAudioGlobal() {
    if (estadoGlobal.audioPermitido) return;
    estadoGlobal.audioPermitido = true;
    MUSICA_FONDO.play().catch(e => console.log('Música de fondo diferida:', e));
    const bienvenida = new Audio('src/audio/narraciones/inicio_bienvenida.mp3');
    bienvenida.play().catch(e => console.log('Narración omitida:', e));
}

// ==================== MANEJADOR DE EFECTOS DE SONIDO ====================
function reproducirSonido(tipo) {
    if (!estadoGlobal.audioPermitido) return;
    let sonido;
    if (tipo === 'acierto') sonido = SONIDO_ACIERTO;
    else if (tipo === 'error') sonido = SONIDO_ERROR;
    else if (tipo === 'exito') sonido = SONIDO_EXITO_NIVEL;
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(e => console.log('Manejador SFX blocked:', e));
    }
}

function actualizarPuntajeGlobal(puntos) {
    estadoGlobal.puntajeTotal += puntos;
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.innerText = `⭐ PUNTOS: ${estadoGlobal.puntajeTotal}`;
    }
}

// ==================== CAMBIO ESTRUCTURAL DE PANTALLAS ====================
function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('visible'));
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) pantalla.classList.add('visible');
    
    estadoGlobal.pantallaActual = idPantalla;
    
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.style.display = idPantalla === 'escenario-juego' ? 'block' : 'none';
    }
}

// ==================== MANEJADORES DE EVENTOS DE LA INTERFAZ DE INICIO (TOUCH FRIENDLY) ====================
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
    
    const btnComoJugar = document.getElementById('btn-como-jugar');
    if (btnComoJugar && modalComoJugar) {
        btnComoJugar.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            modalComoJugar.classList.remove('hidden');
        });
        
        const cerrar = modalComoJugar.querySelector('.cerrar-modal');
        const btnCerrar = document.getElementById('btn-cerrar-modal');
        
        if (cerrar) {
            cerrar.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                modalComoJugar.classList.add('hidden');
            });
        }
        if (btnCerrar) {
            btnCerrar.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                modalComoJugar.classList.add('hidden');
            });
        }
        
        window.addEventListener('pointerdown', (e) => {
            if (e.target === modalComoJugar) modalComoJugar.classList.add('hidden');
        });
    }
}

// ==================== INYECTOR Y CONTROLADOR DE NIVELES ====================
async function iniciarNivelActual() {
    if (estadoGlobal.nivelEnCurso && typeof estadoGlobal.nivelEnCurso.limpiar === 'function') {
        estadoGlobal.nivelEnCurso.limpiar();
    }
    
    mostrarPantalla('escenario-juego');
    estadoGlobal.juegoActivo = true;
    
    const callbacks = {
        sumarPuntos: (puntos) => actualizarPuntajeGlobal(puntos),
        reproducirSonido: (tipo) => reproducirSonido(tipo),
        finalizarNivel: (exito, puntosObtenidos) => {
            estadoGlobal.juegoActivo = false;
            
            if (exito) {
                reproducirSonido('exito');
                
                // Retraso controlado para permitir feedback visual y asimilación en el infante
                setTimeout(() => {
                    if (estadoGlobal.nivelActual < 3) {
                        mostrarModalMensaje(
                            `🎉 ¡GRANDIOSO! 🎉\nCompletaste con éxito el Nivel ${estadoGlobal.nivelActual}.\n¿Listo para el siguiente reto?`,
                            () => {
                                estadoGlobal.nivelActual++;
                                iniciarNivelActual();
                            },
                            'Siguiente Nivel',
                            'exito-nivel'
                        );
                    } else {
                        // Flujo final al completar exitosamente el Nivel 3
                        mostrarModalMensaje(
                            `🏆 ¡ENHORABUENA! 🏆\n¡Felicidades! Ya sabes cómo cuidar la casa donde todos vivimos.\n⭐ Completaste toda la aventura ⭐`,
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
                    `😢 No logramos superar el nivel ${estadoGlobal.nivelActual}.\n¡No te preocupes, puedes intentarlo de nuevo!`,
                    () => {
                        iniciarNivelActual(); 
                    },
                    'Reintentar',
                    'error-nivel'
                );
            }
        },
        mostrarModal: (mensaje, exito) => {
            mostrarModalMensaje(mensaje, null, exito ? 'Genial' : 'Entendido', exito ? 'exito-nivel' : 'error-nivel');
        }
    };

    // Abre la portadilla estática; al cerrarse presionando "¡VAMOS!", arranca la inyección lógica real
    mostrarModalMensaje(
        `🎈 ¡NIVEL ${estadoGlobal.nivelActual}! 🎈\nPrepárate para jugar y descubrir grandes regalos.`,
        () => {
            ejecutarLogicaNivel(callbacks);
        }, 
        '¡VAMOS!',
        'intro-nivel'
    );
}

// Subfunción interna aislada para despertar los hilos lógicos de los bloques JS independientes
async function ejecutarLogicaNivel(callbacks) {
    let instancia;
    if (estadoGlobal.nivelActual === 1) {
        instancia = await iniciarNivel1(callbacks);
    } else if (estadoGlobal.nivelActual === 2) {
        instancia = await iniciarNivel2(callbacks);
    } else if (estadoGlobal.nivelActual === 3) {
        // Ejecución oficial y limpia del Nivel 3 cargado dinámicamente
        instancia = await iniciarNivel3(callbacks);
    }
    estadoGlobal.nivelEnCurso = instancia;
}

// ==================== MOTOR DE MODALES DINÁMICOS (OPTIMIZADO MÓVILES) ====================
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
    
    // Clonación para limpiar listeners viejos de eventos previos
    const cerrarSpan = modalMensaje.querySelector('.cerrar-modal');
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);
    
    const cerrarFn = () => {
        modalMensaje.classList.add('hidden');
        if (onCerrar) onCerrar();
    };
    
    // Uso controlado de 'click' en los botones del modal para asegurar la sincronía 
    // al destruir/ocultar nodos dinámicamente en navegadores móviles
    nuevoBtn.addEventListener('click', cerrarFn);
    
    if (cerrarSpan) {
        const nuevoSpan = cerrarSpan.cloneNode(true);
        cerrarSpan.parentNode.replaceChild(nuevoSpan, cerrarSpan);
        nuevoSpan.addEventListener('click', cerrarFn);
    }
    
    modalMensaje.classList.remove('hidden');
}