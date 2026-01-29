let listaDisciplinas = [];
let listaPagosUsuario = [];
let listaDocentes = [];
let pagoIdSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {

    window.cambiarTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${tabName}`).classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        });

        const activeBtn = document.getElementById(`tab-${tabName}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white', 'text-gray-600');
            activeBtn.classList.add('bg-primary', 'text-white');
        }

        if (tabName === 'disciplinas') cargarDisciplinas();
        if (tabName === 'usuarios') cargarUsuarios();
        if (tabName === 'pagos') cargarPagos();
        if (tabName === 'equipo') cargarListaEquipo();
    };

    agregarFilaHorario('contenedor-horarios-crear');

    const formCrear = document.getElementById("crear-disciplina-form");
    if (formCrear) {
        formCrear.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append('nombre', event.target.nombre.value);
            formData.append('precioMensual', event.target.precioMensual.value);
            formData.append('descripcion', event.target.descripcion.value);
            formData.append('activa', event.target.activa.checked);

            const horarios = obtenerHorariosDelFormulario('contenedor-horarios-crear');
            formData.append('horarios', JSON.stringify(horarios));

            const inputFotos = document.getElementById('input-fotos');
            if (inputFotos.files.length > 0) {
                for (let i = 0; i < inputFotos.files.length; i++) {
                    formData.append('fotos', inputFotos.files[i]);
                }
            }

            try {
                const response = await fetch("/api/crear-disciplina", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta(false, "Disciplina creada con éxito.");
                    formCrear.reset();
                    document.getElementById('contenedor-horarios-crear').innerHTML = '';
                    agregarFilaHorario('contenedor-horarios-crear');
                    cargarDisciplinas();
                } else {
                    mostrarAlerta(true, "Error: " + data.mensaje);
                }
            } catch (error) {
                console.error(error);
                mostrarAlerta(true, "Error de conexión");
            }
        });
    }

    const formEditar = document.getElementById('form-editar-disciplina');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-id').value;
            const nombre = document.getElementById('edit-nombre').value;
            const precioMensual = document.getElementById('edit-precio').value;
            const descripcion = document.getElementById('edit-descripcion').value;
            const activa = document.getElementById('edit-activa').checked;

            const horarios = obtenerHorariosDelFormulario('contenedor-horarios-editar');

            try {
                const res = await fetch('/api/actualizar-disciplina', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, nombre, precioMensual, descripcion, activa, horarios })
                });

                if (res.ok) {
                    mostrarAlerta(false, "Actualizado con éxito");
                    window.cerrarModal();
                    cargarDisciplinas();
                } else {
                    const data = await res.json();
                    mostrarAlerta(true, "Error: " + data.mensaje);
                }
            } catch (error) {
                console.error(error);
                mostrarAlerta(true, "Error de conexión");
            }
        });
    }

    cargarDisciplinas();

    const formEquipo = document.getElementById("crear-equipo-form");
    if (formEquipo) {
        formEquipo.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('nombre', e.target.nombre.value);
            formData.append('cargo', e.target.cargo.value);
            formData.append('descripcion', e.target.descripcion.value);

            const inputFoto = document.getElementById('input-foto-equipo');
            if (inputFoto && inputFoto.files[0]) {
                formData.append('imagen', inputFoto.files[0]);
            }

            try {
                const response = await fetch("/api/team/crear-miembro", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    mostrarAlerta(false, "Miembro agregado con éxito.");
                    formEquipo.reset();
                    cargarListaEquipo();
                } else {
                    mostrarAlerta(true, "Error al guardar.");
                }
            } catch (error) {
                mostrarAlerta(true, "Error de conexión.");
            }
        });
    }
});

