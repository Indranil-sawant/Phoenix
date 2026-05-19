/**
 * Phoenix Technical Solution — runtime configuration
 * Override before scripts load: window.PHOENIX_CONFIG = { formEndpoint: '...' };
 */
(function () {
  'use strict';

  const defaults = {
    siteUrl: 'https://www.phoenixtechnicalsolution.com',
    businessName: 'Phoenix Technical Solution',
    phone: '+919423239466',
    phoneDisplay: '+91 94232 39466',
    phoneSecondary: '+919890150707',
    whatsapp: '919423239466',
    email: 'phoenixtechnical.solution4411@gmail.com',
    /** Google Apps Script Web App URL — set via deploy env or override */
    formEndpoint:
      'https://script.google.com/macros/s/AKfycbyGb7el3oHFw9SzaFJ-dWUXYcTJi_882ZfQ7w6f8LHCVYgdDgiSGNghs1zbt0Vv6g/exec',
    formRateLimitMs: 60000,
    analyticsId: '',
  };

  window.PHOENIX_CONFIG = Object.assign({}, defaults, window.PHOENIX_CONFIG || {});
})();
