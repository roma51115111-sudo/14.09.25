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

// 🔧 FIX 1: переименование, ничего не удаляем
const galleryAngle = 360 / total;

// 🔧 FIX 2: blur объявлен, строка остается рабочей
const blur = 0;

const radius = 850;

let currentRotation = 0;
let autoRotate = null;
let activeIndex = null;
let targetRotation = 0;

// --- Ініціалізація галереї ---
gsap.set('.gallery-ring', { rotationY: 0, cursor: 'grab' });

gsap.set('.gallery-img', {
  rotateY: (i) => i * galleryAngle,
  transformOrigin: `50% 50% ${radius}px`,
  z: -radius,
  scale: 1,
  backfaceVisibility: 'hidden',
  transformStyle: 'preserve-3d'
});

// --- Оновлення фону ---
function updateBackground(rotation) {
  let rot = ((rotation % 360) + 360) % 360;
  let index = Math.round(rot / galleryAngle) % total;
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
  for (let i = 0; i < total; i++) {
    const el = $imgs[i];

    let rot = (i * galleryAngle + rotation) % 360;
    if (rot < 0) rot += 360;
    if (rot > 180) rot -= 360;

    const absRot = Math.abs(rot);

    const minScale = 0.5;
    const maxScale = 1.35;
    const scale = minScale + (absRot / 180) * (maxScale - minScale);

    const baseRadius = 850;
    const radiusOffset = (1 - absRot / 180) * 250;
    const z = -baseRadius + radiusOffset;

    // ❗ НИЧЕГО НЕ УБРАНО
    el.style.transform =
      `rotateY(${i * galleryAngle}deg) translateZ(${z}px) scale(${scale})`;
    el.style.filter = `blur(${blur}px)`;
  }
}

// --- Початкова ініціалізація ---
updateBackground(0);
updateScales(0);

let isDragging = false;
let lastRotation = 0;

// --- Управління мишею (drag) ---
$(window).on('mousedown touchstart', dragStart);
$(window).on('mouseup touchend', dragEnd);

let dragSpeed = 0.3;

function dragStart(e) {
  isDragging = true;

  if (!e.touches) {
    dragSpeed = e.button === 2 ? 0.05 : 0.1;
  }

  if (e.touches) {
    e.clientX = e.touches[0].clientX;
    dragSpeed = 0.3;
  }

  xPos = Math.round(e.clientX);
  gsap.set('.gallery-ring', { cursor: 'grabbing' });

  if (autoRotate) autoRotate.pause();
  $(window).on('mousemove touchmove', drag);
}

function drag(e) {
  if (!isDragging) return;

  let clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let delta = clientX - xPos;

  const speedFactor = 0.1;
  targetRotation -= delta * speedFactor;
  xPos = clientX;
}

function dragEnd() {
  isDragging = false;
  $(window).off('mousemove touchmove', drag);
  gsap.set('.gallery-ring', { cursor: 'grab' });
  if (autoRotate) autoRotate.resume();
}

// --- Анімація ---
function animate() {
  requestAnimationFrame(animate);

  currentRotation += (targetRotation - currentRotation) * 0.25;

  $galleryRing[0].style.transform =
    `rotateY(${currentRotation}deg)`;

  updateBackground(currentRotation);
  updateScales(currentRotation);

  lastRotation = currentRotation;
}

