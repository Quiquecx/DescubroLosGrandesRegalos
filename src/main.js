/**
 * ARCHIVO: main.js
 * CONTROLADOR PRINCIPAL DEL JUEGO: "Descubro los grandes regalos"
 * 
 * Funcionalidades:
 * - Gestión de vistas (pantalla inicio, escenario)
 * - Escala responsiva (1024x768)
 * - Sistema de audio global
 * - Puntaje global acumulativo
 * - Integración secuencial: Nivel 1 -> Nivel 2 -> (Nivel 3)
 * - Reintento si falla un nivel
 */

// Importar módulos de niveles
import { iniciarNivel1 } from './bloques/nivel1.js';
import { iniciarNivel2 } from './bloques/nivel2.js';
// import { iniciarNivel3 } from './bloques/nivel3.js'; // para después

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
    nivelEnCurso: null,       // instancia del nivel actual (para limpiar)
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
    
    // Crear escenario si no existe
    if (!escenarioJuego) {
        escenarioJuego = document.createElement('div');
        escenarioJuego.id = 'escenario-juego';
        escenarioJuego.className = 'pantalla';
        document.getElementById('app').appendChild(escenarioJuego);
    }
    
    // Mostrador de puntaje global
    if (!document.getElementById('puntaje-global')) {
        const puntajeDiv = document.createElement('div');
        puntajeDiv.id = 'puntaje-global';
        puntajeDiv.style.position = 'absolute';
        puntajeDiv.style.top = '10px';
        puntajeDiv.style.right = '20px';
        puntajeDiv.style.background = 'rgba(0,0,0,0.6)';
        puntajeDiv.style.color = 'gold';
        puntajeDiv.style.padding = '5px 12px';
        puntajeDiv.style.borderRadius = '30px';
        puntajeDiv.style.fontWeight = 'bold';
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
    
    // Habilitar audio tras primera interacción
    document.body.addEventListener('click', habilitarAudioGlobal, { once: true });
});

// ==================== ESCALA RESPONSIVA ====================
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

// ==================== PRECARGA ====================
function precargarImagenes() {
    const imagenes = [
        'src/img/regalos/Papa Dios.png',
        'src/img/regalos/Flor.png',
        'src/img/n1/Fondo Portadilla L1B1.png',
        'src/images/n2/ana/Ana_silueta.png',
        'src/images/n2/santi/Santi_silueta.png',
        'src/imgs/intro/portada.png',
        'src/imgs/intro/Titulos-01.png'
    ];
    imagenes.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ==================== AUDIO ====================
function habilitarAudioGlobal() {
    if (estadoGlobal.audioPermitido) return;
    estadoGlobal.audioPermitido = true;
    MUSICA_FONDO.play().catch(e => console.log('Música de fondo:', e));
    const bienvenida = new Audio('src/audio/narraciones/inicio_bienvenida.mp3');
    bienvenida.play().catch(e => console.log('Narración:', e));
}

function reproducirSonido(tipo) {
    if (!estadoGlobal.audioPermitido) return;
    let sonido;
    if (tipo === 'acierto') sonido = SONIDO_ACIERTO;
    else if (tipo === 'error') sonido = SONIDO_ERROR;
    else if (tipo === 'exito') sonido = SONIDO_EXITO_NIVEL;
    if (sonido) {
        sonido.currentTime = 0;
        sonido.play().catch(e => console.log('Error sonido:', e));
    }
}

function actualizarPuntajeGlobal(puntos) {
    estadoGlobal.puntajeTotal += puntos;
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.innerText = `⭐ PUNTOS: ${estadoGlobal.puntajeTotal}`;
    }
}

// ==================== CAMBIO DE PANTALLAS ====================
function mostrarPantalla(idPantalla) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('visible'));
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) pantalla.classList.add('visible');
    estadoGlobal.pantallaActual = idPantalla;
    if (spanPuntajeGlobal) {
        spanPuntajeGlobal.style.display = idPantalla === 'escenario-juego' ? 'block' : 'none';
    }
}

