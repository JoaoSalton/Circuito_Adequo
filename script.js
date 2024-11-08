// Inicializa o mapa
const map = L.map('map').setView([-26.977867, -48.751600], 20);

// URL da imagem PNG
const imageUrl = 'arealow.jpg'; // Substitua pelo caminho correto da sua imagem PNG

// Define os limites da imagem usando suas coordenadas
const southWest = L.latLng(-26.9794210561550436, -48.7531625172409093);
const northEast = L.latLng(-26.9763356004990413, -48.7497037682969037);

// Adiciona a imagem como uma sobreposição no mapa
L.imageOverlay(imageUrl, [southWest, northEast]).addTo(map);

// Ajusta a vista do mapa para incluir a imagem
map.fitBounds([southWest, northEast]);

// Define os ícones de cavalo para cada direção
const userIcons = {
    up: L.icon({ iconUrl: 'cavalo-up.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    down: L.icon({ iconUrl: 'cavalo-down.png', iconSize: [15, 50], iconAnchor: [7 , 25] }),
    left: L.icon({ iconUrl: 'cavalo-left.png', iconSize: [50, 15], iconAnchor: [25 , 7] }),
    right: L.icon({ iconUrl: 'cavalo-right.png', iconSize: [50, 15], iconAnchor: [25 ,7] })
};

// Variável para armazenar o marcador do usuário
let userMarker;

// Array para armazenar os waypoints
let waypoints = [];

// Som de passos
const somPassos = new Audio('horsewalker.mp3');
let tocandoPassos = false;

// Som de waypoint
const somWaypoint = new Audio('carrot.mp3');

// Som de parabéns
const somParabens = new Audio('corneta.mp3'); // Substitua pelo caminho correto do som de parabéns

// Função para tocar o som de passos
function tocarSomPassos() {
    if (!tocandoPassos) {
        tocandoPassos = true;
        somPassos.play();
        somPassos.onended = function() { tocandoPassos = false; };
    }
}

// Função para parar o som de passos
function pararSomPassos() {
    if (!somPassos.paused) {
        somPassos.pause();
        somPassos.currentTime = 0;
        tocandoPassos = false;
    }
}

// Função para tocar o som do waypoint
function tocarSomWaypoint() {
    pararSomPassos();
    somWaypoint.play();
    somWaypoint.onended = function() { tocarSomPassos(); };
}

// Função para tocar o som de parabéns
function tocarSomParabens() {
    somParabens.play();
}

// Função para atualizar a posição do usuário e mudar o ícone
function updateUserPosition(lat, lng, direction) {
    if (userMarker) {
        // Atualiza a posição e o ícone do marcador existente
        userMarker.setLatLng([lat, lng]);  // Sem o 'let'
        userMarker.setIcon(userIcons[direction]);
    } else {
        // Cria o marcador se ele não existir
        userMarker = L.marker([lat, lng], { icon: userIcons[direction] }).addTo(map);
        userMarker.bindPopup(`Waypoints restantes: ${waypoints.length}`).openPopup();
    }

    // Aplica o zoom apenas na primeira vez
    if (!zoomInicialAplicado) {
        map.setView([lat, lng], 20);
        zoomInicialAplicado = true;
    }

    // Função para coletar waypoints
    collectWaypoints(lat, lng);
}

// Função para adicionar waypoints fixos ao mapa
function addFixedWaypoints() {
    const fixedWaypoints = [
        { lat: -26.9780025, lng: -48.7514073 },
        { lat: -26.9776476, lng: -48.7513609 },
        { lat: -26.9776990, lng: -48.7519480 },
        { lat: -26.97707336, lng: -48.75196873 },
        { lat: -26.9768806, lng: -48.7511872 },
        { lat: -27.1342652, lng: -48.5978859 },
        { lat: -27.13440765, lng: -48.5977903 },
        { lat: -27.13431719, lng: -48.5976555 },
        { lat: -27.13415692, lng: -48.5975790 },
        { lat: -27.1331607, lng: -48.5964232 },
        { lat: -27.1341332, lng: -48.5956231 },
        { lat: -27.1363430, lng: -48.5939888 },
        { lat: -27.1406266, lng: -48.5895595 },
        { lat: -27.1445982, lng: -48.5860627 }
    ];

    const waypointIcon = L.icon({ iconUrl: 'way.png', iconSize: [50, 50], iconAnchor: [25, 25] });

    fixedWaypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
        waypoints.push(waypoint);
    });

    updateRemainingWaypoints(); // Atualiza o contador de waypoints restantes
}

// Chame `addFixedWaypoints` em vez de `generateRandomWaypoints`
addFixedWaypoints();
// Função para adicionar waypoints ao mapa
function addWaypointsToMap(waypoints) {
    const waypointIcon = L.icon({ iconUrl: 'way.png', iconSize: [30, 30], iconAnchor: [15, 15] });
    waypoints.forEach(waypoint => {
        const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon }).addTo(map);
        waypoint.marker = marker;
    });
}

// Função para coletar waypoints próximos
function collectWaypoints(userLat, userLng) {
    let waypointCaptured = false; // Flag para verificar se um waypoint foi capturado

    waypoints = waypoints.filter(waypoint => {
        const waypointLat = waypoint.lat;
        const waypointLng = waypoint.lng;
        const distance = Math.sqrt(Math.pow(userLat - waypointLat, 2) + Math.pow(userLng - waypointLng, 2)) * 111320;

        if (distance < 3) {
            waypoint.marker.remove();
            tocarSomWaypoint();
            waypointCaptured = true; // Marca que um waypoint foi capturado
            return false;
        }
        return true;
    });

    // Atualiza a contagem de waypoints restantes se algum foi capturado
    if (waypointCaptured) {
        updateRemainingWaypoints();
    }
}

// Função para atualizar o contador de waypoints restantes na interface
function updateRemainingWaypoints() {
    if (userMarker) {
        if (waypoints.length === 0) {
            userMarker.getPopup().setContent(`Parabéns! Você Conseguiu!`).openPopup();
            tocarSomParabens(); // Toca o som de parabéns quando todos os waypoints são coletados
        } else {
            userMarker.getPopup().setContent(`Waypoints restantes: ${waypoints.length}`).openPopup();
        }
    }
}

// Função para obter a posição GPS do usuário
function getUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Atualiza a posição do usuário com base na direção do movimento
            const direction = calculateDirection(lat, lng);
            updateUserPosition(lat, lng, direction);  // Atualiza a posição do usuário no mapa
            collectWaypoints(lat, lng);  // Verifica se o usuário capturou algum waypoint
        }, function(error) {
            console.log("Erro ao obter a localização: ", error.message);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });
    } else {
        alert("Geolocalização não é suportada neste navegador.");
    }
}

// Função para calcular a direção do movimento com base na posição anterior
let lastPosition = null;
function calculateDirection(lat, lng) {
    if (lastPosition) {
        const deltaLat = lat - lastPosition.lat;
        const deltaLng = lng - lastPosition.lng;

        if (Math.abs(deltaLat) > Math.abs(deltaLng)) {
            return deltaLat > 0 ? 'up' : 'down';
        } else {
            return deltaLng > 0 ? 'right' : 'left';
        }
    }
    lastPosition = { lat, lng }; // Inicializa a posição anterior
    return 'right'; // Direção inicial padrão
}

// Chama a função para obter a localização GPS em tempo real
getUserGPS();


