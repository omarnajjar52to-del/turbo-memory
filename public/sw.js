// No response caching: private account records always come from the authenticated server.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const existing=windows.find(c=>new URL(c.url).origin===self.location.origin);if(existing){await existing.focus();existing.postMessage({type:'OPEN_WORKOUT'});return}await self.clients.openWindow('/')})())});
