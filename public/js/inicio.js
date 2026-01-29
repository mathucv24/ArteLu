const slider = document.getElementById("slider");
const slides = slider.children;
const totalSlides = slides.length;

let index = 0;
let interval;


const dotsContainer = document.getElementById("dots");

for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("button");
    dot.className = "w-3 h-3 rounded-full bg-white/50";
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

const dots = dotsContainer.children;

function updateSlider() {
    slider.style.transform = `translateX(-${index * 100}%)`;
    [...dots].forEach(dot => dot.classList.remove("bg-white"));
    dots[index].classList.add("bg-white");
}

function nextSlide() {
    index = (index + 1) % totalSlides;
    updateSlider();
}

function prevSlide() {
    index = (index - 1 + totalSlides) % totalSlides;
    updateSlider();
}

function goToSlide(i) {
    index = i;
    updateSlider();
    resetAutoplay();
}


document.getElementById("nextSlide").addEventListener("click", () => {
    nextSlide();
    resetAutoplay();
});

document.getElementById("prevSlide").addEventListener("click", () => {
    prevSlide();
    resetAutoplay();
});


function startAutoplay() {
    interval = setInterval(nextSlide, 5000);
}

function resetAutoplay() {
    clearInterval(interval);
    startAutoplay();
}

updateSlider();
startAutoplay();
