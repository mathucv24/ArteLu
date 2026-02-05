document.addEventListener('DOMContentLoaded', () => {

    window.cambiarTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        const tabSeleccionado = document.getElementById(`view-${tabName}`);
        if(tabSeleccionado) tabSeleccionado.classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white', 'shadow-lg');
            btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100');
        });

        const activeBtn = document.getElementById(`tab-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100');
            activeBtn.classList.add('bg-primary', 'text-white', 'shadow-lg');
        }
    };

    const vistaEstatica = document.getElementById('vista-estatica');
    const formEdicion = document.getElementById('form-actualizar-perfil');
    const btnEditar = document.getElementById('btn-habilitar-edicion');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnTexto = document.getElementById('btn-texto');
    const btnSpinner = document.getElementById('btn-spinner');
    
    const checkRepresentante = document.getElementById('check-representante');
    const seccionAlumno = document.getElementById('seccion-alumno');

    if(checkRepresentante){
        checkRepresentante.addEventListener('change', () => {
            if (checkRepresentante.checked) {
                seccionAlumno.classList.remove('hidden');
            } else {
                seccionAlumno.classList.add('hidden');
            }
        });
    }

    const togglePantallasEdicion = () => {
        vistaEstatica.classList.toggle('hidden');
        formEdicion.classList.toggle('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if(btnEditar) btnEditar.addEventListener('click', togglePantallasEdicion);
    if(btnCancelar) btnCancelar.addEventListener('click', togglePantallasEdicion);

    if(formEdicion){
        formEdicion.addEventListener('submit', async (e) => {
            e.preventDefault();

            btnGuardar.disabled = true;
            btnTexto.innerText = "Guardando...";
            btnSpinner.classList.remove('hidden');

            const esRepresentante = checkRepresentante.checked;

            const data = {
                nombre: document.getElementById('input-nombre').value,
                telefono: document.getElementById('input-telefono').value,
                fecha_nacimiento_ppal: document.getElementById('input-fecha-nacimiento-ppal').value,
                lesiones: document.getElementById('input-lesiones').value,
                rol_user: esRepresentante,
                alumno: esRepresentante ? document.getElementById('input-alumno').value : "",
                fecha_nacimiento_alumno: esRepresentante ? document.getElementById('input-fecha-nacimiento-alumno').value : null,
                edad: esRepresentante ? document.getElementById('input-edad').value : null
            };

            try {
                const res = await fetch('/api/sesion/actualizar-usuario', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    document.getElementById('label-nombre').innerText = data.nombre;
                    document.getElementById('label-telefono').innerText = data.telefono;
                    document.getElementById('label-lesiones').innerText = data.lesiones || 'Ninguna registrada';
                    
                    if(data.fecha_nacimiento_ppal) {
                        document.getElementById('label-fecha-nacimiento-ppal').innerText = data.fecha_nacimiento_ppal;
                    }

                    const vistaAlumno = document.getElementById('vista-datos-alumno');

                    if (data.rol_user) {
                        vistaAlumno.classList.remove('hidden');
                        document.getElementById('label-alumno').innerText = data.alumno;
                        document.getElementById('label-edad').innerText = data.edad;
                        document.getElementById('label-fecha-nacimiento-alumno').innerText = data.fecha_nacimiento_alumno;
                    } else {
                        vistaAlumno.classList.add('hidden');
                    }

                    togglePantallasEdicion();
                    mostrarAlerta(false, "¡Perfil actualizado con éxito!");

                } else {
                    mostrarAlerta(true, "Error al guardar los cambios.");
                }
            } catch (err) {
                console.error("Error al guardar:", err);
                mostrarAlerta(true, "Error de conexión.");
            } finally {
                btnGuardar.disabled = false;
                btnTexto.innerText = "Guardar Cambios";
                btnSpinner.classList.add('hidden');
            }
        });
    }

    const fileInput = document.getElementById('dropzone-file');
    const fileTextContainer = document.querySelector('label[for="dropzone-file"] p'); 
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                fileTextContainer.innerHTML = `<span class="font-semibold text-green-600">Archivo seleccionado:</span> <br> ${fileName}`;
            }
        });
    }

    const contenedorDisciplinas = document.getElementById('contenedor-disciplinas');
    const selectFrecuencia = document.getElementById('select-frecuencia');
    const inputHiddenDisciplinas = document.getElementById('input-disciplinas-seleccionadas');
    const contadorLabel = document.getElementById('contador-seleccion');
    
    let maxSeleccion = 1; 
    let disciplinasData = [];

    async function cargarDisciplinasDinamicas() {
        try {
            const res = await fetch('/api/ver-disciplinas');
            const data = await res.json();
            
            // Solo mostrar disciplinas activas
            disciplinasData = (data.disciplinas || []).filter(d => d.activa);
            renderizarDisciplinas();
        } catch (error) {
            console.error(error);
            contenedorDisciplinas.innerHTML = '<p class="text-red-500 text-xs">Error al cargar disciplinas</p>';
        }
    }

    function renderizarDisciplinas() {
        contenedorDisciplinas.innerHTML = '';
        
        if (disciplinasData.length === 0) {
            contenedorDisciplinas.innerHTML = '<p class="text-gray-500 text-xs">No hay disciplinas disponibles.</p>';
            return;
        }

        disciplinasData.forEach(d => {
            const div = document.createElement('div');
            div.className = "flex items-start gap-2 p-2 border rounded bg-white hover:bg-purple-50 transition-colors";
            
            const horariosTexto = d.horarios.map(h => `${h.dia.substring(0,3)} ${h.horaInicio}`).join(', ');

            div.innerHTML = `
                <input type="checkbox" 
                    id="dis-${d._id}" 
                    value="${d.nombre}" 
                    class="checkbox-disciplina w-4 h-4 text-highlight bg-gray-100 border-gray-300 rounded focus:ring-highlight mt-1">
                <label for="dis-${d._id}" class="text-sm text-gray-700 cursor-pointer w-full select-none">
                    <span class="font-bold block text-primary">${d.nombre}</span>
                    <span class="text-[10px] text-gray-500 block">${horariosTexto}</span>
                </label>
            `;
            contenedorDisciplinas.appendChild(div);
        });

        const checkboxes = document.querySelectorAll('.checkbox-disciplina');
        checkboxes.forEach(chk => {
            chk.addEventListener('change', validarSeleccion);
        });
    }

    if(selectFrecuencia) {
        selectFrecuencia.addEventListener('change', (e) => {
            const texto = e.target.value; 
            const numero = texto.match(/\d+/); 
            maxSeleccion = numero ? parseInt(numero[0]) : 1;

            actualizarTextoLimite();
            validarSeleccion(); 
        });
    }

    function actualizarTextoLimite() {
        if(contadorLabel) {
            contadorLabel.innerText = `(Máximo ${maxSeleccion} ${maxSeleccion === 1 ? 'opción' : 'opciones'})`;
        }
    }

    function validarSeleccion() {
        const checkboxes = document.querySelectorAll('.checkbox-disciplina');
        const marcados = document.querySelectorAll('.checkbox-disciplina:checked');
        
        const nombresSeleccionados = Array.from(marcados).map(c => c.value);
        inputHiddenDisciplinas.value = nombresSeleccionados.join(', ');

        if (marcados.length >= maxSeleccion) {
            checkboxes.forEach(chk => {
                if (!chk.checked) {
                    chk.disabled = true;
                    chk.parentElement.classList.add('opacity-50', 'bg-gray-100');
                }
            });
        } else {
            checkboxes.forEach(chk => {
                chk.disabled = false;
                chk.parentElement.classList.remove('opacity-50', 'bg-gray-100');
            });
        }
    }

    if(contenedorDisciplinas) {
        cargarDisciplinasDinamicas();
        actualizarTextoLimite(); 
    }
});