/* Small motion layer; the menu and checkout remain owned by app.js. */
(function () {
  'use strict';
  var root=document.documentElement, stage=document.querySelector('.fire-stage');
  var button=document.querySelector('.motion-toggle'), paused=false;
  function label(){
    var ar=root.lang==='ar';
    button.querySelector('span').textContent=paused?(ar?'تشغيل الحركة':'Play motion'):(ar?'إيقاف الحركة':'Pause motion');
    button.setAttribute('aria-pressed',String(paused));
  }
  button.addEventListener('click',function(){
    paused=!paused; root.classList.toggle('motion-paused',paused);
    document.dispatchEvent(new Event('naar:motion')); 
    label();
  });
  new MutationObserver(label).observe(root,{attributes:true,attributeFilter:['lang']});
  if('IntersectionObserver' in window){
    var observer=new IntersectionObserver(function(entries){ entries.forEach(function(e){e.target.classList.toggle('in-view',e.isIntersecting);}); },{threshold:.15});
    observer.observe(stage);
  } else stage.classList.add('in-view');
  document.addEventListener('visibilitychange',function(){root.classList.toggle('motion-sleep',document.hidden);});
  label();
})();
