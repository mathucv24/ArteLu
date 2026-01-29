document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modalOverlay = document.getElementById("modal-overlay");
    const btnAgendarClase = document.getElementById("btn-agendar-clase");

    // Abrir modal
    openModalBtn.addEventListener("click", () => {
        console.log("hola");
        modal.classList.remove("hidden");
        modal.classList.add('flex');
    });

    // Cerrar con el botón X
    closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.classList.remove('flex');
    });

    // Cerrar clickeando fuera
    modalOverlay.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    function enviarWhatsApp() {
       
        const numeroTelefono = "584241690591";

        const nombre = document.getElementById('nombre').value;
        const telefono = document.getElementById('telefono').value;
        const correo = document.getElementById('correo').value;
        const disciplina = document.getElementById('disciplina').value;


        if (nombre === "" || telefono === "") {
            alert("Por favor, ingresa al menos tu nombre y número de teléfono.");
            return; 
        }

        
        const mensaje = `Hola ArteLu %0A` + ` ¡Quiero agendar mi clase de prueba! 🤸‍♀️✨%0A%0A` +
            `*Mis datos son:*%0A` +
            `👤 *Nombre:* ${nombre}%0A` +
            `📱 *Teléfono:* ${telefono}%0A` +
            `✉️ *Correo:* ${correo}%0A` +
            `💪🏾 *Disciplina de interés:* ${disciplina}%0A%0A` +
            `Quedo atento/a a su respuesta.`;

       
        const url = `https://wa.me/${numeroTelefono}?text=${mensaje}`;

       
        window.open(url, '_blank');
    }
    
    btnAgendarClase.addEventListener('click', enviarWhatsApp);
});
