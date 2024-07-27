const OFFLINE_URL = 'offline.html';
const CACHE_NAME = 'v2';

//Instalação
this.addEventListener('install', function (event) {
    //adicionar arquivos ao cache CACHE_NAME
    event.waitUntil(
        //abre um cache com o nome do cache
        caches.open(CACHE_NAME).then(function (cache) {
            //adiciona os arquivos ao cache
            'css/style.css',
            'imagens/logo.png',
            'imagens/icon-512.png',
            'imagens/icon-128.png',
            'imagens/icon-256.png',
            'imagens/icon-apple.png',
            'imagens/404.png',
            'imagens/tela.png',
            'manifest.json',
            'offline.html'
        })
    );

    console.log('Arquivos armazenados no cache...');

    //adicionar a OFFLINE_URL -assincrono 
    event.waitUntil((async () => {
        console.log('URL Offline armazenada ' + OFFLINE_URL);
        //await esperar a resposta do cache
        const cache = await caches.open(CACHE_NAME);
        //dar reload e mostrar o arquivo offline
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })());
});

//Ativação + Cache
this.addEventListener('activate', function (event) {

    console.log('Cache ' + CACHE_NAME);

    //executar ate que o evento tenha ocorrido e finalizado com sucesso
    //O worker não vai ser tratado como ativo até que a Promise se resolva.
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                //filtra os caches não utilizados e apaga os caches diferentes
                cacheNames
                    .filter(cacheName => (cacheName.startsWith(CACHE_NAME)))
                    .filter(cacheName => (cacheName !== CACHE_NAME))
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );

    console.log('Ativo...');

});

//fetch
this.addEventListener('fetch', function (event) {
    console.log('Fetch...');
    //Network First - Primeiro rede depois URL Offline
    event.respondWith(
        //verificar se a resposta está em cache ou na rede
        //match retorna uma Promisse com a resposta
        caches.match(event.request)
            .then(response => {
                console.log('Retornando respostas...');
                //retornar a resposta
                return response || fetch(event.request);
            })
            //caso não exista conexão abrir a URL offline
            .catch(() => {
                console.log('Retornando OFFLINE_URL...');
                return caches.match(OFFLINE_URL);
            })
    )
});

//Sincronização e atualização
this.addEventListener('sync', function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {

            console.log("Sincronizando e recarregando");

            try {
                
                return cache.addAll([
                    'css/style.css',
                    'imagens/logo.png',
                    'imagens/icon-512.png',
                    'imagens/icon-128.png',
                    'imagens/icon-256.png',
                    'imagens/icon-apple.png',
                    'imagens/404.png',
                    'manifest.json',
                    'offline.html'
                ]);
                
            } catch (error) {
                this.registration.showNotification("Falha na atualização " + error);
            }

        }),
    );

});


//Atualização periódica
this.addEventListener('periodicsync', (event) => {

    console.log("Sincronização periódica");

    if (event.tag === 'important') {

        this.registration.showNotification("Sync períodico realizado com sucesso");

    } else {

        this.registration.showNotification("Erro ao sincronizar");

    }

});


//Teste de Push Notification
this.addEventListener('push', function (event) {

    console.log("Push");
    //recuperar a noticiação - é um texto, mas pode ser recuperado um JSON
    registration.getNotifications().then(function (notifications) {
        //opções da notificação
        const options = {
            body: event.data.text(),
            icon: 'imagens/icon-128.png',
            vibrate: [100, 200, 100]
        };
        //mostrar notificação com a opções - 'Push notification' -> título da notificação
        this.registration.showNotification('Push notification', options);
    })

});