animate();





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
  // ===============================
  // ======== СЛАЙДЕР ВИДЕО ========
  // ===============================
  const container = document.getElementById('compareContainer');
  const slider = document.getElementById('slider');
  const videoAfter = document.getElementById('videoAfter');
  
  if (container && slider && videoAfter) {
  
    let isDraggingSlider = false;
    let autoTween = null;
    const margin = 10;
  
    function setSliderPosition(x, isAuto = false) {
      const rect = container.getBoundingClientRect();
  
      if (x < margin) x = margin;
      if (x > rect.width - margin) x = rect.width - margin;
  
      if (isDraggingSlider && isAuto) return;
  
      slider.style.left = x + 'px';
      const rightInset = Math.round(rect.width - x);
      videoAfter.style.clipPath = `inset(0px ${rightInset}px 0px 0px)`;
    }
  
    function sliderStartDrag(e) {
      e.preventDefault();
      isDraggingSlider = true;
      if (autoTween) {
        autoTween.kill();
        autoTween = null;
      }
    }
  
    function sliderDrag(e) {
      if (!isDraggingSlider) return;
      let clientX = e.clientX;
      if (e.touches) clientX = e.touches[0].clientX;
      const rect = container.getBoundingClientRect();
      setSliderPosition(clientX - rect.left);
    }
  
    function sliderEndDrag() {
      isDraggingSlider = false;
    }
  
    // === правильная привязка ===
    slider.addEventListener('mousedown', sliderStartDrag);
    slider.addEventListener('touchstart', sliderStartDrag, { passive: false });
  
    window.addEventListener('mousemove', sliderDrag);
    window.addEventListener('touchmove', sliderDrag, { passive: false });
  
    window.addEventListener('mouseup', sliderEndDrag);
    window.addEventListener('touchend', sliderEndDrag);
  
    // === центруем при загрузке ===
    function initSlider() {
      const rect = container.getBoundingClientRect();
      setSliderPosition(rect.width / 2);
    }
    initSlider();
  
    // === корректировка при ресайзе ===
    window.addEventListener('resize', () => {
      const rect = container.getBoundingClientRect();
      const left = parseFloat(slider.style.left) || rect.width / 2;
      setSliderPosition(Math.min(Math.max(left, margin), rect.width - margin));
    });
  
    // === автоматическое движение при появлении ===
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !autoTween) {
          const rect = container.getBoundingClientRect();
          const center = rect.width / 2;
  
          autoTween = gsap.to({}, {
            duration: 2,
            delay: 2,
            onUpdate: function () {
              setSliderPosition(center - (center - margin) * this.progress(), true);
            },
            onComplete: () => {
              autoTween = null;
            }
          });
  
          observer.unobserve(container);
        }
      });
    }, { threshold: 0.5 });
  
    observer.observe(container);
  
  } else {
    console.warn('Slider elements not found: compareContainer/slider/videoAfter');
  }


