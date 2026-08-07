const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

themeToggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
    if(html.classList.contains('dark')){
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

if(localStorage.getItem('theme') === 'dark'){
    html.classList.add('dark');
}

document.addEventListener('DOMContentLoaded', () => {

    const userToken = localStorage.getItem('userToken');

    // Seleccionamos las clases para Escritorio
    const desktopGuest = document.querySelectorAll('.desktop-guest');
    const desktopAuth = document.querySelectorAll('.desktop-auth');
    
    // Seleccionamos las clases para los botones pequeños en Móvil
    const mobileGuest = document.querySelectorAll('.mobile-guest');
    const mobileAuth = document.querySelectorAll('.mobile-auth');
    
    // Botones de cierre de sesión
    const btnLogoutDesktop = document.getElementById('btn-logout-desktop');
    const btnLogoutMobile = document.getElementById('btn-logout-mobile');

    // Lógica de visualización
    if (userToken) {
        // Ocultar Invitados
        desktopGuest.forEach(el => { el.classList.remove('flex'); el.classList.add('hidden'); });
        mobileGuest.forEach(el => { el.classList.remove('inline-flex'); el.classList.add('hidden'); });
        
        // Mostrar Logueados
        desktopAuth.forEach(el => { el.classList.remove('hidden'); el.classList.add('flex'); });
        mobileAuth.forEach(el => { el.classList.remove('hidden'); el.classList.add('inline-flex'); });
    } else {
        // Mostrar Invitados
        desktopGuest.forEach(el => { el.classList.remove('hidden'); el.classList.add('flex'); });
        mobileGuest.forEach(el => { el.classList.remove('hidden'); el.classList.add('inline-flex'); });
        
        // Ocultar Logueados
        desktopAuth.forEach(el => { el.classList.remove('flex'); el.classList.add('hidden'); });
        mobileAuth.forEach(el => { el.classList.remove('inline-flex'); el.classList.add('hidden'); });
    }

    // Lógica de Cierre de Sesión
    const handleLogout = async (e) => { 
        e.preventDefault();

        try {
            const response = await fetch('/api/sesion/cerrar-sesion', { 
                method: 'POST', 
                credentials: 'include' 
            });

            if (response.ok) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('theme'); 
                window.location.href = '/iniciar-sesion'; 
            } else {
                console.error("Error al cerrar sesión en el servidor");
            }
        } catch (error) {
            console.error("Error de red al intentar cerrar sesión:", error);
        }
    };

    if(btnLogoutDesktop) btnLogoutDesktop.addEventListener('click', handleLogout);
    if(btnLogoutMobile) btnLogoutMobile.addEventListener('click', handleLogout);

    // Efecto de Navbar al hacer scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-navbar');
        if (window.scrollY > 10) {
            nav.classList.add('shadow-lg');
            nav.classList.replace('backdrop-blur-md', 'backdrop-blur-xl');
        } else {
            nav.classList.remove('shadow-lg');
            nav.classList.replace('backdrop-blur-xl', 'backdrop-blur-md');
        }
    });
});