window.agregarFilaHorario = (contenedorId, datos = null) => {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const dia = datos ? datos.dia : 'Lunes';
    const inicio = datos ? datos.horaInicio : '';
    const fin = datos ? datos.horaFin : '';
    const cupos = datos ? datos.cuposDisponibles : 15;

    const div = document.createElement('div');
    div.className = "flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200 fila-horario";

    div.innerHTML = `
        <select class="input-dia text-xs border rounded p-1 w-1/4">
            <option value="Lunes" ${dia === 'Lunes' ? 'selected' : ''}>Lun</option>
            <option value="Martes" ${dia === 'Martes' ? 'selected' : ''}>Mar</option>
            <option value="Miércoles" ${dia === 'Miércoles' ? 'selected' : ''}>Mié</option>
            <option value="Jueves" ${dia === 'Jueves' ? 'selected' : ''}>Jue</option>
            <option value="Viernes" ${dia === 'Viernes' ? 'selected' : ''}>Vie</option>
            <option value="Sábado" ${dia === 'Sábado' ? 'selected' : ''}>Sáb</option>
            <option value="Domingo" ${dia === 'Domingo' ? 'selected' : ''}>Dom</option>
        </select>
        <input type="time" class="input-inicio text-xs border rounded p-1 w-1/4" value="${inicio}" required>
        <span class="text-gray-400">-</span>
        <input type="time" class="input-fin text-xs border rounded p-1 w-1/4" value="${fin}" required>
        <input type="number" class="input-cupos text-xs border rounded p-1 w-16" value="${cupos}" placeholder="Cupos" min="1">
        
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700 ml-1">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

    contenedor.appendChild(div);
};

function obtenerHorariosDelFormulario(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    const filas = contenedor.querySelectorAll('.fila-horario');
    const horarios = [];

    filas.forEach(fila => {
        const dia = fila.querySelector('.input-dia').value;
        const horaInicio = fila.querySelector('.input-inicio').value;
        const horaFin = fila.querySelector('.input-fin').value;
        const cuposDisponibles = fila.querySelector('.input-cupos').value;

        if (horaInicio && horaFin) {
            horarios.push({ dia, horaInicio, horaFin, cuposDisponibles: Number(cuposDisponibles) });
        }
    });

    return horarios;
}

async function cargarDisciplinas() {
    const tbody = document.getElementById('tabla-disciplinas-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';

    try {
        const res = await fetch('/api/ver-disciplinas');
        const data = await res.json();
        listaDisciplinas = data.disciplinas || [];

        tbody.innerHTML = '';
        if (listaDisciplinas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No hay disciplinas registradas.</td></tr>';
            return;
        }

        listaDisciplinas.forEach(d => {
            const horariosHtml = d.horarios && d.horarios.length > 0
                ? d.horarios.map(h => `
                    <div class="text-xs mb-1">
                        <span class="font-bold text-gray-700">${h.dia.substring(0, 3)}:</span> 
                        ${h.horaInicio}-${h.horaFin} 
                        <span class="text-gray-400 text-[10px]">(${h.cuposDisponibles} cupos)</span>
                    </div>`).join('')
                : `<span class="text-gray-400 text-xs italic">Sin horarios</span>`;

            const estadoBadge = d.activa
                ? `<span class="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Activa</span>`
                : `<span class="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">Inactiva</span>`;

            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50 align-top">
                    <td class="px-4 py-3">
                        <div class="font-medium text-gray-900">${d.nombre}</div>
                        <div class="text-xs text-gray-500 line-clamp-1">${d.descripcion || ''}</div>
                        <div class="mt-1 font-mono text-xs font-bold text-primary">$${d.precioMensual || 0}</div>
                    </td>
                    <td class="px-4 py-3">${horariosHtml}</td>
                    <td class="px-4 py-3 text-center">${estadoBadge}</td>
                    <td class="px-4 py-3 text-center space-x-2">
                        <button onclick="abrirModalEditar('${d._id}')" class="text-blue-600 hover:text-blue-900">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="eliminarDis('${d._id}')" class="text-red-600 hover:text-red-900">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error al conectar con el servidor</td></tr>';
    }
}

