/**
 * Formspree Form Handler
 * Handles form submissions to Formspree with proper loading, success, and error states
 */
(function () {
  "use strict";

  // Get all forms with Formspree action
  let forms = document.querySelectorAll('.php-email-form[action*="formspree.io"]');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      let thisForm = this;
      let action = thisForm.getAttribute('action');
      
      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }

      // Show loading state
      showLoading(thisForm);
      
      let formData = new FormData(thisForm);

      // Submit to Formspree
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        hideLoading(thisForm);
        
        if (response.ok) {
          // Check if response has JSON content
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          } else {
            // For non-JSON responses, just return success
            return { ok: true };
          }
        } else {
          // Handle HTTP errors
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json().then(data => {
              throw new Error(data.error || data.errors?.[0]?.message || `HTTP Error: ${response.status}`);
            });
          } else {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
          }
        }
      })
      .then(data => {
        // Success
        showSuccess(thisForm);
        thisForm.reset();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          hideSuccess(thisForm);
        }, 5000);
      })
      .catch(error => {
        // Error
        console.error('Form submission error:', error);
        displayError(thisForm, error.message || 'Something went wrong. Please try again.');
      });
    });
  });

  function showLoading(form) {
    hideAllStates(form);
    let loadingElement = form.querySelector('.loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
      loadingElement.classList.add('d-block');
    }
    
    // Disable submit button
    let submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      // Store original text if not already stored
      if (!submitBtn.getAttribute('data-original-text')) {
        submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
      }
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    }
  }

  function hideLoading(form) {
    let loadingElement = form.querySelector('.loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
      loadingElement.classList.remove('d-block');
    }
    
    // Re-enable submit button
    let submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      // Restore original text or default
      const originalText = submitBtn.getAttribute('data-original-text');
      submitBtn.innerHTML = originalText || '<i class="bi bi-envelope me-2"></i>Send Message';
    }
  }

  function showSuccess(form) {
    hideAllStates(form);
    let successElement = form.querySelector('.sent-message');
    if (successElement) {
      successElement.style.display = 'block';
      successElement.classList.add('d-block');
    }
  }

  function hideSuccess(form) {
    let successElement = form.querySelector('.sent-message');
    if (successElement) {
      successElement.style.display = 'none';
      successElement.classList.remove('d-block');
    }
  }

  function displayError(form, message) {
    hideAllStates(form);
    let errorElement = form.querySelector('.error-message');
    if (errorElement) {
      errorElement.innerHTML = message;
      errorElement.style.display = 'block';
      errorElement.classList.add('d-block');
    }
    
    // Auto-hide error message after 8 seconds
    setTimeout(() => {
      hideError(form);
    }, 8000);
  }

  function hideError(form) {
    let errorElement = form.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.classList.remove('d-block');
    }
  }

  function hideAllStates(form) {
    hideLoading(form);
    hideError(form);
    hideSuccess(form);
  }

})();