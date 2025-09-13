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

  // Перезапуск анімації гіфки
  const originalSrc = logo.getAttribute('src').split('?')[0];
  logo.setAttribute('src', originalSrc + '?t=' + new Date().getTime());

  // При запуску першого відео — ховаємо хедер
  video1.addEventListener('play', () => {
    header.classList.remove('scrolled');
  });

  // Коли перше відео завершилось — показуємо друге відео та хедер
  video1.addEventListener('ended', () => {
    setTimeout(() => {
      video2.style.display = 'block';
      video2.play();
      header.classList.remove('hidden');
      header.classList.remove('scrolled');
      headerVisible = true;
    }, 500);
  });

  // Поява контенту героя при запуску другого відео
  video2.addEventListener('play', () => {
    heroContent.classList.add('visible');
    heroTitleSpans.forEach((span) => {
      setTimeout(() => {
        span.classList.add('visible');
      }, parseInt(span.dataset.delay));
    });

    setTimeout(() => {
      heroText.classList.add('visible');
    }, 1400);

    setTimeout(() => {
      heroBtn.classList.add('visible');
    }, 1800);
  });

  // Потемніння після завершення другого відео
  video2.addEventListener('ended', () => {
    overlay.classList.add('visible');
  });

  // Слідкуємо за прокруткою
  window.addEventListener('scroll', () => {
    if (!headerVisible) return;
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ===== КОД ГАЛЕРЕИ =====
// ===== КОД ГАЛЕРЕИ =====
let xPos = 0;
const $galleryRing = $('.gallery-ring');
const $imgs = $('.gallery-img');
const total = $imgs.length;
const angle = 360 / total;
const radius = 800;
let currentRotation = 0;
let autoRotate; // для хранения анимации
let activeIndex = null; // индекс активной (увеличенной) картинки

// Устанавливаем начальные параметры
gsap.set('.gallery-ring', { rotationY: 0, cursor: 'grab' });
gsap.set('.gallery-img', {
  rotateY: (i) => i * angle,
  transformOrigin: `50% 50% ${radius}px`,
  z: -radius,
  backfaceVisibility: 'hidden'
});

// --- Функция обновления фона ---
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
updateBackground(0);

// --- Автоповорот ---
function startAutoRotate() {
  autoRotate = gsap.to({}, {
    duration: 0.02,
    repeat: -1,
    onRepeat: () => {
      currentRotation -= 0.1;
      gsap.set('.gallery-ring', { rotationY: currentRotation });
      updateBackground(currentRotation);
    }
  });
}
startAutoRotate();

// --- Управление мышью (drag) ---
$(window).on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);

function dragStart(e) {
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
  gsap.set('.gallery-ring', { rotationY: currentRotation });
  updateBackground(currentRotation);
  xPos = Math.round(e.clientX);
}

function dragEnd() {
  $(window).off('mousemove touchmove', drag);
  gsap.set('.gallery-ring', { cursor: 'grab' });
  if (autoRotate) autoRotate.resume();
}

// --- Клик по картинке ---
$imgs.on('click', function () {
  if (autoRotate) {
    autoRotate.kill();
    autoRotate = null; // отключаем автоповорот
  }

  const clickedIndex = $(this).index();
  let rot = ((currentRotation % 360) + 360) % 360;
  let currentIndex = Math.round(rot / angle) % total;
  currentIndex = (total - currentIndex) % total;

  let step = clickedIndex - currentIndex;
  if (step > total / 2) step -= total;
  if (step < -total / 2) step += total;

  currentRotation -= step * angle;

  // Поворот к выбранной картинке
  gsap.to('.gallery-ring', {
    rotationY: currentRotation,
    duration: 1,
    ease: 'power2.inOut',
    onUpdate: () => updateBackground(currentRotation),
    onComplete: () => {
      activeIndex = clickedIndex;

      // сброс масштаба у всех
      $imgs.each(function(i) {
        gsap.to(this, { scale: 1, duration: 0.3 });
      });

      // увеличиваем выбранную
      gsap.to($imgs.eq(activeIndex), {
        scale: 1.5,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  });
});

// --- Наведение с "расступанием" ---
$imgs.on('mouseenter', function() {
  $galleryRing.addClass('hovered'); // включаем затемнение
  if (autoRotate) autoRotate.pause();

  const hoveredIndex = $(this).index();

  if (hoveredIndex !== activeIndex) {
    gsap.to(this, { scale: 1.3, duration: 0.3, ease: 'power2.out' });
  }

  // Сдвигаем остальных
  $imgs.each(function(i) {
    if (i !== hoveredIndex) {
      let diff = i - hoveredIndex;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      let angleOffset = diff > 0 ? 5 : -5; 
      gsap.to(this, {
        rotateY: (i * angle) + angleOffset,
        transformOrigin: `50% 50% ${radius}px`,
        z: -radius,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
});

$imgs.on('mouseleave', function() {
  $galleryRing.removeClass('hovered'); // убираем затемнение
  if (autoRotate) autoRotate.resume();

  $imgs.each(function(i) {
    let targetScale = (i === activeIndex) ? 1.5 : 1;
    gsap.to(this, {
      scale: targetScale,
      rotateY: i * angle,
      transformOrigin: `50% 50% ${radius}px`,
      z: -radius,
      duration: 0.3,
      ease: 'power2.inOut'
    });
  });
});


});