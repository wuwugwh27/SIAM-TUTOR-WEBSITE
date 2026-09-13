/**
 * ==========================================================================
 * SIAM TUTOR - Production Website Script
 * ==========================================================================
 * Features:
 *  - Centralized site configuration (Tutor, Phone, WhatsApp, Service Area)
 *  - Dynamic config hydration across links and UI text
 *  - Accessible mobile hamburger navigation drawer
 *  - Accessible FAQ accordion (keyboard & ARIA support)
 *  - Robust Bengali form validation (Bangladeshi phone format, required fields)
 *  - Accessible submission modal feedback
 * ==========================================================================
 */

/* ==========================================================================
   CONFIG AREA: EASY TO EDIT
   Update these values whenever tutor contact or service details change.
   All phone links, WhatsApp links, service area badges, and tutor credits
   will automatically sync across the entire website.
   ========================================================================== */
const SIAM_TUTOR_CONFIG = {
  // Tutor Identity
  tutorName: "সিয়াম হোসেন",
  tutorTitle: "নবম-দশম শ্রেণির গণিত গৃহশিক্ষক",
  institution: "Govt. Devendra College, Manikganj",
  academicLevel: "Honours 1st Year (Political Science)",

  // Contact Numbers
  phoneNumberDisplay: "সরাসরি কল করুন",           // Clean action text without visual clutter
  phoneTel: "tel:+8801604546974",                  // Direct telephone link (opens dialer on mobile)
  whatsappNumber: "8801604546974",                 // WhatsApp international digits without '+' (opens chat)
  whatsappPrefillText: "Hello Siam Tutor, I want to know about Class 9-10 Math Tuition.",

  // Service Location & Scope
  serviceArea: "মানিকগঞ্জ সদর ও পার্শ্ববর্তী এলাকা",
  tuitionType: "হোম টিউশন (মানিকগঞ্জ)",
  subjectsTaught: "সাধারণ গণিত ও উচ্চতর গণিত",

  // Optional Email (if needed in future)
  email: "", // e.g. "contact@siamtutor.com"

  // Availability Status
  seatAvailable: true,
  statusText: "টিউশন সিট ফাঁকা আছে"
};

// Make config globally accessible for debugging or third-party hooks
window.SIAM_TUTOR_CONFIG = SIAM_TUTOR_CONFIG;

/* ==========================================================================
   Main Application Logic
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initSiteConfig();
  initMobileNavigation();
  initFaqAccordion();
  initInquiryForm();
  initModalHandling();
});

/**
 * Sync centralized configuration values across DOM elements
 */
