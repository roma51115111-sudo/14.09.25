document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById('header');
  const logo = document.getElementById('logo');
  const video1 = document.getElementById('video1');
  const video2 = document.getElementById('video2');
  const heroContent = document.getElementById('heroContent');
  const overlay = document.getElementById('overlay');
  const heroTitleSpans = document.querySelectorAll('.animated-title span');
  const heroText = document.querySelector('.hero-text');
  const heroBtn = document.querySelector('.hero-btn');

  let headerVisible = false;

  // --- Перезапуск анімації гіфки ---
  const originalSrc = logo.getAttribute('src').split('?')[0];
  logo.setAttribute('src', originalSrc + '?t=' + new Date().getTime());

  // --- Ховаємо хедер при запуску першого відео ---
  video1.addEventListener('play', () => {
    header.classList.remove('scrolled');
  });

  // --- Коли перше відео завершилось — показуємо друге відео та хедер ---
  video1.addEventListener('ended', () => {
    setTimeout(() => {
      video2.style.display = 'block';
      video2.play();
      header.classList.remove('hidden');
      header.classList.remove('scrolled');
      headerVisible = true;
    }, 500);
  });

  // --- Поява контенту героя при запуску другого відео ---
  video2.addEventListener('play', () => {
    heroContent.classList.add('visible');
    heroTitleSpans.forEach((span) => {
      setTimeout(() => {
        span.classList.add('visible');
      }, parseInt(span.dataset.delay));
    });

    setTimeout(() => heroText.classList.add('visible'), 1400);
    setTimeout(() => heroBtn.classList.add('visible'), 1800);
  });

  // --- Потемніння після завершення другого відео ---
  video2.addEventListener('ended', () => {
    overlay.classList.add('visible');
  });

  // --- Слідкуємо за прокруткою ---
  window.addEventListener('scroll', () => {
    if (!headerVisible) return;
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

// ===============================
// ======== КОД ГАЛЕРЕЇ ==========
// ===============================

let xPos = 0;
const $galleryRing = $('.gallery-ring');
const $imgs = $('.gallery-img');
const total = $imgs.length;
const angle = (360 / total); // зменшує кут на 30%, робить картинки ближчими
const radius = 850;

let currentRotation = 0;
let autoRotate = null;
let activeIndex = null;
let targetRotation = 0;

// --- Ініціалізація галереї ---
gsap.set('.gallery-ring', { rotationY: 0, cursor: 'grab' });

gsap.set('.gallery-img', {
  rotateY: (i) => i * angle,
  transformOrigin: `50% 50% ${radius}px`,
  z: -radius,
  scale: 1,
  backfaceVisibility: 'hidden',
  transformStyle: 'preserve-3d'
});

// --- Оновлення фону ---
function updateBackground(rotation) {
  let rot = ((rotation % 360) + 360) % 360;
  let index = Math.round(rot / angle) % total;
  index = (total - index) % total;
  let bg = $imgs.eq(index).css('background-image');

  $('.section-gallery').css({
    backgroundImage: bg,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    transition: 'background-image 0.5s ease'
  });
}

function updateScales(rotation) {
  $imgs.each(function (i) {
    let rot = (i * angle + rotation) % 360;
    if (rot < 0) rot += 360;

    // нормалізуємо кут [-180, 180]
    let normalized = rot > 180 ? rot - 360 : rot;
    const radians = (normalized * Math.PI) / 180;

    // межі масштабів
    const minScale = 0.85; // центр
    const maxScale = 1.35; // край

    // плавна синусоїда — без tween
    const scale = maxScale - (Math.cos(radians) + 1) / 2 * (maxScale - minScale);

    gsap.set(this, { scale: scale });
  });
}




// --- Початкова ініціалізація ---
updateBackground(0);
updateScales(0);

let isDragging = false;
let lastRotation = 0;

// --- Управління мишею (drag) ---
$(window).on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);

function dragStart(e) {
  isDragging = true;
  if (e.touches) e.clientX = e.touches[0].clientX;
  xPos = Math.round(e.clientX);
  gsap.set('.gallery-ring', { cursor: 'grabbing' });

  if (autoRotate) autoRotate.pause();
  $(window).on('mousemove touchmove', drag);
}

function drag(e) {
  if (e.touches) e.clientX = e.touches[0].clientX;
  let delta = Math.round(e.clientX) - xPos;
  currentRotation -= delta;
  targetRotation = currentRotation;
  gsap.set('.gallery-ring', { rotationY: currentRotation });
  updateBackground(currentRotation);
  xPos = Math.round(e.clientX);
}

function dragEnd() {
  isDragging = false;
  $(window).off('mousemove touchmove', drag);
  gsap.set('.gallery-ring', { cursor: 'grab' });
  if (autoRotate) autoRotate.resume();
}

// --- Тикер з логікою "ефект лише під час руху" ---
gsap.ticker.add(() => {
  currentRotation += (targetRotation - currentRotation) * 0.05;

  if (isDragging || Math.abs(currentRotation - lastRotation) > 0.2) {
    gsap.set('.gallery-ring', { rotationY: currentRotation });
    updateBackground(currentRotation);
    updateScales(currentRotation);
    lastRotation = currentRotation;
  } else {
    gsap.set('.gallery-ring', { rotationY: currentRotation });
  }
});


// --- КЛИК ПО КАРТИНКЕ (ОТКЛЮЧЕН) ---
// $imgs.on('click', function () {
//   if (autoRotate) {
//     autoRotate.kill();
//     autoRotate = null;
//   }
//
//   const clickedIndex = $(this).index();
//   let rot = ((currentRotation % 360) + 360) % 360;
//   let currentIndex = Math.round(rot / angle) % total;
//   currentIndex = (total - currentIndex) % total;
//
//   let step = clickedIndex - currentIndex;
//   if (step > total / 2) step -= total;
//   if (step < -total / 2) step += total;
//
//   currentRotation -= step * angle;
//
//   gsap.to('.gallery-ring', {
//     rotationY: currentRotation,
//     duration: 1,
//     ease: 'power2.inOut',
//     onUpdate: () => updateBackground(currentRotation),
//     onComplete: () => {
//       activeIndex = clickedIndex;
//       $imgs.each(function () {
//         gsap.to(this, { scale: 1, duration: 0.3 });
//       });
//       gsap.to($imgs.eq(activeIndex), { scale: 1.5, duration: 0.5, ease: 'power2.out' });
//     }
//   });
// });

// --- Наведение (ОТКЛЮЧЕНО) ---
// $imgs.on('mouseenter', function () {
//   if (autoRotate) autoRotate.pause();
//
//   const hoveredIndex = $(this).index();
//
//   if (hoveredIndex !== activeIndex) {
//     gsap.to(this, { scale: 1.3, duration: 0.3, ease: 'power2.out' });
//   }
//
//   $imgs.each(function (i) {
//     if (i !== hoveredIndex) {
//       gsap.to(this, {
//         rotateY: i * angle,
//         transformOrigin: `50% 50% ${radius}px`,
//         z: -radius,
//         duration: 0.3,
//         ease: 'power2.out'
//       });
//     }
//   });
// });
//
// $imgs.on('mouseleave', function () {
//   if (autoRotate) autoRotate.resume();
//
//   $imgs.each(function (i) {
//     let targetScale = (i === activeIndex) ? 1.5 : 1;
//     gsap.to(this, {
//       scale: targetScale,
//       rotateY: i * angle,
//       transformOrigin: `50% 50% ${radius}px`,
//       z: -radius,
//       duration: 0.3,
//       ease: 'power2.inOut'
//     });
//   });
// });
});
