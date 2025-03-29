// 缓存名称，修改版本号可以强制更新缓存
const CACHE_NAME = 'math-app-cache-v1';

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/practice.html',
  '/result.html',
  '/profile.html',
  '/parent.html',
  '/mistakes.html',
  '/achievements.html',
  '/review.html',
  '/utils.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.ttf'
];

// 安装 Service Worker 时缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存应用资源中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 强制激活当前版本的 Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // 清除旧版本缓存
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // 控制所有打开的标签页
      return self.clients.claim();
    })
  );
});

// 处理网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果请求匹配到了缓存中的资源，则返回缓存的资源
        if (response) {
          return response;
        }

        // 克隆请求，因为请求是一个流，只能使用一次
        const fetchRequest = event.request.clone();

        // 通过网络获取请求的资源
        return fetch(fetchRequest)
          .then(response => {
            // 检查是否得到有效的响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应是一个流，只能使用一次
            const responseToCache = response.clone();

            // 将新的资源缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                // 忽略某些不需要缓存的请求，比如 API 请求
                if (event.request.url.indexOf('http') === 0) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          });
      })
      .catch(() => {
        // 当网络请求失败时，返回一个离线页面
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
}); 