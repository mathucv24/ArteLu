document.addEventListener('DOMContentLoaded', () => {

    const iniciarSesionForm = document.getElementById('iniciar-sesion-form');
    const btnSubmit = document.getElementById('btn-submit');

    iniciarSesionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { email, password } = e.target;

        if (!email.value) {
            mostrarAlerta(true, 'El campo de correo, es obligatorio');
            return;
        }

        if (!password.value) {
            mostrarAlerta(true, 'El campo de contraseña, es obligatorio');
            return;
        }

        const textoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

        try {

            const iniciarSesion = {
                email: email.value,
                password: password.value
            };

            const respuesta = await fetch('/api/sesion/iniciar-sesion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(iniciarSesion)
            });

            const data = await respuesta.json();

            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;

            if (!respuesta.ok) {
                mostrarAlerta(true, data.mensaje || 'Error al iniciar sesión');
                return;
            }

            localStorage.setItem('userToken', data.token);

            mostrarAlerta(false, '¡Bienvenido! Redirigiendo...')

            btnSubmit.classList.remove('from-secondary', 'to-primary');
            btnSubmit.classList.add('bg-green-600');
            btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> BIENVENIDO';



            setTimeout(() => {
                location.href = '/dashboard';
            }, 3000);

        } catch (error) {
            console.error(error);
            mostrarAlerta(true, 'Error de conexión con el servidor');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoOriginal;
        }

    });

});