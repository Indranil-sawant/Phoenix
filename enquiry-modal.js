/* ── ENQUIRY MODAL LOGIC ── */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const modalOverlay = document.getElementById('enqModalOverlay');
  const closeBtn = document.getElementById('enqModalCloseBtn');
  const form = document.getElementById('enqForm');
  const submitBtn = document.getElementById('enqSubmitBtn');
  const btnText = submitBtn.querySelector('.enq-btn-text');
  const spinner = submitBtn.querySelector('.enq-spinner');
  const successView = document.getElementById('enqSuccessView');

  // File Upload Elements
  const fileInput = document.getElementById('enqFile');
  const dropZone = document.getElementById('enqDropZone');
  const fileNameDisplay = document.getElementById('enqFileName');
  const fileHint = dropZone.querySelector('.enq-file-hint');
  
  // REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec';

  let selectedFileBase64 = null;
  let selectedFileMime = null;
  let selectedFileName = null;

  /* ─────────────────────────────────────────────────────────────
     MODAL OPEN/CLOSE LOGIC
  ───────────────────────────────────────────────────────────── */
  
  function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Reset form after closing animation
    setTimeout(resetForm, 400);
  }

  closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Event Delegation for triggers
  document.body.addEventListener('click', (e) => {
    // Find the closest element that matches our trigger selectors
    const btn = e.target.closest('.card-cta, a[href="#contact"], a[href="index.html#contact"], .btn-primary');
    
    if (btn) {
      const text = btn.textContent.toLowerCase();
      // Only prevent default and open modal if it's an enquiry/quote action
      if (text.includes('enquire') || text.includes('enquiry') || 
          text.includes('quote') || text.includes('consultation')) {
        
        e.preventDefault();
        
        // Pre-fill service if clicking from a product card
        const card = btn.closest('.product-card');
        if (card) {
          const category = card.getAttribute('data-category');
          const serviceSelect = document.getElementById('enqService');
          if (serviceSelect) {
            const option = Array.from(serviceSelect.options).find(opt => opt.value === category);
            serviceSelect.value = option ? category : "Other";
          }
        }
        
        openModal();
      }
    }
  });

  /* ─────────────────────────────────────────────────────────────
     FILE UPLOAD HANDLING
  ───────────────────────────────────────────────────────────── */

  const handleFile = (file) => {
    const fileError = document.getElementById('errFile');
    fileError.style.display = 'none';

    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      fileError.textContent = 'File size exceeds 10MB limit.';
      fileError.style.display = 'block';
      fileInput.value = '';
      resetFileUI();
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      fileError.textContent = 'Invalid file type. Only PDF, DOCX, PNG, JPG allowed.';
      fileError.style.display = 'block';
      fileInput.value = '';
      resetFileUI();
      return;
    }

    // Update UI
    fileNameDisplay.textContent = file.name;
    fileNameDisplay.style.display = 'block';
    fileHint.style.display = 'none';

    // Convert to Base64 for Apps Script
    const reader = new FileReader();
    reader.onload = (e) => {
      // e.target.result looks like "data:image/png;base64,iVBORw0KGgo..."
      const base64Data = e.target.result.split(',')[1];
      selectedFileBase64 = base64Data;
      selectedFileMime = file.type;
      selectedFileName = file.name;
    };
    reader.readAsDataURL(file);
  };

  const resetFileUI = () => {
    fileNameDisplay.style.display = 'none';
    fileNameDisplay.textContent = '';
    fileHint.style.display = 'block';
    selectedFileBase64 = null;
    selectedFileMime = null;
    selectedFileName = null;
  };

  fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
  });

  // Drag and Drop
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


  /* ─────────────────────────────────────────────────────────────
     FORM VALIDATION & SUBMISSION
  ───────────────────────────────────────────────────────────── */

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Basic Indian phone validation (optional +91, 10 digits)
    return /^(?:\+91|91)?[-\s]?[6-9]\d{9}$/.test(phone);
  };

  const clearErrors = () => {
    document.querySelectorAll('.enq-error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.enq-input, .enq-textarea').forEach(el => el.classList.remove('error'));
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

    // Honeypot check
    if (document.getElementById('hp_website').value !== '') {
      // Spam detected, silently fail
      resetForm();
      closeModal();
      return;
    }

    let isValid = true;
    
    // Validate Name
    const name = document.getElementById('enqName').value.trim();
    if (!name) {
      showError('enqName', 'errName');
      isValid = false;
    }

    // Validate Phone
    const phone = document.getElementById('enqPhone').value.trim();
    if (!validatePhone(phone)) {
      showError('enqPhone', 'errPhone');
      isValid = false;
    }

    // Validate Email
    const email = document.getElementById('enqEmail').value.trim();
    if (!validateEmail(email)) {
      showError('enqEmail', 'errEmail');
      isValid = false;
    }

    // Validate Message
    const message = document.getElementById('enqMessage').value.trim();
    if (!message) {
      showError('enqMessage', 'errMessage');
      isValid = false;
    }

    if (!isValid) return;

    // Prepare Payload
    const formData = {
      name,
      phone,
      email,
      message,
      company: document.getElementById('enqCompany').value.trim(),
      city: document.getElementById('enqCity').value.trim(),
      service: document.getElementById('enqService').value,
      budget: document.getElementById('enqBudget').value,
      sourceUrl: window.location.href,
      fileData: selectedFileBase64 || '',
      fileMime: selectedFileMime || '',
      fileName: selectedFileName || ''
    };

    // UI Loading State
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    spinner.style.display = 'block';

    try {
      // Send to Google Apps Script
      // NOTE: Uses no-cors or standard CORS depending on script setup.
      // Usually fetch to Apps script uses method POST, body JSON.stringify
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Even if CORS throws an opaque response, we assume success if no exception
      // Alternatively, Google Apps Script can return valid JSON if setup correctly (ContentService)
      
      // Show Success
      successView.classList.add('active');
      btnText.textContent = 'Sent Successfully';
      spinner.style.display = 'none';

      // Auto close after 3.5 seconds
      setTimeout(() => {
        closeModal();
      }, 3500);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again later.');
      submitBtn.disabled = false;
      btnText.textContent = 'Submit Enquiry';
      spinner.style.display = 'none';
    }
  });

});