function initSiteConfig() {
  const config = window.SIAM_TUTOR_CONFIG;

  // 1. Sync Phone Telephone Links
  const phoneLinks = document.querySelectorAll('a[data-config="phone-link"]');
  phoneLinks.forEach(link => {
    link.href = config.phoneTel;
  });

  // 2. Sync Phone Text Displays
  const phoneTexts = document.querySelectorAll('[data-config="phone-display"]');
  phoneTexts.forEach(el => {
    el.textContent = config.phoneNumberDisplay;
  });

  // 3. Sync WhatsApp Links with URL-encoded message
  const whatsappLinks = document.querySelectorAll('a[data-config="whatsapp-link"]');
  const encodedMsg = encodeURIComponent(config.whatsappPrefillText);
  const waUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMsg}`;
  whatsappLinks.forEach(link => {
    link.href = waUrl;
  });

  // 4. Sync Service Area Texts
  const areaElements = document.querySelectorAll('[data-config="service-area"]');
  areaElements.forEach(el => {
    el.textContent = config.serviceArea;
  });

  // 5. Sync Tutor Name
  const tutorNameElements = document.querySelectorAll('[data-config="tutor-name"]');
  tutorNameElements.forEach(el => {
    el.textContent = config.tutorName;
  });
}

/**
 * Mobile Navigation Drawer Toggle & Accessible Keyboard Control
 */
function initMobileNavigation() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!menuBtn || !mobileNav) return;

  function toggleMenu(forceClose = false) {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    menuBtn.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) {
      mobileNav.classList.remove('is-hidden');
      if (menuIcon) menuIcon.classList.add('is-hidden');
      if (closeIcon) closeIcon.classList.remove('is-hidden');
    } else {
      mobileNav.classList.add('is-hidden');
      if (menuIcon) menuIcon.classList.remove('is-hidden');
      if (closeIcon) closeIcon.classList.add('is-hidden');
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any nav anchor link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      toggleMenu(true);
      menuBtn.focus();
    }
  });

  // Close when clicking outside of header
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
      if (menuBtn.getAttribute('aria-expanded') === 'true') {
        toggleMenu(true);
      }
    }
  });
}

/**
 * Accessible FAQ Accordion with Keyboard Navigation
 */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-trigger');

  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const targetPanelId = button.getAttribute('aria-controls');
      const panel = document.getElementById(targetPanelId);
      const card = button.closest('.faq-card');
      const icon = button.querySelector('.faq-icon');

      // Close all other panels for clean accordion focus
      faqButtons.forEach(otherBtn => {
        if (otherBtn !== button) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if (otherPanel) {
            otherPanel.classList.remove('is-open');
          }
          const otherCard = otherBtn.closest('.faq-card');
          if (otherCard) otherCard.classList.remove('is-open');
          const otherIcon = otherBtn.querySelector('.faq-icon');
          if (otherIcon) otherIcon.textContent = '＋';
        }
      });

      // Toggle current panel
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        if (panel) panel.classList.remove('is-open');
        if (card) card.classList.remove('is-open');
        if (icon) icon.textContent = '＋';
      } else {
        button.setAttribute('aria-expanded', 'true');
        if (panel) panel.classList.add('is-open');
        if (card) card.classList.add('is-open');
        if (icon) icon.textContent = '−';
      }
    });

    // Keyboard support: Arrow navigation between accordion items
    button.addEventListener('keydown', (e) => {
      const btnList = Array.from(faqButtons);
      const index = btnList.indexOf(button);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = btnList[(index + 1) % btnList.length];
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = btnList[(index - 1 + btnList.length) % btnList.length];
        prev.focus();
      }
    });
  });
}

/**
 * Form Validation & Submission Handling
 */
function initInquiryForm() {
  const form = document.getElementById('tuition-form');
  if (!form) return;

  const parentName = document.getElementById('parentName');
  const studentClass = document.getElementById('studentClass');
  const subjectSelect = document.getElementById('subjectSelect');
  const phoneNumber = document.getElementById('phoneNumber');
  const address = document.getElementById('address');
  const studentNeeds = document.getElementById('studentNeeds');

  // Regex for Bangladeshi phone number validation:
  // Matches: 013XXXXXXXX, 017XXXXXXXX, +88017XXXXXXXX, 88017XXXXXXXX
  const bdPhoneRegex = /^(?:\+?88|88)?01[3-9]\d{8}$/;

  function setFieldError(field, errorElId, message) {
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    const errEl = document.getElementById(errorElId);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('is-visible');
    }
  }

  function clearFieldError(field, errorElId) {
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    const errEl = document.getElementById(errorElId);
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('is-visible');
    }
  }

  // Live validation on blur
  parentName.addEventListener('blur', () => {
    if (!parentName.value.trim() || parentName.value.trim().length < 2) {
      setFieldError(parentName, 'parentNameError', 'অনুগ্রহ করে অভিভাবক বা শিক্ষার্থীর পূর্ণ নাম লিখুন।');
    } else {
      clearFieldError(parentName, 'parentNameError');
    }
  });

  studentClass.addEventListener('change', () => {
    if (!studentClass.value) {
      setFieldError(studentClass, 'studentClassError', 'অনুগ্রহ করে শিক্ষার্থীর শ্রেণি নির্বাচন করুন।');
    } else {
      clearFieldError(studentClass, 'studentClassError');
    }
  });

  subjectSelect.addEventListener('change', () => {
    if (!subjectSelect.value) {
      setFieldError(subjectSelect, 'subjectSelectError', 'অনুগ্রহ করে পাঠদানের বিষয় নির্বাচন করুন।');
    } else {
      clearFieldError(subjectSelect, 'subjectSelectError');
    }
  });

  phoneNumber.addEventListener('blur', () => {
    const cleanNum = phoneNumber.value.replace(/[\s-]/g, '');
    if (!cleanNum) {
      setFieldError(phoneNumber, 'phoneNumberError', 'যোগাযোগের জন্য মোবাইল নম্বর আবশ্যক।');
    } else if (!bdPhoneRegex.test(cleanNum)) {
      setFieldError(phoneNumber, 'phoneNumberError', 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।');
    } else {
      clearFieldError(phoneNumber, 'phoneNumberError');
    }
  });

  address.addEventListener('blur', () => {
    if (!address.value.trim() || address.value.trim().length < 3) {
      setFieldError(address, 'addressError', 'অনুগ্রহ করে মানিকগঞ্জের নির্দিষ্ট এলাকা বা ঠিকানা লিখুন।');
    } else {
      clearFieldError(address, 'addressError');
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidField = null;

    // Validate Name
    if (!parentName.value.trim() || parentName.value.trim().length < 2) {
      setFieldError(parentName, 'parentNameError', 'অনুগ্রহ করে অভিভাবক বা শিক্ষার্থীর পূর্ণ নাম লিখুন।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = parentName;
    } else {
      clearFieldError(parentName, 'parentNameError');
    }

    // Validate Class
    if (!studentClass.value) {
      setFieldError(studentClass, 'studentClassError', 'অনুগ্রহ করে শিক্ষার্থীর শ্রেণি নির্বাচন করুন।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = studentClass;
    } else {
      clearFieldError(studentClass, 'studentClassError');
    }

    // Validate Subject
    if (!subjectSelect.value) {
      setFieldError(subjectSelect, 'subjectSelectError', 'অনুগ্রহ করে পাঠদানের বিষয় নির্বাচন করুন।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = subjectSelect;
    } else {
      clearFieldError(subjectSelect, 'subjectSelectError');
    }

    // Validate Phone
    const cleanNum = phoneNumber.value.replace(/[\s-]/g, '');
    if (!cleanNum) {
      setFieldError(phoneNumber, 'phoneNumberError', 'যোগাযোগের জন্য মোবাইল নম্বর আবশ্যক।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneNumber;
    } else if (!bdPhoneRegex.test(cleanNum)) {
      setFieldError(phoneNumber, 'phoneNumberError', 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneNumber;
    } else {
      clearFieldError(phoneNumber, 'phoneNumberError');
    }

    // Validate Address
    if (!address.value.trim() || address.value.trim().length < 3) {
      setFieldError(address, 'addressError', 'অনুগ্রহ করে মানিকগঞ্জের নির্দিষ্ট এলাকা বা ঠিকানা লিখুন।');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = address;
    } else {
      clearFieldError(address, 'addressError');
    }

    if (!isValid) {
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // Capture Submission Data
    const formData = {
      name: parentName.value.trim(),
      studentClass: studentClass.value,
      subject: subjectSelect.value,
      phone: phoneNumber.value.trim(),
      address: address.value.trim(),
      notes: studentNeeds ? studentNeeds.value.trim() : ''
    };

    // Show Beautiful Confirmation Modal
    showSuccessModal(formData);

    // Reset Form cleanly
    form.reset();
  });
}

/**
 * Submission Confirmation Modal
 */
function showSuccessModal(data) {
  const modal = document.getElementById('submission-modal');
  if (!modal) {
    alert(`ধন্যবাদ ${data.name}! আপনার টিউশন অনুরোধটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই সিয়াম হোসেন আপনার সাথে যোগাযোগ করবেন।`);
    return;
  }

  // Populate Details
  const detailsBox = document.getElementById('modal-details-content');
  if (detailsBox) {
    detailsBox.innerHTML = `
      <div><strong>নাম:</strong> ${escapeHtml(data.name)}</div>
      <div><strong>শ্রেণি:</strong> ${escapeHtml(data.studentClass)}</div>
      <div><strong>বিষয়:</strong> ${escapeHtml(data.subject)}</div>
      <div><strong>মোবাইল:</strong> ${escapeHtml(data.phone)}</div>
      <div><strong>এলাকা:</strong> ${escapeHtml(data.address)}</div>
      ${data.notes ? `<div><strong>মন্তব্য:</strong> ${escapeHtml(data.notes)}</div>` : ''}
    `;
  }

  // Setup WhatsApp Instant Forward Button
  const waModalBtn = document.getElementById('modal-wa-btn');
  if (waModalBtn) {
    const waText = encodeURIComponent(
      `Hello Siam Tutor,\nI have submitted a tuition request:\nName: ${data.name}\nClass: ${data.studentClass}\nSubject: ${data.subject}\nPhone: ${data.phone}\nArea: ${data.address}`
    );
    waModalBtn.href = `https://wa.me/${window.SIAM_TUTOR_CONFIG.whatsappNumber}?text=${waText}`;
  }

  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');

  const closeBtn = modal.querySelector('.btn-modal-close');
  if (closeBtn) closeBtn.focus();
}

function initModalHandling() {
  const modal = document.getElementById('submission-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('modal-close-btn');
  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/**
 * Utility: HTML escape for XSS defense
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
