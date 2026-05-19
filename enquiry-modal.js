/* ── ENQUIRY MODAL — production build ── */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const modalOverlay = document.getElementById('enqModalOverlay');
  if (!modalOverlay) return;

  const closeBtn = document.getElementById('enqModalCloseBtn');
  const form = document.getElementById('enqForm');
  const submitBtn = document.getElementById('enqSubmitBtn');
  const btnText = submitBtn?.querySelector('.enq-btn-text');
  const spinner = submitBtn?.querySelector('.enq-spinner');
  const successView = document.getElementById('enqSuccessView');
  const fileInput = document.getElementById('enqFile');
  const dropZone = document.getElementById('enqDropZone');
  const fileNameDisplay = document.getElementById('enqFileName');
  const fileHint = dropZone?.querySelector('.enq-file-hint');

  if (!form || !submitBtn || !btnText || !spinner || !successView || !closeBtn || !fileInput || !fileNameDisplay) {
    console.warn('[enquiry-modal] Missing required DOM nodes; modal disabled.');
    return;
  }

  let selectedFileBase64 = null;
  let selectedFileMime = null;
  let selectedFileName = null;

  function openModal() {
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(resetForm, 400);
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });

  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest(
      '.card-cta, a[href="#contact"], a[href="index.html#contact"], .btn-primary, .sticky-cta-quote'
    );
    if (!btn) return;
    const text = btn.textContent.toLowerCase();
    if (
      text.includes('enquire') ||
      text.includes('enquiry') ||
      text.includes('quote') ||
      text.includes('consultation')
    ) {
      if (btn.getAttribute('href') === '#contact' && document.getElementById('industrial-contact-form')) {
        return;
      }
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (card) {
        const category = card.getAttribute('data-category');
        const serviceSelect = document.getElementById('enqService');
        if (serviceSelect && category) {
          const option = Array.from(serviceSelect.options).find((opt) => opt.value === category);
          serviceSelect.value = option ? category : 'Other';
        }
      }
      openModal();
    }
  });

  const handleFile = (file) => {
    const fileError = document.getElementById('errFile');
    fileError.style.display = 'none';
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      fileError.textContent = 'File size exceeds 10MB limit.';
      fileError.style.display = 'block';
      fileInput.value = '';
      resetFileUI();
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ];
    if (!validTypes.includes(file.type)) {
      fileError.textContent = 'Invalid file type. Only PDF, DOCX, PNG, JPG allowed.';
      fileError.style.display = 'block';
      fileInput.value = '';
      resetFileUI();
      return;
    }

    fileNameDisplay.textContent = file.name;
    fileNameDisplay.style.display = 'block';
    if (fileHint) fileHint.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (ev) => {
      selectedFileBase64 = String(ev.target.result).split(',')[1];
      selectedFileMime = file.type;
      selectedFileName = file.name;
    };
    reader.readAsDataURL(file);
  };

  const resetFileUI = () => {
    fileNameDisplay.style.display = 'none';
    fileNameDisplay.textContent = '';
    if (fileHint) fileHint.style.display = 'block';
    selectedFileBase64 = null;
    selectedFileMime = null;
    selectedFileName = null;
  };

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  const clearErrors = () => {
    document.querySelectorAll('.enq-error-msg').forEach((el) => (el.style.display = 'none'));
    document.querySelectorAll('.enq-input, .enq-textarea').forEach((el) => el.classList.remove('error'));
  };

  const showError = (inputId, errId) => {
    document.getElementById(inputId).classList.add('error');
    document.getElementById(errId).style.display = 'block';
  };

  const resetForm = () => {
    form.reset();
    clearErrors();
    resetFileUI();
    successView.classList.remove('active');
    btnText.textContent = 'Submit Enquiry';
    submitBtn.disabled = false;
    spinner.style.display = 'none';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const hp = document.getElementById('hp_website');
    if (hp && hp.value !== '') {
      resetForm();
      closeModal();
      return;
    }

    const forms = window.PhoenixForms;
    if (!forms) {
      alert('Form system failed to load. Please refresh the page.');
      return;
    }

    let isValid = true;
    const name = document.getElementById('enqName').value.trim();
    const phone = document.getElementById('enqPhone').value.trim();
    const email = document.getElementById('enqEmail').value.trim();
    const message = document.getElementById('enqMessage').value.trim();

    if (!name) {
      showError('enqName', 'errName');
      isValid = false;
    }
    if (!forms.validatePhone(phone)) {
      showError('enqPhone', 'errPhone');
      isValid = false;
    }
    if (!forms.validateEmail(email)) {
      showError('enqEmail', 'errEmail');
      isValid = false;
    }
    if (!message) {
      showError('enqMessage', 'errMessage');
      isValid = false;
    }
    if (!isValid) return;

    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    spinner.style.display = 'block';

    const file = fileInput.files?.[0];
    if (file && !selectedFileBase64) {
      try {
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            selectedFileBase64 = String(ev.target.result).split(',')[1];
            selectedFileMime = file.type;
            selectedFileName = file.name;
            resolve();
          };
          reader.onerror = () => reject(new Error('Could not read file.'));
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error(err);
        alert(err.message || 'Could not read the selected file.');
        submitBtn.disabled = false;
        btnText.textContent = 'Submit Enquiry';
        spinner.style.display = 'none';
        return;
      }
    }

    const payload = {
      name: forms.sanitize(name, 120),
      phone: forms.sanitize(phone, 20),
      email: forms.sanitize(email, 120),
      message: forms.sanitize(message, 5000),
      company: forms.sanitize(document.getElementById('enqCompany').value.trim(), 200),
      city: forms.sanitize(document.getElementById('enqCity').value.trim(), 120),
      service: document.getElementById('enqService').value || 'General Enquiry',
      budget: document.getElementById('enqBudget').value || '',
      sourceUrl: window.location.href,
      fileData: selectedFileBase64 || '',
      fileMime: selectedFileMime || '',
      fileName: selectedFileName || '',
    };

    try {
      await forms.submitEnquiry(payload);
      successView.classList.add('active');
      btnText.textContent = 'Sent Successfully';
      spinner.style.display = 'none';
      setTimeout(closeModal, 3500);
    } catch (error) {
      console.error('Enquiry submission error:', error);
      alert(
        error.message ||
          'There was an error submitting your request. Please call us at +91 94232 39466.'
      );
      submitBtn.disabled = false;
      btnText.textContent = 'Submit Enquiry';
      spinner.style.display = 'none';
    }
  });
});
