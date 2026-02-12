document.addEventListener('DOMContentLoaded', () => {
    cargarActividadesHome();
    
    const formWa = document.getElementById('form-whatsapp-inscripcion');
    if(formWa){
        formWa.addEventListener('submit', (e) => {
            e.preventDefault();
            enviarInscripcionWhatsApp();
        });
    }
});

let actividadesCache = [];

async function cargarActividadesHome() {
    const contenedor = document.getElementById('grid-actividades-home');
    if(!contenedor) return;

    try {
        const res = await fetch('/api/ver-actividades');
        actividadesCache = await res.json();

        if(actividadesCache.length === 0){
            contenedor.innerHTML = `
                <div class="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p class="text-xl text-gray-500 font-medium">Pronto anunciaremos nuevas actividades.</p>
                    <p class="text-sm text-gray-400">¡Mantente atento a nuestras redes!</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = actividadesCache.map(act => `
            <div onclick="abrirModalActividad('${act._id}')" class="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-80 border border-gray-100 dark:border-gray-700">
                <img src="${act.imagen?.url || '/assets/placeholder.jpg'}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                
                <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex flex-col justify-end p-6">
                    <span class="bg-white text-primary text-xs font-bold px-2 py-1 rounded w-fit mb-2 uppercase tracking-wide shadow-sm">
                        ${act.tipo}
                    </span>
                    <h4 class="text-white text-2xl font-bold mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 leading-tight">
                        ${act.titulo}
                    </h4>
                    <p class="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75">
                        <i class="fa-regular fa-calendar"></i> ${new Date(act.fecha).toLocaleDateString()}
                        <span class="mx-2">|</span>
                        <span class="font-bold text-accent">$${act.precio}</span>
                    </p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error cargando actividades", error);
    }
}

window.abrirModalActividad = (id) => {
    const act = actividadesCache.find(a => a._id === id);
    if(!act) return;

    document.getElementById('modal-act-img').src = act.imagen?.url || '/assets/placeholder.jpg';
    document.getElementById('modal-act-tipo').textContent = act.tipo;
    document.getElementById('modal-act-titulo').textContent = act.titulo;
    document.getElementById('modal-act-fecha').textContent = new Date(act.fecha).toLocaleDateString();
    document.getElementById('modal-act-hora').textContent = act.hora || 'Por definir';
    document.getElementById('modal-act-desc').textContent = act.descripcion;
    document.getElementById('modal-act-precio').textContent = act.precio > 0 ? `$${act.precio}` : 'GRATIS';

    const btnInscribir = document.getElementById('btn-inscribirme-inicio');
    btnInscribir.onclick = () => abrirFormularioInscripcion(act);

    document.getElementById('modal-actividad-detalle').classList.remove('hidden');
};

window.cerrarModalActividad = () => {
    document.getElementById('modal-actividad-detalle').classList.add('hidden');
};

function abrirFormularioInscripcion(actividad) {
    document.getElementById('modal-actividad-detalle').classList.add('hidden');
    document.getElementById('wa-actividad-titulo').value = actividad.titulo;
    document.getElementById('modal-inscripcion-whatsapp').classList.remove('hidden');
}

function enviarInscripcionWhatsApp() {
    const actividad = document.getElementById('wa-actividad-titulo').value;
    const nombre = document.getElementById('wa-nombre').value;
    const cedula = document.getElementById('wa-cedula').value;
    const telefono = document.getElementById('wa-telefono').value;
    const correo = document.getElementById('wa-correo').value;

    const mensaje = `Hola Academia ArteLu! ✈️\n\nQuisiera inscribirme en la actividad: *${actividad}*.\n\nMis datos son:\n👤 Nombre: ${nombre}\n🆔 Cédula: ${cedula}\n📱 Teléfono: ${telefono}\n📧 Correo: ${correo}\n\nQuedo atento a la información de pago. Gracias!`;

    const numeroAcademia = "584241690591"; 

    const url = `https://wa.me/${numeroAcademia}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
    document.getElementById('modal-inscripcion-whatsapp').classList.add('hidden');
    document.getElementById('form-whatsapp-inscripcion').reset();
}