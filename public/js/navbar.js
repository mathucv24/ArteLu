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
    const btnPerfil = document.querySelectorAll('.btn-mi-perfil');
    

    if (localStorage.getItem('userToken')) {

        btnIniciarSesion.forEach(btn => {
            btn.classList.toggle('hidden');
        });

        btnCerrarSesion.forEach(btn => {
            btn.classList.toggle('hidden');
        });

        btnPerfil.forEach(btn => {
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

    btnPerfil.forEach(btn =>

        btn.addEventListener('click', (e) => {
            e.preventDefault();

            location.href = '/dashboard';
        })
    );
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-navbar');
        if (window.scrollY > 10) {
            nav.classList.add('shadow-xl');
            nav.classList.replace('bg-primary/95', 'bg-primary/80'); 
            nav.classList.replace('dark:bg-gray-900/95', 'dark:bg-gray-900/80');
        } else {
            nav.classList.remove('shadow-xl');
            nav.classList.replace('bg-primary/80', 'bg-primary/95');
            nav.classList.replace('dark:bg-gray-900/80', 'dark:bg-gray-900/95');
        }
    });
});