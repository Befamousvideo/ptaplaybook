/** Inline script: Google Consent Mode v2 defaults + restore saved choice. */
export const CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'denied',
  personalization_storage:'denied',
  security_storage:'granted',
  wait_for_update:500
});
(function(){
  var v=null;
  try{v=localStorage.getItem('pta_consent');}catch(e){}
  if(v!=='accepted'&&v!=='rejected'){
    var m=document.cookie.match(/(?:^|;\\s*)pta_consent=([^;]+)/);
    if(m)v=decodeURIComponent(m[1]);
  }
  if(v==='accepted'){
    gtag('consent','update',{
      ad_storage:'granted',
      ad_user_data:'granted',
      ad_personalization:'granted',
      analytics_storage:'granted'
    });
  }
})();
`.trim();
