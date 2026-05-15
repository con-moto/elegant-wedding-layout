document.addEventListener('DOMContentLoaded', () => {
  // ===== INTRO-SCREEN =====
  const intro = document.querySelector('.intro-screen');

  if (intro) {
    setTimeout(() => {
      intro.classList.add('card-out');
    }, 400);

    intro.addEventListener('click', () => {
      intro.classList.add('hide-hint');
      intro.classList.add('is-hidden');

      intro.addEventListener(
        'transitionend',
        () => {
          intro.style.display = 'none';
        },
        { once: true }
      );
    });
  }

  // ===== COUNTDOWN =====
  // 19 сентября 2026, 12:00, часовой пояс +03:00
  const targetDate = new Date('2026-09-19T12:00:00+03:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    const pad = (n) => String(n).padStart(2, '0');

    const updateCountdown = () => {
      const now = Date.now();
      let diff = targetDate - now;

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
      const minutes = Math.floor((totalSeconds / 60) % 60);
      const seconds = totalSeconds % 60;

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ===== COPY PAYMENT DETAILS =====
  const paymentBlocks = document.querySelectorAll('.payment-block');

  paymentBlocks.forEach((block) => {
    const btn = block.querySelector('.payment-copy');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const text = block.dataset.payment || block.textContent.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          const prev = btn.textContent;
          btn.textContent = 'скопировано';
          setTimeout(() => {
            btn.textContent = prev;
          }, 2000);
        });
      }
    });
  });

  // ===== CALENDAR TEXT ANIMATION =====
  const calendarSection = document.querySelector('.section--calendar');

  if (calendarSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            calendarSection.classList.add('is-visible');
            obs.unobserve(calendarSection);
          }
        });
      },
      {
        root: null,
        threshold: 0.3,
      }
    );

    observer.observe(calendarSection);
  }

  // ===== GUEST FORM: отправка на Vercel backend =====
  const guestForm = document.querySelector('.guest-form');
  if (guestForm) {
    let statusEl = document.querySelector('.guest-form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'guest-form-status';
      statusEl.style.marginTop = '1rem';
      statusEl.style.fontFamily = '"Bebas Neue", system-ui, sans-serif';
      statusEl.style.fontSize = '0.95rem';
      statusEl.style.letterSpacing = '0.14em';
      statusEl.style.textTransform = 'uppercase';
      guestForm.appendChild(statusEl);
    }

    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();

      statusEl.textContent = 'Отправляем...';

      const formData = new FormData(guestForm);
      const payload = {
        form_type: 'rsvp-form',
        first_name: formData.get('first_name') || '',
        last_name: formData.get('last_name') || '',
        attendance: formData.get('attendance') || '',
        food_preference: formData.get('food_preference') || '',
        child: formData.get('child') || '',
        message: formData.get('message') || '',
        event: 'Wedding 19.09.2026',
      };

      const BACKEND_URL = 'https://wedding-yulia-francesco-backend.vercel.app/api/send';

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            statusEl.textContent = data.message || 'Спасибо! Форма отправлена.';
            guestForm.reset();
          } else {
            statusEl.textContent =
              (data && data.message) ||
              'Произошла ошибка при отправке. Попробуйте позже.';
          }
        })
        .catch((err) => {
          console.error(err);
          statusEl.textContent =
            'Произошла ошибка при отправке. Попробуйте позже.';
        });
    });
  }
});