window.eliminarDis = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta disciplina?")) return;

    try {
        const res = await fetch(`/api/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (res.ok) {
            mostrarAlerta(false, "Disciplina eliminada");
            cargarDisciplinas();
        } else {
            mostrarAlerta(true, "Error: " + data.mensaje);
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta(true, "Error de conexión al eliminar");
    }
};

window.abrirModalEditar = (id) => {
    const disciplina = listaDisciplinas.find(d => d._id === id);
    if (!disciplina) return;

    document.getElementById('edit-id').value = disciplina._id;
    document.getElementById('edit-nombre').value = disciplina.nombre;
    document.getElementById('edit-precio').value = disciplina.precioMensual || '';
    document.getElementById('edit-descripcion').value = disciplina.descripcion || '';
    document.getElementById('edit-activa').checked = disciplina.activa;

    const contenedorHorarios = document.getElementById('contenedor-horarios-editar');
    contenedorHorarios.innerHTML = '';

    if (disciplina.horarios && disciplina.horarios.length > 0) {
        disciplina.horarios.forEach(h => {
            agregarFilaHorario('contenedor-horarios-editar', h);
        });
    } else {
        agregarFilaHorario('contenedor-horarios-editar');
    }

    const modal = document.getElementById('modal-editar');
    if (modal) modal.classList.remove('hidden');
};

window.cerrarModal = () => {
    const modal = document.getElementById('modal-editar');
    if (modal) modal.classList.add('hidden');
};

document.addEventListener("DOMContentLoaded", () => {
    const formEquipo = document.getElementById("crear-equipo-form");

    if (formEquipo) {
        formEquipo.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('nombre', e.target.nombre.value);
            formData.append('cargo', e.target.nombre.value);
            formData.append('descripcion', e.target.descripcion.value);

            const inputFoto = document.getElementById('input-foto-equipo');
            if (inputFoto.files[0]) {
                formData.append('imagen', inputFoto.files[0]);
            }

            try {
                const response = await fetch("/api/team/crear-miembro", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    mostrarAlerta(false, "Miembro del equipo agregado con éxito.");
                    formEquipo.reset();
                    cargarListaEquipo();
                } else {
                    mostrarAlerta(true, "Error: " + data.mensaje);
                }
            } catch (error) {
                mostrarAlerta(true, "Error de conexión con el servidor.");
            }
        });
    }
});

async function cargarListaEquipo() {
    const contenedor = document.getElementById('lista-equipo');
    if (!contenedor) return;

    try {
        const res = await fetch('/api/team/ver-team');
        listaDocentes = await res.json(); 

        if (!listaDocentes || listaDocentes.length === 0) {
            contenedor.innerHTML = '<p class="text-gray-500 text-center py-4">No hay docentes registrados.</p>';
            return;
        }

        contenedor.innerHTML = listaDocentes.map(m => `
            <div class="flex items-center justify-between p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <img src="${m.imagenes?.url || '/assets/placeholder-user.png'}" 
                         class="w-16 h-16 rounded-full object-cover border-2 border-accent">
                    <div>
                        <p class="font-bold text-primary dark:text-accent text-lg">${m.nombre}</p>
                        <p class="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">${m.cargo}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="abrirModalEditarEquipo('${m._id}')" 
                            class="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="eliminarDocente('${m._id}')" 
                            class="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-red-500 text-center">Error de conexión.</p>';
    }
}

window.abrirModalEditarEquipo = (id) => {
    const docente = listaDocentes.find(d => d._id === id);
    if (!docente) return;

    document.getElementById('edit-team-id').value = docente._id;
    document.getElementById('edit-team-nombre').value = docente.nombre;
    document.getElementById('edit-team-cargo').value = docente.cargo;
    document.getElementById('edit-team-descripcion').value = docente.descripcion;
    
    document.getElementById('edit-team-imagen').value = ""; 

    document.getElementById('modal-editar-equipo').classList.remove('hidden');
};

