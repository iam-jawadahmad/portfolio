(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;
      let action = thisForm.getAttribute('action');
      if (!action) {
        displayError(thisForm, 'Form action URL is missing!');
        return;
      }

      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      fetch(action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCookie('csrftoken')
        }
      })
      .then(response => {
        thisForm.querySelector('.loading').classList.remove('d-block');
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`${response.status} ${response.statusText}`);
        }
      })
      .then(data => {
        if (data.status === 'OK') {
          const sentMessage = thisForm.querySelector('.sent-message');
          sentMessage.classList.add('d-block');

          // Hide the success message after 5 seconds
          setTimeout(function() {
            sentMessage.classList.remove('d-block');
          }, 5000); // 5000 milliseconds = 5 seconds

          thisForm.reset();
          refreshCaptcha();
        } else {
          throw new Error(data.message || 'Wrong Captcha');
        }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
    });
  });

  function displayError(form, error) {
    form.querySelector('.loading').classList.remove('d-block');
    form.querySelector('.error-message').innerHTML = error;
    form.querySelector('.error-message').classList.add('d-block');

    // Hide the error message after 5 seconds too
    setTimeout(function() {
      form.querySelector('.error-message').classList.remove('d-block');
    }, 5000);
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function refreshCaptcha() {
    fetch('/captcha/refresh/', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to refresh captcha');
      }
    })
    .then(data => {
      // Try multiple potential selectors for the image
      const captchaImg = document.querySelector('.captcha img') ||
                        document.querySelector('img[src*="captcha"]') ||
                        document.querySelector('img[src*="/captcha/image/"]');

      if (captchaImg) {
        captchaImg.src = '/captcha/image/' + data.key + '/';
      }

      // Update the hidden input with the new captcha key
      const captchaKeyInput = document.querySelector('input[name="captcha_0"]');
      if (captchaKeyInput) {
        captchaKeyInput.value = data.key;
      }

      // Clear the captcha input field
      const captchaValueInput = document.querySelector('input[name="captcha_1"]');
      if (captchaValueInput) {
        captchaValueInput.value = '';
      }
    })
    .catch(error => {
      console.error('Error refreshing captcha:', error);
    });
  }

  window.refreshCaptcha = refreshCaptcha;
})();