// ===============================
// ===== HERO 3D CAROUSEL =========
// ===== Framer-feel Engine =======
// ===============================
(function hero3DCarousel() {

  const root = document.querySelector('.section-hero-carousel');
  if (!root) return;

  const ring = root.querySelector('.hero-carousel__ring');
  const cards = [...root.querySelectorAll('.hero-carousel__card')];
  const total = cards.length;
  if (!ring || !total) return;

  // ------------------
  // CONFIG
  // ------------------
  const RADIUS = 500;
  const density = 1;
  const step = 360 / total * density;

  const DRAG_LEFT = 0.12;
  const DRAG_RIGHT = 0.05;

  const INERTIA_SCALE = 8;

  const SNAP_EASE = "expo.out";
  const INERTIA_EASE = "power2.out";

  const ACTIVE_BOOST = 90;
  const NEAR_BOOST = 45;

  const ACTIVE_SCALE = 1.1;
  const NEAR_SCALE = 1.04;

  const TILT_X = -2;
  const TILT_RAD = Math.abs(TILT_X) * Math.PI / 180;

  // ------------------
  // STATE
  // ------------------
  let angle = 0;
  let velocity = 0;
  let lastX = 0;
  let isDown = false;
  let tween = null;
  let targetAngle = 0;
  
  const setRing = gsap.quickSetter(ring, "rotateY", "deg");
  
  // ------------------
  // SMOOTH FALLOFF FUNCTION
  // ------------------
  function smoothFalloff(diff, max) {
    const x = Math.min(diff / max, 1); // нормализуем от 0 до 1
    return 1 - Math.pow(x, 3); // кубическая кривая для плавного падения
  }
  
  // ------------------
  // SCENE LAYOUT once
  // ------------------
  cards.forEach((card, i) => {
    const local = -((total - 1) / 2) * step + i * step;
    card.dataset.local = local;
  
    const h = card.offsetHeight;
    const compensateY = Math.tan(TILT_RAD) * (h / 2);
  
    card.style.setProperty('--z', '0px');
    card.style.setProperty('--scale', '1');
  
    card.style.transform = `
      translate(-50%, -50%)
      translateY(${compensateY}px)
      rotateY(${local}deg)
      translateZ(calc(${RADIUS}px + var(--z)))
      rotateX(${TILT_X}deg)
      scale3d(var(--scale), var(--scale), 1)
    `;
  
    card.style.transformStyle = "preserve-3d";
    card.style.backfaceVisibility = "hidden";
  });
  

  function updateDepth() {

    cards.forEach(card => {
      const local = parseFloat(card.dataset.local);
  
      // ✅ ПРАВИЛЬНЫЙ DIFF
      let diff = ((local + angle + 180) % 360) - 180;
      const absDiff = Math.abs(diff);
  
      // 0 = центр, 1 = сосед
      const t = Math.min(absDiff / step, 1);
  
      // ---------- FALL OFF ----------
      const scale = 1 + (1 - t) * 0.1;
      const z = (1 - t) * ACTIVE_BOOST;
      const opacity = 0.4 + (1 - t) * 0.6;
  
      card.style.setProperty('--scale', scale.toFixed(3));
      card.style.setProperty('--z', `${z.toFixed(1)}px`);
      card.style.opacity = opacity.toFixed(3);
  
      // ❌ никакого blur для центральной
      card.style.filter = absDiff < step * 0.5 ? 'none' : 'blur(1.5px)';
  
      const h = card.offsetHeight;
      const compensateY = Math.tan(TILT_RAD) * (h / 2);
  
      card.style.transform = `
        translate(-50%, -50%)
        translateY(${compensateY}px)
        rotateY(${local}deg)
        translateZ(calc(${RADIUS}px + var(--z)))
        rotateX(${TILT_X}deg)
        scale3d(var(--scale), var(--scale), 1)
      `;
    });
  }
  
  

  // ------------------
  // RAF LOOP
  // ------------------
  function loop() {
    angle += (targetAngle - angle) * 0.08; // 👈 магия
    setRing(angle);
    updateDepth();
    requestAnimationFrame(loop);
  }
  

  // ------------------
  // SNAP TARGET
  // ------------------
  function getSnapTarget(a) {
    return Math.round(a / step) * step;
  }

  // ------------------
  // POINTER INPUT
  // ------------------
  root.addEventListener("pointerdown", e => {
    if (e.button !== 0 && e.button !== 2) return;

    isDown = true;
    lastX = e.clientX;

    if (tween) tween.kill();
    tween = null;

    velocity = 0;

    root.setPointerCapture(e.pointerId);
  });

  root.addEventListener("pointermove", e => {
    if (!isDown || e.buttons === 0) return;

    const dx = e.clientX - lastX;
    lastX = e.clientX;

    const drag = (e.buttons === 2) ? DRAG_RIGHT : DRAG_LEFT;

    angle += dx * drag;
    targetAngle = angle;
    velocity = dx * drag;

  });

  root.addEventListener("pointerup", e => {
    isDown = false;
    root.releasePointerCapture(e.pointerId);

    // ---- 1) INERTIA run ----
    const inertiaTarget = angle + velocity * INERTIA_SCALE;
    targetAngle = getSnapTarget(inertiaTarget);
    const snapTarget = getSnapTarget(inertiaTarget);

    let proxy = { v: angle };

    tween = gsap.to(proxy, {
      v: inertiaTarget,
      duration: 0.35,
      ease: INERTIA_EASE,
      onUpdate() {
        angle = proxy.v;
      },
      onComplete() {

        // ---- 2) SMOOTH SNAP ----
        tween = gsap.to(proxy, {
          v: snapTarget,
          duration: 0.65,
          ease: SNAP_EASE,
          onUpdate() {
            angle = proxy.v;
          }
        });
      }
    });
  });

  // ------------------
  // WHEEL / TRACKPAD
  // ------------------
  root.addEventListener("wheel", e => {
    e.preventDefault();
  
    const delta = e.deltaY || e.deltaX;
    const scroll = gsap.utils.clamp(-40, 40, delta * 0.6);
  
    targetAngle += scroll;
  }, { passive: false });
  
  root.addEventListener("contextmenu", e => e.preventDefault());

  loop();

})();

})();
