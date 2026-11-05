export const WASH_SESSION_KEY = 'md-washed';

export const WASH_SEEN_CLASS = 'wash-seen';

export const WASH_BOOT_SCRIPT =
  'try{if(sessionStorage.getItem(' +
  JSON.stringify(WASH_SESSION_KEY) +
  ')==="1")document.documentElement.classList.add(' +
  JSON.stringify(WASH_SEEN_CLASS) +
  ')}catch(e){}';
