// ==========================================================
// bloques/nivel3.js - Nivel 3: Toca y Descubre
// ==========================================================

export async function iniciarNivel3(callbacks) {
    const contenedor = document.getElementById('escenario-juego');
    if (!contenedor) return null;

    // Limpieza previa por seguridad
    contenedor.innerHTML = '';

    // 1. Datos de las tarjetas (4 buenas, 4 malas) basado en tus imágenes y documento
    const itemsNivel3 = [
        { id: 'regando', src: 'src/imgs/n3/Niño regando.png', esCorrecto: true, audio: 'src/audio/narraciones/n3_regando.mp3' },
        { id: 'sembrando', src: 'src/imgs/n3/Niños sembrando.png', esCorrecto: true, audio: 'src/audio/narraciones/n3_sembrando.mp3' },
        { id: 'perrito', src: 'src/imgs/n3/Niña con perrito.png', esCorrecto: true, audio: 'src/audio/narraciones/n3_perrito.mp3' },
        { id: 'manos', src: 'src/imgs/n3/Niña-lavandose-las-manos.png', esCorrecto: true, audio: 'src/audio/narraciones/n3_manos.mp3' },
        
        { id: 'pecera', src: 'src/imgs/n3/Niño con pecera.png', esCorrecto: true, audio: 'src/audio/narraciones/n3_error.mp3' },
        { id: 'pateo', src: 'src/imgs/n3/Niña pateo algo.png', esCorrecto: false, audio: 'src/audio/narraciones/n3_error.mp3' },
        { id: 'flores', src: 'src/imgs/n3/Niño arrancando flores.png', esCorrecto: false, audio: 'src/audio/narraciones/n3_error.mp3' },
        { id: 'basura', src: 'src/imgs/n3/Niña con bote y basura .png', esCorrecto: true, audio: 'src/audio/narraciones/n3_error.mp3' }
    ];

    // Mezclar las tarjetas para que no salgan siempre en el mismo orden
    itemsNivel3.sort(() => Math.random() - 0.5);

    let aciertosNecesarios = itemsNivel3.filter(item => item.esCorrecto).length;
    let aciertosActuales = 0;
    let nivelTerminado = false;

    // 2. Crear la estructura visual del nivel (Un título instruccional y la cuadrícula)
    const estructuraHTML = `
        <div class="nivel3-container">
            <div class="instruccion-nivel3">
                <p>🌟 Elige las ilustraciones que ayudan a cuidar la casa en donde todos vivimos 🌟</p>
            </div>
            <div class="grid-nivel3" id="grid-items-n3"></div>
        </div>
    `;
    contenedor.innerHTML = estructuraHTML;

    const grid = document.getElementById('grid-items-n3');

    // 3. Renderizar las tarjetas en la interfaz
    itemsNivel3.forEach(item => {
        const elementoTarjeta = document.createElement('div');
        elementoTarjeta.className = 'tarjeta-n3';
        elementoTarjeta.innerHTML = `
            <div class="wrapper-imagen-n3">
                <img src="${item.src}" alt="Imagen de cuidado ambiental" draggable="false">
            </div>
            <div class="feedback-visual-n3 hidden"></div>
        `;

        // Soporte Touch completo mediante pointerdown
        elementoTarjeta.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            
            // Si ya fue seleccionada o el nivel acabó, ignorar el toque
            if (elementoTarjeta.classList.contains('seleccionada') || nivelTerminado) return;

            elementoTarjeta.classList.add('seleccionada');
            const feedback = elementoTarjeta.querySelector('.feedback-visual-n3');
            feedback.classList.remove('hidden');

            // Reproducir el audio específico si existe en tu estructura
            if (item.audio) {
                const audioInstruccion = new Audio(item.audio);
                audioInstruccion.volume = 0.6;
                audioInstruccion.play().catch(err => console.log("Audio interactivo diferido", err));
            }

            if (item.esCorrecto) {
                // Acción correcta: ¡Estrella de éxito!
                elementoTarjeta.classList.add('correcto');
                feedback.innerHTML = '⭐';
                aciertosActuales++;
                
                callbacks.reproducirSonido('acierto');
                callbacks.sumarPuntos(10); // Otorga 10 puntos por cada acción buena

                // Verificar condición de victoria
                if (aciertosActuales === aciertosNecesarios) {
                    nivelTerminado = true;
                    // Llama al core para activar el delay de 2.5s y desplegar el modal de éxito masivo
                    callbacks.finalizarNivel(true, aciertosActuales * 10);
                }
            } else {
                // Acción incorrecta: Feedback suave sin castigar drásticamente
                elementoTarjeta.classList.add('incorrecto');
                feedback.innerHTML = '❌';
                callbacks.reproducirSonido('error');
            }
        });

        grid.appendChild(elementoTarjeta);
    });

    // 4. Retornar la instancia de limpieza requerida por el estado global de main.js
    return {
        limpiar: () => {
            nivelTerminado = true;
            contenedor.innerHTML = '';
        }
    };
}