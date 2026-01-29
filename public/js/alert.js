const mostrarAlerta = (error, texto) => {
    const alerta = document.getElementById('alerta');
    const textAlerta = document.getElementById('text-alert');

    alerta.classList.remove('bg-red-500', 'bg-green-500', 'hidden');

    const colorClass = error ? 'bg-red-500' : 'bg-green-500';
    alerta.classList.add(colorClass, 'flex', 'animate-bounce-in');

    textAlerta.innerText = texto;

    setTimeout(() => {
        alerta.classList.add('hidden');
        alerta.classList.remove('flex');
    }, 3000);
}

window.mostrarAlerta = mostrarAlerta;
