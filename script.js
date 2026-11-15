/* Store details and the unified PRODUCTS catalog live in catalog-data.js. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
let lang=read('lg-language','ar');if(!['ar','en'].includes(lang))lang='ar';
let favorites=read('lg-favorites',[]),comparison=read('lg-comparison',[]);
if(!Array.isArray(favorites))favorites=[];if(!Array.isArray(comparison))comparison=[];
favorites=favorites.filter(id=>PRODUCTS.some(p=>p.id===id));comparison=comparison.filter(id=>PRODUCTS.some(p=>p.id===id)).slice(0,3);
const ui={
 galleryKitchenView:['المطبخ والشاشات','Kitchen and television view'],
 galleryTvWall:['جدار الشاشات','Television wall'],
 galleryScreensWide:['عرض الشاشات الواسع','Wide screen display'],
 galleryMainAisle:['الممر الرئيسي','Main showroom aisle'],
 galleryWashAndCool:['الغسالات والثلاجات','Washers and refrigerators'],
 galleryApplianceAisle:['ممر الأجهزة','Appliance aisle'],
 galleryWashersRow:['صف الغسالات','Washer lineup'],
 gallerySmallKitchen:['أجهزة المطبخ','Kitchen appliances'],
 galleryGraphite:['غسالات باللون الفحمي','Graphite washing machines'],
 galleryKitchenArea:['ركن المطبخ','Kitchen display'],
 galleryScreenPair:['ركن الشاشات','Television corner'],
 galleryFloorCare:['أجهزة العناية بالأرضيات','Floor care appliances'],
 galleryUhd:['عرض شاشات UHD','UHD display'],
 galleryNanoWall:['جدار شاشات NanoCell','NanoCell television wall'],
 galleryNanoDetail:['شاشة NanoCell','NanoCell television'],
 galleryIntro:['مرّر لتتجوّل بين أقسام معرض LG لدى مجموعة وسيم السيد.','Scroll through the LG displays at Waseem Al Sayed Group.'],
 galleryExpand:['عرض كل الصور','Show all photos'],galleryCollapse:['إخفاء الصور المصغّرة','Hide thumbnails'],
 showroomTvDetail:['شاشات LG مرتّبة للمشاهدة جنبًا إلى جنب.','LG screens displayed side by side.'],
 showroomFridgesDetail:['واجهات زجاجية وتشطيبات معدنية في صف واحد.','Glass fronts and metal finishes in one lineup.'],
 showroomLaundryDetail:['غسالات بتحميل أمامي وتشطيبات متعددة.','Front-load washers in a range of finishes.'],
 galleryKitchenViewDetail:['لقطة تجمع أجهزة المطبخ والشاشات في المعرض.','A view bringing kitchen appliances and screens together.'],
 galleryTvWallDetail:['شاشات بأحجام مختلفة على رفوف العرض.','Screens of different sizes across the display shelves.'],
 galleryScreensWideDetail:['لقطة واسعة تظهر ترتيب الشاشات على امتداد الجدار.','A wide view of the screens along the display wall.'],
 galleryMainAisleDetail:['جولة بصرية بين صفوف الأجهزة تحت إضاءة دافئة.','A walk through rows of appliances under warm lighting.'],
 galleryWashAndCoolDetail:['قسمان من المعرض في لقطة واحدة.','Two showroom displays in a single view.'],
 galleryApplianceAisleDetail:['زاوية ممتدة على صفوف الأجهزة المنزلية.','An extended view down the home-appliance aisle.'],
 galleryWashersRowDetail:['صف من الغسالات يبيّن اختلاف الألوان والواجهات.','A washer lineup showing different colors and finishes.'],
 gallerySmallKitchenDetail:['أجهزة المطبخ كما تظهر على رفوف المعرض.','Kitchen appliances on the showroom shelves.'],
 galleryGraphiteDetail:['لقطة مقرّبة للتشطيبات الفحميّة وتفاصيل الواجهات.','A closer look at graphite finishes and front panels.'],
 galleryKitchenAreaDetail:['عرض لأجهزة المطبخ بتشطيبات سوداء ومعدنية.','Kitchen appliances in black and metal finishes.'],
 galleryScreenPairDetail:['زاوية أخرى لعرض شاشات LG.','Another angle on the LG screen display.'],
 galleryFloorCareDetail:['عرض للمكنسة الروبوتية ضمن أجهزة العناية بالأرضيات.','A robot vacuum in the floor-care display.'],
 galleryUhdDetail:['لقطة لشاشة UHD ضمن مساحة العرض.','A UHD television in the showroom display.'],
 galleryNanoWallDetail:['لقطة واسعة لجدار شاشات NanoCell.','A wide view of the NanoCell television wall.'],
 galleryNanoDetailDetail:['نظرة أقرب إلى شاشة NanoCell في المعرض.','A closer view of a NanoCell television.'],
 showroomGallery:['داخل المعرض','Inside the showroom'],showroomTv:['قسم الشاشات','Television display'],showroomFridges:['قسم الثلاجات','Refrigerator display'],showroomLaundry:['قسم الغسالات','Laundry display'],
 fridgeMotion:['ثلاجة LG يفتح باباها ويغلقان','LG refrigerator with opening and closing doors'],
 back:['رجوع','Back'],
 pauseTv:['إيقاف حركة شاشة التلفزيون','Pause TV display'],playTv:['تشغيل حركة شاشة التلفزيون','Play TV display'],
 discoverCollection:['اكتشف المجموعة','Explore the collection'],backTop:['العودة إلى الأعلى','Back to top'],zoomShowroom:['تكبير مشهد المعرض','Enlarge showroom image'],
 skipIntro:['تخطّي شاشة البداية','Skip introduction'],
 previousSlide:['المشهد السابق','Previous slide'],nextSlide:['المشهد التالي','Next slide'],
 pauseSlide:['إيقاف الحركة','Pause slideshow'],playSlide:['تشغيل الحركة','Play slideshow'],
 openMenu:['فتح القائمة','Open menu'],close:['إغلاق','Close'],
 navHome:['الرئيسية','Home'],navCollection:['المجموعة','Collection'],navProducts:['المنتجات','Products'],navStory:['التجربة','Experience'],navShowroom:['المعرض','Showroom'],
 heroTitle:['<span class="hero-line"><span>تفاصيل أذكى.</span></span> <span class="hero-line"><span>حياة أجمل.</span></span>','<span class="hero-line"><span>SMARTER DETAILS.</span></span> <span class="hero-line"><span>BETTER LIVING.</span></span>'],heroDescription:['كل جهاز مساحة جديدة للحياة. اكتشف الموديلات، شاهد تفاصيلها، واختر ما يناسب منزلك.','Discover the models, explore every detail, and choose what belongs in your home.'],exploreProducts:['استكشف المنتجات','EXPLORE PRODUCTS'],
 ourPerspective:['رؤيتنا','OUR VIEW'],statementKicker:['التكنولوجيا داخل منزلك','TECHNOLOGY AT HOME'],statementTitle:['الجهاز المناسب<br><em>يغيّر كل التفاصيل.</em>','THE RIGHT APPLIANCE<br><em>CHANGES EVERYTHING.</em>'],statementBody:['من اللحظة الأولى وحتى أدق المواصفات، صممنا هذه التجربة لتمنحك رؤية أوضح لكل خيار في معرضنا.','From the first impression to the finest specification, explore every showroom option with clarity.'],
 categories:['الفئات','CATEGORIES'],collectionKicker:['من غرفة إلى أخرى','ROOM TO ROOM'],collectionTitle:['عالم من<br> الاحتمالات.','A WORLD OF<br> POSSIBILITIES.'],collectionBody:['اختيارات منزلية صُممت لتجعل كل يوم أسهل وأكثر جمالًا.','Home choices to make every day simpler and more beautiful.'],
 featureTitle:['لحظاتك الكبيرة<br>تبدأ من هنا.','YOUR BIG MOMENTS<br>START HERE.'],featureBody:['تجربة مشاهدة ومساحات منزلية تستحق تفاصيل أقرب.','Viewing experiences and living spaces deserve a closer look.'],featureAction:['اكتشف الشاشات','EXPLORE TELEVISIONS'],
 catalog:['الكتالوج','CATALOG'],catalogKicker:['اختر ما يناسبك','FIND YOUR FIT'],catalogTitle:['كل منتج<br>له قصته.','EVERY PRODUCT<br>HAS A STORY.'],catalogBody:['صور واضحة، مواصفات موثّقة للموديلات المضافة، ومقارنة تساعدك على الاختيار.','Clear visuals, documented model specifications, and a useful comparison.'],
 search:['بحث','Search'],searchPlaceholder:['ابحث عن اسم المنتج أو الموديل','Search by name or model'],filter:['الفلاتر','Filters'],sortDefault:['ترتيب افتراضي','Featured'],sortName:['الاسم','Name'],sortSmall:['السعة: الأصغر','Capacity: smaller'],sortLarge:['السعة: الأكبر','Capacity: larger'],clearFilters:['مسح الفلاتر','Clear filters'],emptyTitle:['لا توجد نتائج مطابقة','No matching results'],emptyBody:['جرّب اسمًا آخر أو امسح الفلاتر.','Try another search or clear filters.'],catalogNote:['الموديلات التجريبية موضحة بوضوح. حالة توفر الموديلات الفعلية تحتاج تأكيدًا من المعرض؛ الصور المعزولة تمثيل بصري.','Demo entries are clearly marked. Confirm actual model availability with the showroom; isolated visuals are illustrative.'],
 visit:['الزيارة','VISIT'],showroomKicker:['معرض الأجهزة المنزلية','HOME APPLIANCE SHOWROOM'],showroomBody:['تصفّح شاشات LG والثلاجات والغسالات والمكيّفات. راجع المواصفات، وقارن الموديلات قبل الاستفسار من المعرض عن التوفّر.','Browse LG TVs, refrigerators, washers and air conditioners. Check specifications and compare models before asking the showroom about availability.'],showroomAction:['تصفّح المنتجات','EXPLORE PRODUCTS'],showroomConceptNote:['الواجهة تصوّر بصري، ولقطات الداخل معالجة من صور المعرض.','The exterior is an illustration. Interior views are enhanced from showroom photos.'],exploreShowroom:['شاهد المشهد كاملًا','VIEW THE SCENE'],address:['العنوان','Address'],hours:['ساعات العمل','Hours'],phone:['الهاتف / واتساب','Phone / WhatsApp'],legal:['معرض يبيع منتجات LG، وليس الموقع الرسمي للعلامة التجارية.','A showroom selling LG products. Not the official LG website.'],
 inquiryTitle:['نص الاستفسار','Inquiry message'],inquiryHelp:['لم يُضف رقم واتساب بعد. انسخ النص وأرسله إلى المعرض.','No WhatsApp number has been added yet. Copy this message to contact the showroom.'],copy:['نسخ النص','Copy message'],availability:['حالة التوفر','Availability'],available:['متوفر','Available'],order:['حسب الطلب','On request'],unavailable:['غير متوفر','Unavailable'],unknown:['يحتاج تأكيدًا','To confirm'],favoritesOnly:['المفضلة فقط','Favorites only'],showResults:['عرض النتائج','Show results'],compareNow:['قارن الآن','Compare now'],all:['الكل','All'],results:['منتج','products'],demo:['نموذج تجريبي','DEMO'],discover:['استكشف المنتج','EXPLORE PRODUCT'],details:['التفاصيل','DETAILS'],specifications:['المواصفات','SPECIFICATIONS'],similar:['منتجات مشابهة','SIMILAR PRODUCTS'],inquire:['استفسر عن المنتج','ASK ABOUT THIS PRODUCT'],restock:['استفسر عن موعد التوفر','ASK ABOUT RESTOCK'],favorite:['المفضلة','Favorite'],compare:['المقارنة','Compare'],remove:['إزالة','Remove'],sameCategory:['اختر منتجات من الفئة نفسها للمقارنة.','Compare products in the same category.'],compareLimit:['يمكن مقارنة ثلاثة منتجات كحد أقصى.','Compare up to three products.'],needTwo:['اختر منتجين على الأقل للمقارنة.','Choose at least two products to compare.'],saved:['تم التحديث','Updated'],price:['السعر','Price'],askPrice:['استفسر عن السعر','Ask for price'],source:['مصدر المواصفات','Specifications source'],visual:['عرض بصري توضيحي','Illustrative visual'],zoom:['تكبير الصورة','Zoom image'],
 assistantTitle:['دليل الاختيار الذكي','SMART CHOICE GUIDE'],assistantIntro:['اقتراح يعتمد على المواصفات المدخلة فقط. أخبرنا ما الذي يهمك.','A suggestion based only on entered specifications. What matters to you?'],assistantLarge:['أريد الأكبر','I prefer larger'],assistantSmall:['أريد الأصغر','I prefer smaller'],assistantEnergy:['استهلاك الطاقة','Energy use'],assistantDifference:['ما الفروق؟','What differs?'],assistantPlaceholder:['اسأل عن السعة أو استهلاك الطاقة...','Ask about capacity or energy...'],assistantSend:['اسأل','Ask'],assistantDisclaimer:['هذا دليل آلي يعتمد على بيانات الملصقات، وليس مخزونًا مباشرًا أو خدمة ذكاء اصطناعي متصلة.','This automatic guide uses label data; it is not live inventory or a connected AI service.'],insufficient:['البيانات المسجلة لا تكفي للحسم في هذه النقطة. اسأل المعرض قبل القرار.','The recorded data is insufficient for this choice. Ask the showroom before deciding.']
};
const t=k=>(ui[k]||[k,k])[lang==='ar'?0:1], local=v=>typeof v==='object'&&v!==null?(v[lang]??v.ar??v.en??''):v??'';
const categoryName=id=>{const c=CATEGORIES.find(x=>x[0]===id);return c?c[lang==='ar'?1:2]:t('all')};
let state={category:'all',query:'',sort:'default',statuses:[],favoritesOnly:false};
let current=null,currentImage=0,slide=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,slideTimer,slideTransition,toastTimer;
const pageViews = [];
const navigationSession = String(performance.timeOrigin);
let pagePosition = 0;
let browserNavigation = false;
const productTrail = [];
let menuTrigger, filterTrigger;
const slides=[
 {src:'assets/lg-glb-582gvlp-cutout.webp',alt:['ثلاجة LG','LG refrigerator']},
 {src:'assets/hero-ac-cutout.webp',device:'ac',alt:['مكيّف LG','LG air conditioner']},
 {src:'assets/hero-fridge-cutout.webp',device:'fridge',alt:['ثلاجة LG','LG refrigerator']},
 {src:'assets/hero-washer-cutout.webp',alt:['غسالة LG','LG washing machine']}
];
function persist(){try{localStorage.setItem('lg-language',JSON.stringify(lang));localStorage.setItem('lg-favorites',JSON.stringify(favorites));localStorage.setItem('lg-comparison',JSON.stringify(comparison))}catch{}}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function syncScrollLock() {
  document.body.classList.toggle('modal-open',
    !$('#menu-overlay').hidden || !$('#filter-panel').hidden || !!$('dialog[open]'));
}
function setMenu(open, restoreFocus = true) {
  const menu = $('#menu-overlay');
  if (menu.hidden === !open) return;
  if (open) menuTrigger = document.activeElement;
  menu.hidden = !open;
  $('#menu-open').setAttribute('aria-expanded', String(open));
  syncScrollLock();
  if (open) $('#menu-close').focus({preventScroll: true});
  else if (restoreFocus) menuTrigger?.focus({preventScroll: true});
}
function setFilters(open, restoreFocus = true) {
  const panel = $('#filter-panel');
  if (panel.hidden === !open) return;
  if (open) filterTrigger = document.activeElement;
  panel.hidden = !open;
  $('#filter-toggle').setAttribute('aria-expanded', String(open));
  syncScrollLock();
  if (open) $('#filter-close').focus({preventScroll: true});
  else if (restoreFocus) filterTrigger?.focus({preventScroll: true});
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
  syncScrollLock();
}
function closeDialog(id) {
  document.getElementById(id).close();
  syncScrollLock();
}
function revealHome() {
  if (!location.hash || location.hash === '#top') $('.hero').classList.add('home-arrived');
}

function resetHomeOnReload() {
  if (performance.getEntriesByType('navigation')[0]?.type !== 'reload') return false;

  history.scrollRestoration = 'manual';
  setSectionHash('');
  window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  window.addEventListener('pageshow', () => {
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  }, {once: true});
  return true;
}

function showWelcome(reloadingHome) {
  const dialog = $('#welcome-intro');
  if ((location.hash && location.hash !== '#top') || typeof dialog.showModal !== 'function') return false;

  const welcomeKey = 'lg-showroom-welcome-v36';
  try {
    if (!reloadingHome && sessionStorage.getItem(welcomeKey)) return false;
    sessionStorage.setItem(welcomeKey, 'seen');
  } catch {}

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const skip = $('#welcome-skip');
  let exitTimer;
  function finish() {
    if (!dialog.open || dialog.classList.contains('welcome-leaving')) return;
    if (!motion.matches) {
      closeDialog(dialog.id);
      return;
    }
    dialog.classList.add('welcome-leaving');
    exitTimer = setTimeout(() => closeDialog(dialog.id), 320);
  }

  skip.addEventListener('click', finish, {once: true});
  openDialog(dialog.id);

  const autoExit = setTimeout(finish, motion.matches ? 2380 : 1300);
  dialog.addEventListener('close', () => {
    clearTimeout(autoExit);
    clearTimeout(exitTimer);
    skip.removeEventListener('click', finish);
    revealHome();
  }, {once:true});
  return true;
}

function syncSlideControls() {
  const button = $('#slide-toggle');
  button.setAttribute('aria-label', t(paused ? 'playSlide' : 'pauseSlide'));
  button.querySelector('path').setAttribute('d', paused ? 'M8 5l11 7-11 7z' : 'M9 5v14m6-14v14');
  $('.hero').toggleAttribute('data-motion-paused', paused);
  $('#hero-image').alt = slides[slide].alt[lang === 'ar' ? 0 : 1];
}
function setSlide(index) {
  clearTimeout(slideTransition);
  slide = (index + slides.length) % slides.length;
  const stage = $('#hero-stage');
  const next = slides[slide];
  stage.classList.add('changing');
  slideTransition = setTimeout(() => {
    $('#hero-image').src = next.src;
    stage.dataset.device = next.device || 'still';
    syncSlideControls();
    stage.classList.remove('changing');
  }, 145);
  startSlideTimer();
}
function startSlideTimer() {
  clearTimeout(slideTimer);
  if (paused) return;
  slideTimer = setTimeout(() => setSlide(slide + 1), slides[slide].device === 'fridge' ? 6000 : 5200);
}
function syncLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$$('[data-t]').forEach(el=>{el.innerHTML=t(el.dataset.t)});$$('[data-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.aria)));syncSlideControls();$('#search').placeholder=t('searchPlaceholder');$('#language').textContent=lang==='ar'?'EN':'ع';$('#language').setAttribute('aria-label',lang==='ar'?'Switch to English':'التبديل إلى العربية');$$('[data-shop-name]').forEach(el=>el.textContent=local(SHOP.name));$('#shop-address').textContent=local(SHOP.address)|| (lang==='ar'?'يُضاف قريبًا':'To be added');$('#shop-hours').textContent=local(SHOP.hours)||(lang==='ar'?'تُحدّد قريبًا':'To be confirmed');$('#shop-phone').textContent=SHOP.phone||SHOP.whatsapp||(lang==='ar'?'يُضاف قريبًا':'To be added');$('#showroom-info').hidden=!(local(SHOP.address)||local(SHOP.hours)||SHOP.phone||SHOP.whatsapp);renderCollection();renderCategories();renderProducts();updateCounters();if(current&&$('#product-dialog').open)renderDetail();if($('#compare-dialog').open)renderComparison()}
const collectionCategories = [
  ['fridge', 'lg-grb-862bvlb-cutout.webp'],
  ['tv', 'product-tv-cutout.webp'],
  ['washer', 'hero-washer-cutout.webp'],
  ['ac', 'hero-ac-cutout.webp'],
  ['kitchen', 'collection-microwave.webp']
];
function renderCollection() {
  $('#category-list').innerHTML = collectionCategories.map(([id, file]) => {
    const [, arabicName, englishName] = CATEGORIES.find(category => category[0] === id);
    const name = lang === 'ar' ? arabicName : englishName;
    return `<button type="button" class="category-card category-card--${id} reveal" data-category="${id}" aria-label="${esc(name)}">
      <span class="category-card-heading">
        <span class="category-card-label">
          <strong>${esc(name)}</strong>
          ${lang === 'ar' ? `<small dir="ltr">${esc(englishName)}</small>` : ''}
        </span>
        <span class="category-card-arrow">${detailIcon}</span>
      </span>
      <span class="category-card-visual" aria-hidden="true">
        <img src="assets/${file}" alt="" fetchpriority="low" decoding="async">
      </span>
    </button>`;
  }).join('');
  observeReveal();
}
function renderCategories() {
  const names = [['all', t('all')], ...CATEGORIES.map(([id]) => [id, categoryName(id)])];
  const choices = names.map(([id, name]) => {
    const active = state.category === id;
    return `<button type="button" data-category="${id}" class="${active ? 'active' : ''}" aria-pressed="${active}">${esc(name)}</button>`;
  }).join('');
  $('#category-chips').innerHTML = choices;
  $('#filter-categories').innerHTML = `<div class="filter-categories">${choices}</div>`;
}
function visibleProducts(){let list=PRODUCTS.filter(p=>(state.category==='all'||p.category===state.category)&&(!state.favoritesOnly||favorites.includes(p.id))&&(!state.statuses.length||state.statuses.includes(p.availability))&&(!state.query||[local(p.name),p.name.ar,p.name.en,p.model].join(' ').toLocaleLowerCase().includes(state.query.toLocaleLowerCase())));if(state.sort==='name')list.sort((a,b)=>local(a.name).localeCompare(local(b.name),lang));if(state.sort.startsWith('size-'))list.sort((a,b)=>{const n=p=>Number(p.attribute)||0;return state.sort==='size-asc'?n(a)-n(b):n(b)-n(a)});return list}
const detailIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>';
const favoriteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z"/></svg>';
const productTint = new Map();
const categoryTintCount = new Map();
const tintOffsets = [0, 20, -20, 13, -11, 28, -28, -35, 35];
for (const {id, category} of PRODUCTS) {
  const order = categoryTintCount.get(category) ?? 0;
  productTint.set(id, tintOffsets[order % tintOffsets.length]);
  categoryTintCount.set(category, order + 1);
}

function productCard(product) {
  const {id, model, category, availability, demo} = product;
  const name = esc(local(product.name));
  const image = product.images?.[0];
  const features = local(product.features) || [];
  const favorite = favorites.includes(id);
  const compared = comparison.includes(id);
  return `<article class="product-card" data-product-category="${esc(category)}" style="--card-hue-offset:${productTint.get(id)}">
    <button type="button" class="card-image" data-detail="${id}" aria-label="${t('discover')}: ${name}">
      <span class="card-label">${demo ? t('demo') : esc(model)}</span>
      ${image ? `<img src="${esc(image)}" alt="" width="480" height="480" loading="lazy">` : '<span class="image-placeholder">LG</span>'}
      <span class="image-arrow">${detailIcon}</span>
    </button>
    <button type="button" class="card-fav" data-favorite="${id}" aria-label="${t('favorite')}: ${name}" aria-pressed="${favorite}">${favoriteIcon}</button>
    <div class="card-info">
      <div class="card-meta"><span>${esc(categoryName(category))}</span><span dir="ltr">${esc(model)}</span></div>
      <h3>${name}</h3>
      <div class="card-features">${features.slice(0,3).map(feature => `<span>${esc(feature)}</span>`).join('')}</div>
      <div class="card-bottom">
        <span class="status ${availability}">${esc(t(availability))}</span>
        <div class="card-actions">
          <button type="button" data-compare="${id}" aria-label="${t('compare')}: ${name}" aria-pressed="${compared}">${t('compare')}</button>
          <button type="button" class="card-details" data-detail="${id}" aria-label="${t('details')}: ${name}"><span>${t('details')}</span>${detailIcon}</button>
        </div>
      </div>
    </div>
  </article>`;
}
function renderProducts(){const list=visibleProducts();$('#product-grid').innerHTML=list.map(productCard).join('');$('#empty-state').hidden=!!list.length;$$('[data-action="favorites"]').forEach(button=>button.setAttribute('aria-pressed',String(state.favoritesOnly)));$('#result-count').textContent=`${list.length} ${t('results')}`;$('#clear-filters').hidden=state.category==='all'&&!state.query&&!state.statuses.length&&!state.favoritesOnly;$$('[data-category]').forEach(el=>{if(el.closest('.category-chips,.filter-categories'))el.classList.toggle('active',el.dataset.category===state.category)});observeReveal()}
function writeCatalogState(next) {
  state = next;
  $('#search').value = state.query;
  $('#sort').value = state.sort;
  $$('[name=stock]').forEach(input => input.checked = state.statuses.includes(input.value));
  $('#favorites-only').checked = state.favoritesOnly;
  renderCategories();
  renderProducts();
}
function resetFilters(category = 'all') {
  writeCatalogState({category, query: '', sort: 'default', statuses: [], favoritesOnly: false});
}

function capturePage(trigger) {
  return {
    y: window.scrollY,
    hash: location.hash,
    catalog: {...state},
    trigger,
    category: trigger?.dataset.category,
    categoryScope: trigger?.closest('#filter-categories') ? '#filter-categories' : '#category-chips',
    menu: !$('#menu-overlay').hidden,
    filters: !$('#filter-panel').hidden
  };
}
function pageUrl(hash) {
  return location.pathname + location.search + hash;
}
function routeState(position) {
  return {...history.state, lgRoute: {session: navigationSession, position}};
}
function setupPageNavigation() {
  try {
    history.replaceState(routeState(0), '', location.href);
    history.scrollRestoration = 'manual';
    browserNavigation = true;
    window.addEventListener('popstate', syncPageHistory);
  } catch {}
}
function updatePageBack() {
  $('#page-back').hidden = pagePosition === 0;
}
function rememberPage(trigger, hash) {
  pageViews.length = pagePosition + 1;
  pageViews[pagePosition] = capturePage(trigger);
  if (browserNavigation) {
    try {
      history.pushState(routeState(pagePosition + 1), '', pageUrl(hash));
    } catch {
      browserNavigation = false;
    }
  }
  if (!browserNavigation) setSectionHash(hash);
  pagePosition += 1;
  updatePageBack();
}
function setSectionHash(hash) {
  if (hash === location.hash) return;
  try { history.replaceState(history.state, '', pageUrl(hash)); } catch {}
}
function restorePage(page) {
  updatePageBack();
  setMenu(false, false);
  setFilters(false, false);
  $$('dialog[open]').reverse().forEach(dialog => closeDialog(dialog.id));
  if (!page) {
    const section = document.getElementById(location.hash.slice(1)) || $('#top');
    section.scrollIntoView({block: 'start', behavior: 'instant'});
    return;
  }

  writeCatalogState(page.catalog);
  if (page.menu) setMenu(true);
  else if (page.filters) setFilters(true);
  else if (page.trigger?.isConnected && page.trigger.id !== 'page-back') page.trigger.focus({preventScroll: true});
  else if (page.category) {
    $(page.categoryScope + ' [data-category="' + CSS.escape(page.category) + '"]')?.focus({preventScroll: true});
  }
  window.scrollTo({top: page.y, behavior: 'instant'});
}
function syncPageHistory(event) {
  const route = event.state?.lgRoute;
  if (route?.session !== navigationSession) {
    pagePosition = 0;
    pageViews.length = 0;
    history.replaceState(routeState(0), '', location.href);
    restorePage();
    return;
  }
  pageViews[pagePosition] = capturePage(document.activeElement);
  pagePosition = route.position;
  restorePage(pageViews[pagePosition]);
}
function goBackPage() {
  if (pagePosition === 0) return;
  if (browserNavigation) {
    history.back();
    return;
  }
  const previous = pageViews[--pagePosition];
  setSectionHash(previous.hash);
  restorePage(previous);
}
function scrollToSection(target, moveFocus = true) {
  const near = Math.abs(target.getBoundingClientRect().top) < innerHeight * 1.35;
  const smooth = near && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (moveFocus) {
    const heading = target.querySelector('h1,h2') || target;
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
  }
  target.scrollIntoView({block: 'start', behavior: smooth ? 'smooth' : 'instant'});
}
function navigateToSection(hash, trigger) {
  if (hash !== location.hash) rememberPage(trigger, hash);
  setMenu(false, false);
  scrollToSection(document.getElementById(hash.slice(1)));
}
function chooseCategory(id, trigger) {
  const fromCollection = trigger.classList.contains('category-card');
  if (fromCollection || id !== state.category || !$('#filter-panel').hidden) rememberPage(trigger, '#catalog');
  if (fromCollection) {
    resetFilters(id);
  } else {
    state.category = id;
    renderCategories();
    renderProducts();
  }
  setFilters(false, false);
  setMenu(false, false);
  scrollToSection($('#catalog'));
}
function openComparison() {
  renderComparison();
  openDialog('compare-dialog');
}
const navigationActions = {
  catalog(trigger) {
    rememberPage(trigger, '#catalog');
    if (state.favoritesOnly) resetFilters();
    scrollToSection($('#catalog'));
  },
  search(trigger) {
    rememberPage(trigger, '#catalog');
    const input = $('#search');
    input.focus({preventScroll: true});
    scrollToSection($('.catalog-tools'), false);
  },
  favorites(trigger) {
    rememberPage(trigger, '#catalog');
    const showFavorites = !state.favoritesOnly;
    if (showFavorites) resetFilters();
    state.favoritesOnly = showFavorites;
    $('#favorites-only').checked = showFavorites;
    renderProducts();
    scrollToSection($('#catalog'));
  },
  back: goBackPage,
  compare: openComparison,
  menu() { setMenu(true); }
};
function syncCompareTray() {
  const tray = $('#compare-tray');
  if (!comparison.length) {
    tray.hidden = true;
    return;
  }
  const {top, bottom} = $('#catalog').getBoundingClientRect();
  tray.hidden = top >= window.innerHeight - 74 || bottom <= 76;
}
function updateCounters() {
  for (const [key, count] of [['favorites', favorites.length], ['compare', comparison.length]]) {
    const badge = $('[data-count="' + key + '"]');
    badge.textContent = count;
    badge.hidden = !count;
  }
  syncCompareTray();
  $('#compare-tray-label').textContent = `${t('compare')} ${comparison.length}/3`;
  $('#compare-mini').innerHTML = comparison.map(id => {
    const product = PRODUCTS.find(entry => entry.id === id);
    const source = product.images?.[0];
    return source ? `<img src="${esc(source)}" alt="${esc(local(product.name))}">` : '';
  }).join('');
  $('#compare-view').disabled = comparison.length < 2;
}
function toggleFavorite(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];persist();updateCounters();renderProducts();if(current?.id===id&&$('#product-dialog').open)renderDetail();toast(t('saved'))}
function toggleCompare(id){if(comparison.includes(id))comparison=comparison.filter(x=>x!==id);else{const p=PRODUCTS.find(x=>x.id===id);if(comparison.length&&PRODUCTS.find(x=>x.id===comparison[0]).category!==p.category){toast(t('sameCategory'));return}if(comparison.length>=3){toast(t('compareLimit'));return}comparison.push(id)}persist();updateCounters();renderProducts();if(current?.id===id&&$('#product-dialog').open)renderDetail();if($('#compare-dialog').open)renderComparison()}
function openProduct(id) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  const dialog = $('#product-dialog');
  if (dialog.open) {
    productTrail.push({product: current, image: currentImage, y: dialog.scrollTop, linked: id});
  } else {
    productTrail.length = 0;
  }
  current = product;
  currentImage = 0;
  renderDetail();
  openDialog(dialog.id);
  dialog.scrollTop = 0;
  dialog.querySelector('.dialog-back').focus({preventScroll: true});
}
function goBackDialog(id) {
  if (id === 'product-dialog' && productTrail.length) {
    const prior = productTrail.pop();
    current = prior.product;
    currentImage = prior.image;
    renderDetail();
    $('#product-dialog').scrollTop = prior.y;
    $(`.similar-grid [data-detail="${prior.linked}"]`)?.focus({preventScroll: true});
  } else {
    closeDialog(id);
  }
}
function renderDetail(){const p=current,imgs=p.images||[],image=imgs[currentImage],features=local(p.features)||[];const specs=Object.entries(p.specifications||{});const similar=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,3);$('#product-detail').innerHTML=`<div class="detail-hero"><div class="detail-copy"><span class="eyebrow">${esc(categoryName(p.category))} / ${p.demo?t('demo'):'LG COLLECTION'}</span><span class="model">MODEL / ${esc(p.model)}</span><h2>${esc(local(p.name))}</h2><span class="status ${p.availability}">${t(p.availability)}</span><ul class="detail-feature-list">${features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><div class="detail-actions"><button class="solid-cta" data-inquire="${p.id}">${t(p.availability==='unavailable'?'restock':'inquire')} ${detailIcon}</button><button data-favorite="${p.id}" aria-label="${t('favorite')}" aria-pressed="${favorites.includes(p.id)}">${favoriteIcon} ${t('favorite')}</button><button data-compare="${p.id}">${comparison.includes(p.id)?'✓ ':''}${t('compare')}</button></div></div><div class="detail-visual"><button class="detail-main-image" data-zoom="${esc(image||'')}" aria-label="${t('zoom')}">${image?`<img src="${esc(image)}" alt="${esc(local(p.name))}">`:'LG'}</button><div class="detail-thumbs">${imgs.map((src,i)=>`<button data-image="${i}" class="${i===currentImage?'active':''}" aria-label="${esc(local(p.imageCaptions)?.[i]||String(i+1))}"><img src="${esc(src)}" alt=""></button>`).join('')}</div></div></div><div class="detail-sections"><span class="section-kicker">LG / ${t('specifications')}</span><h3>${t('specifications')}</h3><dl class="detail-specs">${specs.map(([k,v])=>`<div><dt>${esc((TEXT[k]||[k,k])[lang==='ar'?0:1])}</dt><dd>${esc(local(v))}</dd></div>`).join('')}</dl>${p.specificationSource?`<p class="detail-note">${esc(local(p.specificationSource))}</p>`:''}${p.demo?`<p class="detail-note">${t('demo')} · ${t('catalogNote')}</p>`:''}<h3 class="similar-title">${t('similar')}</h3><div class="similar-grid">${similar.map(x=>`<button data-detail="${x.id}"><img src="${esc(x.images?.[0]||'')}" alt="" loading="lazy"><span>${esc(local(x.name))}</span><small>${esc(x.model)}</small></button>`).join('')}</div></div>`}
function chooseImage(i){currentImage=i;renderDetail()}
function zoom(src, description = t('zoom')) {
  if (!src) return;
  const image = $('#zoom-image');
  image.src = src;
  image.alt = description;
  openDialog('image-dialog');
}
function inquire(p){const msg=lang==='ar'?`مرحبًا ${local(SHOP.name)}، أود الاستفسار عن ${local(p.name)}، الموديل ${p.model}. ${p.availability==='unavailable'?'متى يتوفر؟':''}`:`Hello ${local(SHOP.name)}, I would like to ask about ${local(p.name)}, model ${p.model}. ${p.availability==='unavailable'?'When will it be available?':''}`;const n=String(SHOP.whatsapp||'').replace(/\D/g,'');if(n.length>=8)window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer');else{$('#inquiry-text').value=msg;openDialog('contact-dialog')}}
function assistantResponse(list,q){const query=q.toLocaleLowerCase(),values=list.map(p=>({p,n:Number(p.attribute)||0}));let pick=null,basis='';if(/كبير|أكبر|سعة|large|bigger|capacity/.test(query)){if(values.every(x=>x.n)){pick=values.reduce((a,b)=>a.n>b.n?a:b).p;basis=values.map(x=>`${x.p.model}: ${x.n} L`).join(' · ')}}else if(/صغير|أصغر|small|compact/.test(query)){if(values.every(x=>x.n)){pick=values.reduce((a,b)=>a.n<b.n?a:b).p;basis=values.map(x=>`${x.p.model}: ${x.n} L`).join(' · ')}}else if(/طاقة|استهلاك|energy|electric/.test(query)){const v=list.map(p=>({p,n:parseFloat(local(p.specifications?.energyConsumption))}));if(v.every(x=>Number.isFinite(x.n))){pick=v.reduce((a,b)=>a.n<b.n?a:b).p;basis=v.map(x=>`${x.p.model}: ${x.n} kWh/year`).join(' · ')}}else if(/فرق|مقارن|difference|compare/.test(query)){const keys=[...new Set(list.flatMap(p=>Object.keys(p.specifications||{})))].filter(k=>new Set(list.map(p=>local(p.specifications?.[k])||'')).size>1).slice(0,5);return keys.length?keys.map(k=>`${(TEXT[k]||[k,k])[lang==='ar'?0:1]}: ${list.map(p=>`${p.model} ${local(p.specifications?.[k])||'—'}`).join(' / ')}`).join(' · '):t('insufficient')}return pick?(lang==='ar'?`بحسب ${/طاقة|استهلاك/.test(query)?'استهلاك الطاقة المسجّل':'السعة المسجّلة'}، أنصح بالنظر إلى ${local(pick.name)} (${pick.model}).`:`Based on recorded ${/energy/.test(query)?'energy use':'capacity'}, consider ${local(pick.name)} (${pick.model}).`)+` ${basis}. ${lang==='ar'?'تحقّق من التوفّر مع المعرض.':'Confirm availability with the showroom.'}`:t('insufficient')}
function renderComparison(){const list=comparison.map(id=>PRODUCTS.find(x=>x.id===id)).filter(Boolean);if(list.length<2){$('#compare-content').innerHTML=`<h2>${t('compare')}</h2><p>${t('needTwo')}</p>`;return}const keys=[...new Set(list.flatMap(p=>Object.keys(p.specifications||{})))];$('#compare-content').innerHTML=`<span class="section-kicker">LG / COMPARE</span><h2>${t('compare')}</h2><div class="choice-assistant"><h3><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2c0 6 4 10 10 10-6 0-10 4-10 10 0-6-4-10-10-10 6 0 10-4 10-10Z"/></svg> ${t('assistantTitle')}</h3><p>${t('assistantIntro')}</p><div class="assistant-prompts">${['assistantLarge','assistantSmall','assistantEnergy','assistantDifference'].map(k=>`<button data-prompt="${k}">${t(k)}</button>`).join('')}</div><form class="assistant-form" id="assistant-form"><input id="assistant-input" aria-label="${t('assistantPlaceholder')}" placeholder="${t('assistantPlaceholder')}" maxlength="180"><button>${t('assistantSend')} ${detailIcon}</button></form><div class="assistant-response" id="assistant-response"></div><p>${t('assistantDisclaimer')}</p></div><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>${t('specifications')}</th>${list.map(p=>`<th><img src="${esc(p.images?.[0]||'')}" alt=""><div>${esc(local(p.name))}</div><small>${esc(p.model)}</small><br><button data-compare="${p.id}">${t('remove')} <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg></button></th>`).join('')}</tr></thead><tbody><tr><th>${t('availability')}</th>${list.map(p=>`<td>${t(p.availability)}</td>`).join('')}</tr>${keys.map(k=>`<tr><th>${esc((TEXT[k]||[k,k])[lang==='ar'?0:1])}</th>${list.map(p=>`<td>${esc(local(p.specifications?.[k])||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function observeReveal(){if(!window.revealObserver)return;$$('.reveal:not(.visible)').forEach(x=>window.revealObserver.observe(x))}
function initGooeyNav(){
 const nav=$('.gooey-nav');if(!nav)return;
 const links=$$(' .gooey-nav a'.trim()),pill=nav.querySelector('.gooey-pill'),layer=nav.querySelector('.gooey-particles');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function move(link,burst=false){
  if(!link)return;const nr=nav.getBoundingClientRect(),r=link.getBoundingClientRect(),x=r.left-nr.left;
  pill.style.width=r.width+'px';pill.style.transform=`translate3d(${x}px,0,0)`;
  links.forEach(a=>{a.classList.toggle('active',a===link);if(a===link)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
  if(!burst||reduce.matches)return;
  layer.replaceChildren();const cx=x+r.width/2,cy=nr.height/2;
  for(let i=0;i<9;i++){const dot=document.createElement('span'),angle=(Math.PI*2*i/9)+Math.random()*.25,spread=21+Math.random()*23;dot.className='gooey-particle';dot.style.left=cx+'px';dot.style.top=cy+'px';dot.style.setProperty('--size',(6+Math.random()*8)+'px');dot.style.setProperty('--dx',Math.cos(angle)*spread+'px');dot.style.setProperty('--dy',Math.sin(angle)*spread+'px');layer.append(dot)}
  setTimeout(()=>layer.replaceChildren(),760);
 }
 nav.addEventListener('click',e=>{const link=e.target.closest('a');if(link)move(link,true)});
 window.addEventListener('resize',()=>move(nav.querySelector('a.active')||links[0]),{passive:true});
 requestAnimationFrame(()=>move(links.find(link=>link.hash===location.hash)||links[0]));
 const sections=links.map(link=>[link,link.hash==='#top'?$('.hero'):$(link.hash)]).filter(([,section])=>section);
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible){const match=sections.find(([,section])=>section===visible.target);if(match)move(match[0])}},{rootMargin:'-25% 0px -55% 0px',threshold:[0,.15,.3,.5]});
 sections.forEach(([,section])=>observer.observe(section));
}
function initTvDisplay() {
  const tv = $('#feature-tv');
  const playback = $('#tv-playback');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  let visible = false;
  let pausedByUser = false;

  function syncPlayback() {
    playback.hidden = !motion.matches;
    tv.toggleAttribute('data-playing', motion.matches && visible && !document.hidden && !pausedByUser);
  }

  playback.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    playback.dataset.aria = pausedByUser ? 'playTv' : 'pauseTv';
    playback.setAttribute('aria-label', t(playback.dataset.aria));
    playback.querySelector('path').setAttribute('d', pausedByUser ? 'M8 5l11 7-11 7z' : 'M9 5v14m6-14v14');
    syncPlayback();
  });

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  });
  observer.observe(tv);
  motion.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  tv.setAttribute('data-ready', '');
  syncPlayback();
}


function initShowroomGallery() {
  const gallery = $('#gallery-stacks');
  const overview = $('#gallery-overview');
  const toggle = $('#gallery-expand');
  const toggleLabel = toggle.querySelector('[data-t]');
  const motion = matchMedia('(prefers-reduced-motion: reduce), (max-height: 330px)');
  const tracks = [...gallery.querySelectorAll('.gallery-stack')].map(track => ({
    track,
    cards: [...track.querySelectorAll('.gallery-card')].map(card => ({
      card,
      picture: card.querySelector('.gallery-picture'),
      depth: 0,
    })),
  }));
  const cards = tracks.flatMap(track => track.cards);
  let frame = 0;

  function measure() {
    for (const group of tracks) {
      const { track, cards: groupCards } = group;
      group.gap = parseFloat(getComputedStyle(track).rowGap) || 0;
      let offset = 0;
      for (const entry of groupCards) {
        entry.group = group;
        entry.start = offset - (parseFloat(getComputedStyle(entry.card).top) || 0);
        offset += entry.card.offsetHeight + group.gap;
      }
    }
  }

  function paint() {
    frame = 0;
    if (motion.matches) return;
    for (const { track, cards: groupCards, gap } of tracks) {
      const bounds = track.getBoundingClientRect();
      if (bounds.top > innerHeight || bounds.bottom < 0) continue;
      const distance = -bounds.top;
      let front = 0;
      while (front + 1 < groupCards.length && distance >= groupCards[front + 1].start) front++;
      const current = groupCards[front];
      const next = groupCards[front + 1];
      const approaching = next
        ? Math.max(0, Math.min(1, (distance - current.start - gap) / (next.start - current.start - gap)))
        : 0;

      groupCards.forEach((entry, index) => {
        const depth = Math.round(Math.max(0, Math.min(4, front + approaching - index)) * 1000) / 1000;
        if (depth === entry.depth) return;
        entry.depth = depth;
        entry.picture.style.setProperty('--gallery-scale', String(1 - .05 * depth));
        entry.picture.style.setProperty('--gallery-dim', String(.25 * depth / 4));
      });
    }
  }

  function queuePaint() {
    if (!frame && !motion.matches) frame = requestAnimationFrame(paint);
  }

  function reveal(entry, behavior) {
    if (motion.matches) {
      entry.card.scrollIntoView({block: 'center', behavior: 'instant'});
      return;
    }
    const top = scrollY + entry.group.track.getBoundingClientRect().top + entry.start + 1;
    window.scrollTo({top, behavior});
  }

  function setOverview(open) {
    overview.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.dataset.t = open ? 'galleryCollapse' : 'galleryExpand';
    toggleLabel.textContent = t(toggleLabel.dataset.t);
    queuePaint();
  }

  toggle.addEventListener('click', () => setOverview(overview.hidden));
  overview.addEventListener('click', event => {
    const thumb = event.target.closest('.gallery-thumb');
    if (!thumb) return;
    const entry = cards[Number(thumb.dataset.galleryJump)];
    setOverview(false);
    reveal(entry, 'instant');
    entry.picture.focus({preventScroll: true});
  });
  gallery.addEventListener('click', event => {
    const picture = event.target.closest('.gallery-picture');
    if (picture) zoom(picture.dataset.galleryPhoto, picture.querySelector('strong').textContent);
  });
  gallery.addEventListener('focusin', event => {
    if (!event.target.matches('.gallery-picture:focus-visible')) return;
    const entry = cards.find(item => item.picture === event.target);
    reveal(entry, 'instant');
  });

  function resize() {
    measure();
    queuePaint();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(gallery);
  motion.addEventListener('change', resize);
  window.addEventListener('resize', resize, {passive: true});
  window.addEventListener('scroll', queuePaint, {passive: true});
  resize();
}

function setup(){const reloadingHome=resetHomeOnReload();setupPageNavigation();window.revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');window.revealObserver.unobserve(e.target)}}),{threshold:.08});syncLanguage();$('#year').textContent=new Date().getFullYear();startSlideTimer();initGooeyNav();initTvDisplay();initShowroomGallery();
 document.addEventListener('click',e=>{
  const el=e.target instanceof Element ? e.target.closest('button,a') : null;
  if(!el)return;
  const action = navigationActions[el.dataset.action];
  if (action) {
    e.preventDefault();
    action(el);
    return;
  }
  if(el.dataset.category){chooseCategory(el.dataset.category, el);return}
  if(el.dataset.detail){openProduct(el.dataset.detail);return}
  if(el.dataset.favorite){toggleFavorite(el.dataset.favorite);return}
  if(el.dataset.compare){toggleCompare(el.dataset.compare);return}
  if(el.dataset.image!==undefined){chooseImage(Number(el.dataset.image));return}
  if(el.dataset.zoom){zoom(el.dataset.zoom);return}
  if(el.dataset.inquire){inquire(PRODUCTS.find(p=>p.id===el.dataset.inquire));return}
  if(el.dataset.close){goBackDialog(el.dataset.close);return}
  if(el.dataset.prompt){$('#assistant-input').value=t(el.dataset.prompt);$('#assistant-response').textContent=assistantResponse(comparison.map(id=>PRODUCTS.find(p=>p.id===id)),t(el.dataset.prompt));return}
  const hash = el.getAttribute('href');
  if (hash?.startsWith('#') && document.getElementById(hash.slice(1)) &&
      !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    navigateToSection(hash, el);
  }
 });
 $('#language').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';persist();syncLanguage();requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')))});
 $('#slide-next').addEventListener('click',()=>setSlide(slide+1));
 $('#slide-prev').addEventListener('click',()=>setSlide(slide-1));
 $('#slide-toggle').addEventListener('click',()=>{
   paused = !paused;
   syncSlideControls();
   startSlideTimer();
 });
 $('#menu-close').addEventListener('click',()=>setMenu(false));
 $('#search').addEventListener('input',e=>{state.query=e.target.value.trim();renderProducts()});$('#sort').addEventListener('change',e=>{state.sort=e.target.value;renderProducts()});$('#clear-filters').addEventListener('click',()=>resetFilters());$('#empty-reset').addEventListener('click',()=>resetFilters());
 $('#compare-view').addEventListener('click',openComparison);
 $('#filter-toggle').addEventListener('click',()=>setFilters(true));$('#filter-close').addEventListener('click',()=>setFilters(false));$('#filter-apply').addEventListener('click',()=>setFilters(false));$$('[name=stock]').forEach(x=>x.addEventListener('change',()=>{state.statuses=$$('[name=stock]:checked').map(y=>y.value);renderProducts()}));$('#favorites-only').addEventListener('change',e=>{state.favoritesOnly=e.target.checked;renderProducts()});
 $('#store-open').addEventListener('click',()=>zoom('assets/showroom-campaign.webp'));$('#store-photo').addEventListener('click',()=>zoom('assets/showroom-campaign.webp'));
 $('#copy-inquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#inquiry-text').value);toast(t('saved'))}catch{$('#inquiry-text').select();document.execCommand('copy');toast(t('saved'))}});
 document.addEventListener('submit',e=>{if(e.target.id==='assistant-form'){e.preventDefault();$('#assistant-response').textContent=assistantResponse(comparison.map(id=>PRODUCTS.find(p=>p.id===id)),$('#assistant-input').value)}});
 $$('dialog').forEach(dialog => {
  dialog.addEventListener('close', syncScrollLock);
  dialog.addEventListener('cancel', event => {
    if (dialog.id === 'welcome-intro') return;
    event.preventDefault();
    goBackDialog(dialog.id);
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) goBackDialog(dialog.id);
    }
  });
 });
 document.addEventListener('keydown',event=>{
  if (event.key !== 'Escape' || $('dialog[open]')) return;
  if (!$('#menu-overlay').hidden) setMenu(false);
  else if (!$('#filter-panel').hidden) setFilters(false);
 });
 window.addEventListener('scroll',()=>{
   $('#header').classList.toggle('scrolled',scrollY>30);
   if (comparison.length) syncCompareTray();
 },{passive:true});
 window.addEventListener('resize', syncCompareTray, {passive:true});
 document.documentElement.classList.add('motion-ready');
 observeReveal();
 if (!showWelcome(reloadingHome)) revealHome();
}
setup();