const formEditarEquipo = document.getElementById('form-editar-equipo');
if (formEditarEquipo) {
    formEditarEquipo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('id', document.getElementById('edit-team-id').value);
        formData.append('nombre', document.getElementById('edit-team-nombre').value);
        formData.append('cargo', document.getElementById('edit-team-cargo').value);
        formData.append('descripcion', document.getElementById('edit-team-descripcion').value);

        const imagenInput = document.getElementById('edit-team-imagen');
        if (imagenInput.files[0]) {
            formData.append('imagen', imagenInput.files[0]);
        }

        try {
            const res = await fetch('/api/team/actualizar-miembro', {
                method: 'PUT',
                body: formData 
            });

            if (res.ok) {
                mostrarAlerta(false, "Docente actualizado correctamente");
                document.getElementById('modal-editar-equipo').classList.add('hidden');
                cargarListaEquipo(); 
            } else {
                const data = await res.json();
                mostrarAlerta(true, "Error: " + data.mensaje);
            }
        } catch (error) {
            mostrarAlerta(true, "Error de conexión al actualizar");
        }
    });
}

window.eliminarDocente = async (id) => {
    if (!confirm("¿Estás seguro de eliminar a este miembro del equipo?")) return;

    try {
        const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });

        if (res.ok) {
            mostrarAlerta(false, "Docente eliminado correctamente.");
            cargarListaEquipo();
        } else {
            const data = await res.json();
            mostrarAlerta(true, "Error: " + data.mensaje);
        }
    } catch (error) {
        mostrarAlerta(true, "Error de conexión al eliminar.");
    }
};

async function cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/sesion/todos-los-usuarios');
        const usuarios = await res.json();

        tbody.innerHTML = '';
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay usuarios.</td></tr>';
            return;
        }

        usuarios.forEach(u => {
            const isActivo = u.activo !== undefined ? u.activo : true;
            const estadoHtml = isActivo
                ? `<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Activo</span>`
                : `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Inactivo</span>`;

            const btnEstadoClass = isActivo ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700';
            const btnEstadoIcon = isActivo ? 'fa-user-slash' : 'fa-user-check';
            const btnEstadoTitle = isActivo ? 'Desactivar Usuario' : 'Reactivar Usuario';

            const infoExtra = u.rol_user ?
                `<span class="text-xs text-secondary font-semibold">Alumno: ${u.alumno}</span>` :
                `<span class="text-xs text-gray-400">Solo Titular</span>`;

            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50 transition ${!isActivo ? 'bg-gray-100 opacity-75' : ''}">
                    <td class="px-4 py-3 font-medium text-primary">${u.nombre}</td>
                    <td class="px-4 py-3 text-sm">${u.email}<br><span class="text-gray-500 text-xs">${u.telefono}</span></td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded text-xs bg-blue-100">${u.rol}</span></td>
                    <td class="px-4 py-3">${infoExtra}</td>
                    <td class="px-4 py-3">${estadoHtml}</td>
                    <td class="px-4 py-3 flex gap-3">
                        <button onclick="verDetalleUsuario('${u._id}')" class="text-secondary hover:text-primary text-lg" title="Ver Perfil y Pagos">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        
                        <button onclick="toggleEstadoUsuario('${u._id}', ${isActivo})" class="${btnEstadoClass} text-lg" title="${btnEstadoTitle}">
                            <i class="fa-solid ${btnEstadoIcon}"></i>
                        </button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error al cargar usuarios</td></tr>';
    }
}

window.toggleEstadoUsuario = async (id, estadoActual) => {
    const accion = estadoActual ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de que deseas ${accion} a este usuario?`)) return;

    try {
        const res = await fetch(`/api/sesion/cambiar-estado/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: !estadoActual })
        });

        if (res.ok) {
            mostrarAlerta(false, `Usuario ${accion}do exitosamente`);
            cargarUsuarios();
        } else {
            mostrarAlerta(true, "Error al cambiar estado");
        }
    } catch (error) {
        mostrarAlerta(true, "Error de conexión");
    }
};


