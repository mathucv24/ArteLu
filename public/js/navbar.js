const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

themeToggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
});

document.addEventListener('DOMContentLoaded', () => {

    const btnMenuMovil = document.getElementById('btn-menu-movil');
    const menuMovil = document.getElementById('menu-movil');

    const btnIniciarSesion = document.querySelectorAll('.btn-iniciar-sesion');
    const btnCerrarSesion = document.querySelectorAll('.btn-cerrar-sesion');
    

    if (localStorage.getItem('userToken')) {

        btnIniciarSesion.forEach(btn => {
            btn.classList.toggle('hidden');
        });

        btnCerrarSesion.forEach(btn => {
            btn.classList.toggle('hidden');
        });

        
    }

    btnMenuMovil?.addEventListener('click', () => {
        menuMovil.classList.toggle('hidden');
    });

    menuMovil.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => menuMovil.classList.add('hidden'));
    });

    btnCerrarSesion.forEach(btn =>

        btn.addEventListener('click', (e) => {

            e.preventDefault();

            localStorage.removeItem('userToken');

            location.href = '/cerrar-sesion';
        })
    );
});