// ==================== MANEJADORES DE EVENTOS UI ====================
function configurarManejadoresEventos() {
    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            estadoGlobal.nivelActual = 1;
            estadoGlobal.puntajeTotal = 0;
            actualizarPuntajeGlobal(0);
            iniciarNivelActual();
        });
    }
    
    const btnComoJugar = document.getElementById('btn-como-jugar');
    if (btnComoJugar && modalComoJugar) {
        btnComoJugar.addEventListener('click', () => modalComoJugar.classList.remove('hidden'));
        const cerrar = modalComoJugar.querySelector('.cerrar-modal');
        const btnCerrar = document.getElementById('btn-cerrar-modal');
        if (cerrar) cerrar.addEventListener('click', () => modalComoJugar.classList.add('hidden'));
        if (btnCerrar) btnCerrar.addEventListener('click', () => modalComoJugar.classList.add('hidden'));
        window.addEventListener('click', (e) => {
            if (e.target === modalComoJugar) modalComoJugar.classList.add('hidden');
        });
    }
}

// ==================== LANZAR NIVEL SEGÚN estadoGlobal.nivelActual ====================
async function iniciarNivelActual() {
    // Limpiar nivel anterior si existe
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
                // Si hay siguiente nivel (2 o 3), avanzar; si no, finalizar juego
                if (estadoGlobal.nivelActual < 3) {
                    mostrarModalMensaje(
                        `🎉 ¡Felicidades! Pasaste al nivel ${estadoGlobal.nivelActual + 1} 🎉`,
                        () => {
                            estadoGlobal.nivelActual++;
                            iniciarNivelActual();
                        },
                        'Siguiente nivel'
                    );
                } else {
                    // Completado todos los niveles
                    mostrarModalMensaje(
                        `🎉 ¡ENHORABUENA! Completaste todos los niveles.\n⭐ Puntaje total: ${estadoGlobal.puntajeTotal} ⭐`,
                        () => {
                            mostrarPantalla('pantalla-inicio');
                            estadoGlobal.nivelActual = 1;
                            estadoGlobal.puntajeTotal = 0;
                            actualizarPuntajeGlobal(0);
                        },
                        'Jugar de nuevo'
                    );
                }
            } else {
                // Falló el nivel: ofrecer reintentar
                mostrarModalMensaje(
                    `😢 No superaste el nivel ${estadoGlobal.nivelActual}. ¿Quieres intentarlo de nuevo?`,
                    () => {
                        iniciarNivelActual(); // reintenta el mismo nivel
                    },
                    'Reintentar'
                );
            }
        },
        mostrarModal: (mensaje, exito) => {
            // Mensajes internos del nivel (opcional)
            mostrarModalMensaje(mensaje, null, exito ? 'Genial' : 'Entendido');
        }
    };
    
    // Ejecutar el nivel correspondiente
    let instancia;
    if (estadoGlobal.nivelActual === 1) {
        instancia = await iniciarNivel1(callbacks);
    } else if (estadoGlobal.nivelActual === 2) {
        instancia = await iniciarNivel2(callbacks);
    } else if (estadoGlobal.nivelActual === 3) {
        // instancia = await iniciarNivel3(callbacks);
        // Por ahora, si no existe nivel3, simulamos éxito
        mostrarModalMensaje('Nivel 3 en construcción. ¡Juego completado!', () => {
            mostrarPantalla('pantalla-inicio');
            estadoGlobal.nivelActual = 1;
        });
        return;
    }
    estadoGlobal.nivelEnCurso = instancia;
}

// ==================== MODAL GENÉRICO ====================
function mostrarModalMensaje(mensaje, onCerrar, textoBoton = 'Continuar') {
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
    const textoP = modalMensaje.querySelector('#modal-mensaje-texto');
    const btn = modalMensaje.querySelector('#modal-mensaje-btn');
    if (textoP) textoP.innerText = mensaje;
    if (btn) btn.innerText = textoBoton;
    
    // Limpiar eventos anteriores y agregar nuevos
    const cerrarSpan = modalMensaje.querySelector('.cerrar-modal');
    const cerrarFn = () => {
        modalMensaje.classList.add('hidden');
        if (onCerrar) onCerrar();
    };
    // Reemplazar para evitar duplicados
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);
    nuevoBtn.addEventListener('click', cerrarFn);
    if (cerrarSpan) {
        const nuevoSpan = cerrarSpan.cloneNode(true);
        cerrarSpan.parentNode.replaceChild(nuevoSpan, cerrarSpan);
        nuevoSpan.addEventListener('click', cerrarFn);
    }
    modalMensaje.classList.remove('hidden');
}