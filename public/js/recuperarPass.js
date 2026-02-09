const btnOlvide = document.getElementById('btn-olvide-pass');
const modalRecuperar = document.getElementById('modal-recuperar');
const btnCerrarRecuperar = document.getElementById('btn-cerrar-recuperar');

const step1 = document.getElementById('step-1-email');
const step2 = document.getElementById('step-2-reset');
const formRequest = document.getElementById('form-request-code');
const formReset = document.getElementById('form-reset-pass');

const inputRecupEmail = document.getElementById('recup-email');
const inputRecupCodigo = document.getElementById('recup-codigo');
const inputRecupPass = document.getElementById('recup-pass');
const inputRecupRepass = document.getElementById('recup-repass');

let emailParaRecuperar = '';

if (btnOlvide) {
    btnOlvide.addEventListener('click', (e) => {
        e.preventDefault();
        modalRecuperar.classList.remove('hidden');
        step1.classList.remove('hidden', '-translate-x-full');
        step2.classList.add('hidden', 'translate-x-full');
        step2.classList.remove('block');
    });
}

if (btnCerrarRecuperar) {
    btnCerrarRecuperar.addEventListener('click', () => {
        modalRecuperar.classList.add('hidden');
    });
}

if (formRequest) {
    formRequest.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = inputRecupEmail.value.trim();
        if (!email) return mostrarAlerta(true, "Ingresa tu correo");

        const btn = document.getElementById('btn-send-code');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Enviando...";

        try {
            const res = await fetch('/api/sesion/solicitar-recuperacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                mostrarAlerta(false, "Código enviado. Revisa tu correo.");
                emailParaRecuperar = email;

                step1.classList.add('hidden');
                step2.classList.remove('hidden', 'translate-x-full');
                step2.classList.add('block');
            } else {
                mostrarAlerta(true, data.mensaje || "Error al enviar código");
            }
        } catch (error) {
            mostrarAlerta(true, "Error de conexión");
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
}

if (formReset) {
    formReset.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = inputRecupCodigo.value.trim();
        const pass = inputRecupPass.value;
        const repass = inputRecupRepass.value;

        if (pass !== repass) {
            return mostrarAlerta(true, "Las contraseñas no coinciden");
        }
        if (pass.length < 6) {
            return mostrarAlerta(true, "La contraseña debe tener al menos 6 caracteres");
        }

        const btn = document.getElementById('btn-reset-pass');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Actualizando...";

        try {
            const res = await fetch('/api/sesion/restablecer-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailParaRecuperar,
                    codigo: codigo,
                    newPassword: pass
                })
            });

            const data = await res.json();

            if (res.ok) {
                mostrarAlerta(false, "Contraseña actualizada. Inicia sesión.");
                modalRecuperar.classList.add('hidden');
                formRequest.reset();
                formReset.reset();
            } else {
                mostrarAlerta(true, data.mensaje || "Error al restablecer");
            }
        } catch (error) {
            mostrarAlerta(true, "Error de conexión");
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
}