window.verDetalleUsuario = async (id) => {
    const modal = document.getElementById('modal-usuario-detalle');
    modal.classList.remove('hidden');

    try {

        const res = await fetch(`/api/sesion/usuario-detalle/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.msg);

        const { usuario, pagos } = data;

        document.getElementById('modal-nombre').textContent = usuario.nombre;
        document.getElementById('modal-contacto').innerHTML = `${usuario.email} <br> ${usuario.telefono}`;
        document.getElementById('modal-nacimiento').textContent = usuario.fecha_nacimiento_ppal ? new Date(usuario.fecha_nacimiento_ppal).toLocaleDateString() : 'N/A';
        document.getElementById('modal-lesiones').textContent = usuario.lesiones || 'Ninguna registrada';

        const divAlumno = document.getElementById('modal-seccion-alumno');
        if (usuario.rol_user) {
            divAlumno.classList.remove('hidden');
            document.getElementById('modal-alumno-nombre').textContent = usuario.alumno;
            document.getElementById('modal-alumno-edad').textContent = usuario.edad + ' años';
            document.getElementById('modal-alumno-nac').textContent = usuario.fecha_nacimiento_alumno ? new Date(usuario.fecha_nacimiento_alumno).toLocaleDateString() : 'N/A';
        } else {
            divAlumno.classList.add('hidden');
        }

        renderizarCalendario(pagos);

        renderizarTablaPagosMini(pagos);

    } catch (error) {
        console.error(error);
        alert("Error al cargar detalles del usuario");
        modal.classList.add('hidden');
    }
};

window.cerrarModalUsuario = () => {
    document.getElementById('modal-usuario-detalle').classList.add('hidden');
};

function renderizarCalendario(pagos) {
    const grid = document.getElementById('modal-calendario-grid');
    grid.innerHTML = '';

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();

    meses.forEach((mes, index) => {
        const pagosDelMes = pagos.filter(p => {
            let mesPago, anioPago;

            if (p.mesCorrespondiente !== undefined && p.mesCorrespondiente !== null) {
                mesPago = p.mesCorrespondiente;
                anioPago = p.anioCorrespondiente || currentYear;
            } else {
                const d = new Date(p.createdAt);
                mesPago = d.getMonth();
                anioPago = d.getFullYear();
            }

            return mesPago === index && anioPago === currentYear;
        });

        let estado = 'sin_pago';
        if (pagosDelMes.some(p => p.estado === 'aprobado')) estado = 'aprobado';
        else if (pagosDelMes.some(p => p.estado === 'pendiente')) estado = 'pendiente';
        else if (pagosDelMes.some(p => p.estado === 'rechazado')) estado = 'rechazado';

        let colorClass = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
        let iconClass = "";
        let textStatus = "Sin pago";

        if (estado === 'aprobado') {
            colorClass = "bg-green-100 border-green-500 text-green-700 shadow-sm";
            iconClass = "fa-check-circle";
            textStatus = "Pagado";
        } else if (estado === 'pendiente') {
            colorClass = "bg-yellow-100 border-yellow-500 text-yellow-700 shadow-sm";
            iconClass = "fa-clock";
            textStatus = "Pendiente";
        } else if (estado === 'rechazado') {
            colorClass = "bg-red-100 border-red-500 text-red-700 shadow-sm";
            iconClass = "fa-times-circle";
            textStatus = "Rechazado";
        }

        const html = `
            <div class="flex flex-col items-center justify-center p-3 rounded-lg border ${colorClass}">
                <span class="text-xs font-bold uppercase tracking-wider mb-1">${mes}</span>
                ${estado !== 'sin_pago'
                ? `<i class="fa-solid ${iconClass} text-xl mb-1"></i><span class="text-[10px] font-semibold">${textStatus}</span>`
                : `<span class="text-2xl font-bold text-gray-300">-</span>`
            }
            </div>
        `;
        grid.innerHTML += html;
    });
}

function renderizarTablaPagosMini(pagos) {
    const lista = document.getElementById('modal-lista-pagos');
    lista.innerHTML = '';

    const ultimos = pagos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (ultimos.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-xs">Sin pagos registrados</td></tr>';
        return;
    }

    ultimos.forEach(p => {
        let colorEstado = p.estado === 'aprobado' ? 'text-green-600' : (p.estado === 'pendiente' ? 'text-yellow-600' : 'text-red-600');

        lista.innerHTML += `
            <tr class="border-b">
                <td class="px-3 py-2 text-xs">${new Date(p.createdAt).toLocaleDateString()}</td>
                <td class="px-3 py-2 text-xs">${p.disciplina.substring(0, 15)}...</td>
                <td class="px-3 py-2 text-xs font-mono">${p.referencia || '-'}</td>
                <td class="px-3 py-2 text-xs font-bold ${colorEstado}">${p.estado}</td>
            </tr>
        `;
    });
}

async function cargarPagos() {
    const tbody = document.getElementById('tabla-pagos-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando...</td></tr>';

    try {
        const res = await fetch('/api/pagos?estado=pendiente');
        const pagos = await res.json();

        if (!pagos || pagos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay pagos pendientes de revisión.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pagos.forEach(p => {
            tbody.innerHTML += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium">${p.usuario_nombre || 'Usuario'}</td>
                    <td class="px-4 py-3">${p.disciplina}<br><span class="text-xs text-gray-500">${p.frecuencia}</span></td>
                    <td class="px-4 py-3">
                        Ref: ${p.referencia}<br>
                        <span class="font-bold text-green-600">$${p.monto}</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <a href="${p.comprobante_url}" target="_blank" class="text-blue-600 underline text-xs">
                            <i class="fa-solid fa-paperclip"></i> Ver Archivo
                        </a>
                    </td>
                    <td class="px-4 py-3 text-center space-x-2">
                        <button onclick="actualizarEstadoPago('${p._id}', 'aprobado')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                            Aprobar
                        </button>
                        <button onclick="actualizarEstadoPago('${p._id}', 'rechazado')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                            Rechazar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-400">Funcionalidad de pagos en desarrollo</td></tr>';
    }
}

window.actualizarEstadoPago = async (id, nuevoEstado) => {
    if (nuevoEstado === 'rechazado') {
        if (!confirm(`¿Estás seguro de rechazar este pago?`)) return;
        enviarActualizacionPago(id, 'rechazado');
        return;
    }

    if (nuevoEstado === 'aprobado') {
        pagoIdSeleccionado = id;
        
        const hoy = new Date();
        document.getElementById('select-mes-pago').value = hoy.getMonth();
        document.getElementById('input-anio-pago').value = hoy.getFullYear();
        document.getElementById('modal-aprobar-pago').classList.remove('hidden');
    }
};

const formAprobar = document.getElementById('form-aprobar-pago');
if (formAprobar) {
    formAprobar.addEventListener('submit', (e) => {
        e.preventDefault();
        const mes = document.getElementById('select-mes-pago').value;
        const anio = document.getElementById('input-anio-pago').value;
        
        enviarActualizacionPago(pagoIdSeleccionado, 'aprobado', mes, anio);
        
        document.getElementById('modal-aprobar-pago').classList.add('hidden');
    });
}

async function enviarActualizacionPago(id, estado, mes = null, anio = null) {
    try {
        const bodyData = { estado };
        
        if (mes !== null && anio !== null) {
            bodyData.mesCorrespondiente = Number(mes);
            bodyData.anioCorrespondiente = Number(anio);
        }

        const res = await fetch(`/api/pagos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (res.ok) {
            mostrarAlerta(false, `Pago ${estado} correctamente`);
            cargarPagos(); 
            
            const modalUsuario = document.getElementById('modal-usuario-detalle');
            if (!modalUsuario.classList.contains('hidden')) {
               document.getElementById('modal-usuario-detalle').classList.add('hidden');
            }
        } else {
            mostrarAlerta(true, 'Error al actualizar estado');
        }
    } catch (error) {
        mostrarAlerta(true, 'Error de conexión');
    }
}
