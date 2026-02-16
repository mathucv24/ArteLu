document.addEventListener('DOMContentLoaded', () => {

    const validarInput = (input, valor, expresionRegular) => {
        const clasesNormales = ['border-gray-200', 'dark:border-gray-600', 'focus:border-secondary'];
        const clasesExito = ['border-green-500', 'ring-1', 'ring-green-500', 'bg-green-50'];
        const clasesError = ['border-red-500', 'ring-1', 'ring-red-500', 'bg-red-50'];

        input.classList.remove(...clasesExito, ...clasesError);

        if (expresionRegular.test(valor)) {
            input.classList.remove(...clasesNormales); 
            input.classList.add(...clasesExito); 
            return true;
        } else if (valor.length == 0) {
            input.classList.add(...clasesNormales);
            return false;
        } else {
            input.classList.remove(...clasesNormales);
            input.classList.add(...clasesError); 
            return false;
        }
    }

    const validarSubmit = () => {

        if (banderaEmail && banderaPassword && banderaRepassword && banderaNombre && banderaTelefono) {
            formSubmit.removeAttribute('disabled');
        } else {
            formSubmit.setAttribute('disabled', 'disabled');
        }

    }

    const setupTogglePassword = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);

        if (btn && input) {
            btn.addEventListener('click', () => {
                const icon = btn.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    };

    setupTogglePassword('toggle-password', 'password');
    setupTogglePassword('toggle-repassword', 'repassword');

    const registrarUsuarioForm = document.getElementById('registrar-usuario-form');
    const inputNombre = document.getElementById('nombre');
    const inputTelefono = document.getElementById('telefono');
    const inputPassword = document.getElementById('password');
    const inputRepassword = document.getElementById('repassword');
    const inputEmail = document.getElementById('email');
    const formSubmit = document.getElementById('btn-submit');

    const modalVerificacion = document.getElementById('modal-verificacion');
    const inputCodigo = document.getElementById('input-codigo');
    const btnVerificarCodigo = document.getElementById('btn-verificar-codigo');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    let emailPendiente = '';

    let banderaNombre = false;
    let banderaTelefono = false;
    let banderaEmail = false;
    let banderaPassword = false;
    let banderaRepassword = false;

    const nombreValidation = /^[a-zA-ZÀ-ÿ\s]{1,40}$/;
    const telefonoValidation = /^\d{7,14}$/;
    const emailValidation = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
    const passwordValidation = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{6,}$/gm

    inputNombre.addEventListener('input', (e) => {
        const inputValue = e.target.value;
        banderaNombre = validarInput(inputNombre, inputValue, nombreValidation);
        validarSubmit();
    });

    inputTelefono.addEventListener('input', (e) => {
        const inputValue = e.target.value;
        banderaTelefono = validarInput(inputTelefono, inputValue, telefonoValidation);
        validarSubmit();
    });

    inputEmail.addEventListener('input', (e) => {
        const inputValue = e.target.value;
        banderaEmail = validarInput(inputEmail, inputValue, emailValidation);
        validarSubmit();
    });

    inputPassword.addEventListener('input', (e) => {
        const inputValue = e.target.value;
        banderaPassword = validarInput(inputPassword, inputValue, passwordValidation);
        validarSubmit();
    });

    inputRepassword.addEventListener('input', (e) => {
        const inputValue = e.target.value;
        banderaRepassword = validarInput(inputRepassword, inputValue, passwordValidation);

        if (inputValue !== inputPassword.value) {
            inputRepassword.classList.add('outline-red-500');
            inputRepassword.classList.remove('outline-green-500');
            banderaRepassword = false;
        } else {
            inputRepassword.classList.remove('outline-red-500');
            inputRepassword.classList.add('outline-green-500');
        }

        validarSubmit();
    });

    registrarUsuarioForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const { nombre, telefono, email, password, repassword } = e.target;

        if (!nombre.value) {
            mostrarAlerta(true, 'El nombre esta vacio, este campo es obigatorio');
            return;
        }

        if (!telefono.value) {
            mostrarAlerta(true, 'El telefono esta vacio, este campo es obigatorio');
            return;
        }

        if (!email.value) {
            mostrarAlerta(true, 'El correo esta vacio, este campo es obigatorio');
            return;
        }

        if (!password.value) {
            mostrarAlerta(true, 'La contraseña esta vacia, este campo es obigatorio');
            return;
        }

        if (!repassword.value) {
            mostrarAlerta(true, 'La contraseña esta vacia, este campo es obigatorio');
            return;
        }

        if (password.value != repassword.value) {
            mostrarAlerta(true, 'La  contraseña no coincide');
            return;
        }

        const nuevoUser = {
            nombre: nombre.value,
            telefono: telefono.value,
            email: email.value,
            password: password.value,
            repassword: repassword.value
        };
        try {
            const respuesta = await fetch('/api/sesion/registrar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoUser)
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                mostrarAlerta(true, data.mensaje || 'Error al registrar usuario');
                return;
            }

            if (data.requiereVerificacion) {
                emailPendiente = data.email;
                modalVerificacion.classList.remove('hidden');
                mostrarAlerta(false, 'Registro iniciado. Por favor verifique su correo.');
            } else {
                mostrarAlerta(false, 'Usuario registrado exitosamente');
                setTimeout(() => { location.href = '/iniciar-sesion'; }, 3000);
            }
        } catch (error) {
            mostrarAlerta(true, 'Error de conexión con el servidor');
        }

    });

    btnVerificarCodigo.addEventListener('click', async () => {
        const codigo = inputCodigo.value;

        if (codigo.length < 6) {
            mostrarAlerta(true, 'Ingresa el código completo');
            return;
        }

        try {
            const respuesta = await fetch('/api/sesion/verificar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailPendiente, codigo: codigo })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                modalVerificacion.classList.add('hidden'); 
                mostrarAlerta(false, '¡Cuenta verificada! Redirigiendo...');

                setTimeout(() => {
                    location.href = '/iniciar-sesion';
                }, 2000);
            } else {
                mostrarAlerta(true, data.mensaje || 'Código incorrecto');
            }
        } catch (error) {
            mostrarAlerta(true, 'Error al verificar código');
        }
    });

    btnCerrarModal.addEventListener('click', () => {
        modalVerificacion.classList.add('hidden');
    });
});
