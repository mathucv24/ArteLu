const modalClase = document.getElementById('modal-clase');

window.abrirModalClase = (id) => {
    const clase = window.datosClases.find(c => c._id === id);
    if (!clase) return;

    document.getElementById('modal-titulo').innerText = clase.nombre;
    document.getElementById('modal-descripcion').innerText = clase.descripcion || "Sin descripción disponible.";
    document.getElementById('modal-precio').innerText = clase.precioMensual ? `$${clase.precioMensual}` : "Consultar";

    const listaHorarios = document.getElementById('modal-lista-horarios');
    listaHorarios.innerHTML = '';

    if (clase.horarios && clase.horarios.length > 0) {
        clase.horarios.forEach(h => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm";

            li.innerHTML = `
                <div class="flex flex-col">
                    <span class="font-bold text-gray-800 dark:text-gray-200 text-sm">${h.dia}</span>
                    <span class="text-[10px] text-green-600 font-semibold">${h.cuposDisponibles} cupos libres</span>
                </div>
                <div class="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    ${h.horaInicio} - ${h.horaFin}
                </div>
            `;
            listaHorarios.appendChild(li);
        });
    } else {
        listaHorarios.innerHTML = `
            <li class="p-3 text-center text-gray-400 text-sm italic">
                No hay horarios registrados.
            </li>`;
    }

    const imgGrande = document.getElementById('modal-img-grande');
    const contenedorMini = document.getElementById('modal-miniaturas');
    contenedorMini.innerHTML = '';

    if (clase.imagenes && clase.imagenes.length > 0) {
        const principal = clase.imagenes.find(img => img.esPrincipal) || clase.imagenes[0];
        imgGrande.src = principal.url;

        clase.imagenes.forEach(img => {
            const mini = document.createElement('img');
            mini.src = img.url;
            mini.className = "w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-primary transition-all";
            mini.onclick = () => { imgGrande.src = img.url; };
            contenedorMini.appendChild(mini);
        });
    } else {
        imgGrande.src = '/assets/placeholder.png'; 
    }

    modalClase.classList.remove('hidden');
};

window.cerrarModalClase = () => {
    modalClase.classList.add('hidden');
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalClase.classList.contains('hidden')) {
        cerrarModalClase();
    }
});