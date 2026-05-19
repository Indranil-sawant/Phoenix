/**
 * Phoenix Technical Solution — shared form submission
 * Google Apps Script backend · honeypot · rate limit · sanitization
 */
(function () {
  'use strict';

  const cfg = () => window.PHOENIX_CONFIG || {};
  let lastSubmitAt = 0;

  function sanitize(str, maxLen) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, maxLen || 5000);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }

  async function submitEnquiry(payload) {
    const endpoint = cfg().formEndpoint;
    if (!endpoint) {
      throw new Error('Form endpoint is not configured.');
    }

    const now = Date.now();
    const limit = cfg().formRateLimitMs || 60000;
    if (now - lastSubmitAt < limit) {
      throw new Error('Please wait a moment before submitting again.');
    }
    lastSubmitAt = now;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    let result = { status: 'success' };
    try {
      const text = await response.text();
      if (text) result = JSON.parse(text);
    } catch {
      /* opaque or non-JSON — treat as success if no network error */
    }

    if (result.status === 'error') {
      throw new Error(result.message || 'Submission failed.');
    }

    return result;
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parts = String(e.target.result).split(',');
        resolve({
          fileData: parts[1] || '',
          fileMime: file.type,
          fileName: file.name,
        });
      };
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
  }

  async function buildPayloadFromForm(form, extra) {
    const fd = new FormData(form);
    const hp = fd.get('hp_website');
    if (hp) {
      return null;
    }

    const name = sanitize(fd.get('name') || '', 120);
    const phone = sanitize(fd.get('phone') || '', 20);
    const email = sanitize(fd.get('email') || '', 120);
    const message = sanitize(fd.get('message') || '', 5000);

    if (!name || !validatePhone(phone) || !validateEmail(email) || !message) {
      throw new Error('Please fill in all required fields correctly.');
    }

    const payload = {
      name,
      phone,
      email,
      message,
      company: sanitize(fd.get('company') || '', 200),
      city: sanitize(fd.get('city') || fd.get('location') || '', 120),
      service: sanitize(fd.get('service') || 'General Enquiry', 200),
      budget: sanitize(fd.get('budget') || '', 80),
      sourceUrl: window.location.href,
      fileData: '',
      fileMime: '',
      fileName: '',
    };

    const fileInput = form.querySelector('input[type="file"]');
    const file = fileInput?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit.');
      }
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
      ];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Use PDF, DOCX, PNG, or JPG.');
      }
      Object.assign(payload, await readFileAsBase64(file));
    }

    return Object.assign(payload, extra || {});
  }

  function setButtonLoading(btn, loading, loadingText, defaultText) {
    if (!btn) return;
    btn.disabled = loading;
    const label = btn.querySelector('.btn-label') || btn;
    if (label !== btn && label.textContent !== undefined) {
      label.textContent = loading ? loadingText : defaultText;
    } else if (btn.querySelector('.enq-btn-text')) {
      btn.querySelector('.enq-btn-text').textContent = loading ? loadingText : defaultText;
    } else {
      btn.textContent = loading ? loadingText : defaultText;
    }
    const spin = btn.querySelector('.form-spin, .enq-spinner');
    if (spin) spin.style.display = loading ? 'block' : 'none';
  }

  function showFormMessage(el, type, text) {
    if (!el) return;
    el.className = 'form-feedback form-feedback--' + type;
    el.textContent = text;
    el.hidden = false;
    el.setAttribute('role', 'alert');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function initIndustrialForm() {
    const form = document.getElementById('industrial-contact-form');
    if (!form) return;

    const feedback = document.getElementById('industrial-form-feedback');
    const submitBtn = form.querySelector('.industrial-submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (feedback) feedback.hidden = true;

      try {
        const payload = await buildPayloadFromForm(form);
        if (!payload) return;

        setButtonLoading(submitBtn, true, 'Sending…', 'Request Industrial Consultation');
        await submitEnquiry(payload);
        showFormMessage(
          feedback,
          'success',
          'Thank you! Your inquiry has been received. Our team will contact you within 24 hours.'
        );
        form.reset();
      } catch (err) {
        showFormMessage(
          feedback,
          'error',
          err.message ||
            'Something went wrong. Please call us at ' + (cfg().phoneDisplay || '94232 39466') + '.'
        );
      } finally {
        setButtonLoading(
          submitBtn,
          false,
          'Sending…',
          'Request Industrial Consultation'
        );
      }
    });
  }

  window.PhoenixForms = {
    sanitize,
    validateEmail,
    validatePhone,
    submitEnquiry,
    buildPayloadFromForm,
    showFormMessage,
    setButtonLoading,
    initIndustrialForm,
  };

  document.addEventListener('DOMContentLoaded', initIndustrialForm);
})();
