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

    const desktopGuest = document.querySelector('.desktop-guest');
    const desktopAuth = document.querySelector('.desktop-auth');
    const btnLogoutDesktop = document.getElementById('btn-logout-desktop');

    const mobileGuest = document.getElementById('mobile-guest');
    const mobileAuth = document.getElementById('mobile-auth');
    const btnLogoutMobile = document.getElementById('btn-logout-mobile');
    
    const btnMenuMovil = document.getElementById('btn-menu-movil');
    const iconMenu = document.getElementById('icon-menu');
    const menuMovil = document.getElementById('menu-movil');
    const mobileLinks = document.querySelectorAll('.mobile-link'); 

    if (userToken) {
        if(desktopGuest) desktopGuest.classList.add('hidden');
        if(desktopAuth) desktopAuth.classList.remove('hidden');

        if(mobileGuest) mobileGuest.classList.add('hidden');
        if(mobileAuth) mobileAuth.classList.remove('hidden');   
    } else {
        if(desktopGuest) desktopGuest.classList.remove('hidden');
        if(desktopAuth) desktopAuth.classList.add('hidden');

        if(mobileGuest) mobileGuest.classList.remove('hidden');
        if(mobileAuth) mobileAuth.classList.add('hidden');
    }

    let isMenuOpen = false;

    btnMenuMovil?.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        toggleMenu(isMenuOpen);
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            toggleMenu(false);
        });
    });

    function toggleMenu(open) {
        if (open) {
            menuMovil.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
            menuMovil.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
            
            iconMenu.classList.remove('fa-bars');
            iconMenu.classList.add('fa-xmark');
            
            document.body.style.overflow = 'hidden';
        } else {
            menuMovil.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
            menuMovil.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
            
            iconMenu.classList.remove('fa-xmark');
            iconMenu.classList.add('fa-bars');

            document.body.style.overflow = '';
        }
    }

    const handleLogout = (e) => {
        e.preventDefault();
       
        localStorage.removeItem('userToken');
        window.location.href = '/'; 
        
    };

    if(btnLogoutDesktop) btnLogoutDesktop.addEventListener('click', handleLogout);
    if(btnLogoutMobile) btnLogoutMobile.addEventListener('click', handleLogout);


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