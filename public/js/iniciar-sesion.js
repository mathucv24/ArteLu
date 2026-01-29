document.addEventListener('DOMContentLoaded', () => {

    const iniciarSesionForm = document.getElementById('iniciar-sesion-form');

    iniciarSesionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { email, password } = e.target;

        if (!email.value){
            mostrarAlerta(true, 'El campo de correo, es obligatorio');
            return; 
        }

        if (!password.value){
            mostrarAlerta(true, 'El campo de contraseña, es obligatorio');
            return; 
        }

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

        if (!respuesta.ok) {
            mostrarAlerta(true, 'Ha ocurrido un error al iniciar sesión');
            return;
        }

        const respuestaInicioSesion = await respuesta.json();   

        localStorage.setItem('userToken', respuestaInicioSesion.token);


        mostrarAlerta(false, 'Sesión iniciada correctamente');

        setTimeout(() => {
            location.href = '/dashboard';
        }, 3000);


    });

});