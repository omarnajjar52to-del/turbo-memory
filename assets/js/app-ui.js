(function(){
  'use strict';
  var root=document.documentElement,themeButton=document.querySelector('#theme-btn');
  var appNav=document.querySelector('.app-nav'),activeView='home',activeTab='home';
  var routes={top:['home','home'],menu:['home','menu'],offers:['offers','offers'],story:['about','about'],visit:['about','about']};
  function isAr(){return root.lang==='ar';}
  function themeLabels(){
    var light=root.dataset.theme==='light';
    themeButton.setAttribute('aria-label',isAr()?(light?'تفعيل الوضع الليلي':'تفعيل الوضع النهاري'):(light?'Switch to dark mode':'Switch to light mode'));
    themeButton.setAttribute('title',themeButton.getAttribute('aria-label'));
    themeButton.setAttribute('aria-pressed',String(light));
    document.querySelector('meta[name="theme-color"]').content=light?'#ffffff':'#151413';
    document.querySelectorAll('.brand-logo,.intro-logo').forEach(function(img){img.src=light?'assets/img/logo-naar-day.svg':'assets/img/logo-naar.svg';});
  }
  function labels(){
    document.querySelectorAll('[data-app-label]').forEach(function(el){el.textContent=el.getAttribute(isAr()?'data-ar':'data-en');});
    themeLabels();
  }
  function updateTab(){
    appNav.querySelectorAll('[data-app-tab]').forEach(function(el){
      if(el.dataset.appTab===activeTab)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
    document.querySelectorAll('.primary-nav a').forEach(function(a){a.classList.toggle('is-active',a.hash==='#'+(activeView==='about'?'story':activeView==='offers'?'offers':'menu'));});
  }
  function navigate(target,write){
    if(!routes[target])return;
    activeView=routes[target][0];activeTab=routes[target][1];
    document.body.dataset.view=activeView;
    document.body.dataset.tab=activeTab;
    var section=document.getElementById(target);
    if(target==='top')window.scrollTo({top:0,behavior:'auto'});
    else if(section)section.scrollIntoView({block:'start',behavior:'auto'});
    if(write&&location.hash!=='#'+target){try{history.pushState({view:target},'','#'+target);}catch(ignore){location.hash=target;}}
    updateTab();
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]');
    if(!a)return;
    var target=a.hash.slice(1);
    if(routes[target]){e.preventDefault();navigate(target,true);}
  });
  themeButton.addEventListener('click',function(){
    root.dataset.theme=root.dataset.theme==='light'?'dark':'light';
    try{localStorage.setItem('naar.theme',root.dataset.theme);}catch(e){}
    themeLabels();
  });
  var systemTheme=matchMedia('(prefers-color-scheme: dark)');
  systemTheme.addEventListener('change',function(e){try{if(localStorage.getItem('naar.theme'))return;}catch(ignore){}root.dataset.theme=e.matches?'dark':'light';themeLabels();});
  document.querySelector('#app-cart-btn').addEventListener('click',function(){document.querySelector('#cart-btn').click();});
  function cartBadge(){
    var count=document.querySelector('#cart-count').textContent.trim(),badge=document.querySelector('#app-cart-count');
    badge.textContent=count;badge.hidden=!count||count==='0';
    document.querySelector('#app-cart-btn').setAttribute('aria-label',document.querySelector('#cart-btn').getAttribute('aria-label')|| (isAr()?'السلة':'Cart'));
  }
  new MutationObserver(cartBadge).observe(document.querySelector('#cart-count'),{childList:true,characterData:true,subtree:true});
  new MutationObserver(function(){labels();cartBadge();}).observe(root,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('popstate',function(){navigate(location.hash.slice(1)||'top',false);});
  window.addEventListener('hashchange',function(){navigate(location.hash.slice(1)||'top',false);});
  labels();cartBadge();navigate(location.hash.slice(1)||'top',false);
})();
