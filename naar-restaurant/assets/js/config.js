/* ============================================================
   NAAR: business settings
   Edit the values below to make the site yours.
   Prices are whole numbers in your currency; the menu lives in menu.js.
   ============================================================ */
window.NAAR_CONFIG = {
  brand: { ar: 'نار', en: 'NAAR' },

  currency: { ar: 'د.ع', en: 'IQD' },
  // Number formats: Arabic text with Western digits, and US English.
  locale: { ar: 'ar-u-nu-latn', en: 'en-US' },

  // WhatsApp number that receives orders, international format, digits only.
  // Example: '9647701234567'. Leave empty and WhatsApp lets the customer pick the chat.
  whatsapp: '',

  // Phone number shown on the page.
  phone: '+964 7XX XXX XXXX',

  // Optional: an URL that accepts the order as JSON (POST).
  // When set, "Place order" sends it there instead of opening WhatsApp.
  orderEndpoint: '',

  deliveryFee: 2000,
  freeDeliveryFrom: 25000,
  minOrder: 5000,
  deliveryMinutes: 30,

  // Opening hours use the restaurant's own time zone.
  timeZone: 'Asia/Baghdad',
  // 0 = Sunday ... 6 = Saturday. 24-hour clock. A closing time after midnight is fine.
  // Remove a day (or set it to null) to mark it closed.
  hours: {
    0: ['11:00', '01:00'],
    1: ['11:00', '01:00'],
    2: ['11:00', '01:00'],
    3: ['11:00', '01:00'],
    4: ['11:00', '02:00'],
    5: ['13:00', '02:00'],
    6: ['11:00', '01:00']
  },

  address: { ar: 'الشارع الرئيسي، وسط المدينة', en: 'Main Street, Downtown' },
  // Paste a Google Maps share link to show the "Open in Maps" button.
  mapsUrl: '',

  // Social links appear in the footer only when filled in.
  social: { instagram: '', tiktok: '', facebook: '' }
};
