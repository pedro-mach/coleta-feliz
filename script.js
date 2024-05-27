const locations = [
    {name: "Ecoponto Central", address: "Avenida Francisco Theodoro, 1050 - Vila Industrial"},
    {name: "Cooperativa São Bernardo", address: "Avenida Prefeito Faria Lima, 630 - Parque Itália"},
    {name: "Cooperativa Reciclar", address: "Rua Serra Dourada, 165 - Jardim Itatiaia"},
    {name: "ECOPONTO JARDIM PARANAPANEMA", address: "Rua Serra dÁgua, 326 - Jardim São Fernando"},
    {name: "ECOPONTO JARDIM EULINA", address: "Avenida Marechal Rondon, 2296 - Jardim Chapadão"},
    {name: "ECOPONTO JARDIM PACAEMBU", address: "R. Dante Suriani , 382 - Chácara Cneo"},
    {name: "Cooperativa Santa Genebra", address: "Rua Brasílio da Gama, 0 - Vila Castelo Branco"},
    {name: "ECOPONTO VILA CAMPOS SALES", address: "Avenida São José dos Campos , 2255 - Jardim Nova Europa"},
    {name: "ECOPONTO JARDIM SÃO GABRIEL", address: "R. José Martins Lourenço, 140 - Jardim São Gabriel"},
    {name: "ECOPONTO PARQUE VIA NORTE", address: "Rua dos Cambarás, 200 - PARQUE VIA NORTE"},
    {name: "Cooperativa Nova Vida", address: "Rua dos Cambarás, 670 - Parque Via Norte"},
    {name: "ECOPONTO VILA UNIÃO", address: "Rua Manuel Gomes Ferreira, 42 - Parque Tropical"},
    {name: "Cooperativa Unidos na Vitória", address: "Rodovia Dom Pedro I , 140 - CEASA Campinas"},
    {name: "ECOPONTO DISTRITO DE SOUSAS", address: "Avenida Dona Júlia da Conceição Alves , 0 - Vila Santana"},
    {name: "Cooperativa Bom Sucesso", address: "Rua Engenheiro Geraldo Calcagnolo, 6 - Vila Régio"},
    {name: "Cooperativa Tatuapé", address: "Estrada do Mão Branca, 0 - Jardim São Caetano"},
    {name: "ECOPONTO PARQUE SÃO JORGE", address: "R. Plácida Pretini, 196 - Parque São Jorge"},
    {name: "ECOPONTO BARÃO GERALDO", address: "Avenida Santa Isabel, 2300 - Barão Geraldo"},
    {name: "Cooperativa Antonio da Costa Santos", address: "Avenida 2, 0 - Satélite Iris"},
    {name: "Cooperativa Aliança", address: "Rua Carlos Bellucci, 168 - Jardim Misarro"},
    {name: "ECOPONTO VIDA NOVA", address: "R. Lídia Martins de Assis, 42 - Vida Nova"},
    {name: "ECOPONTO PARQUE ITAJAÍ", address: "Rua Celso Soares Couto , 200 - Parque Itajaí"}
];

let map;
let markers = [];
let userMarker = null;
let nearestMarker = null;
let directionsRenderer;

// Inicializa o directionsRenderer com o mapa e configurações
function initializeDirectionsRenderer() {
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true // Não exibir os marcadores padrão da rota
    });
}

function clearRoute() {
    if (directionsRenderer) {
        directionsRenderer.setMap(null); // Remove a rota do mapa
    }
    document.getElementById('clearRouteButton').style.display = 'none'; // Esconde o botão
}

// Função para adicionar marcadores no mapa
function addMarkers(locations) {
    clearMarkers();
    let geocoder = new google.maps.Geocoder();
    locations.forEach(function(location) {
        geocoder.geocode({ 'address': location.address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                let marker = new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    title: location.name
                });
                markers.push(marker);
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
}

// Função para limpar marcadores do mapa
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Função para inicializar o mapa
function initMap() {
    var centerOfMap = {lat: -22.924738, lng: -47.048339}; // Centro aproximado de Campinas
    var mapOptions = {
        zoom:12,
        center: centerOfMap
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    addMarkers(locations);
}

// Função para encontrar o ponto de coleta mais próximo e colocar um marcador
function findNearest() {
    var address = document.getElementById('address').value;
    var geocoder = new google.maps.Geocoder();

    // Limpa os marcadores antigos do mapa
    if (userMarker) {
        userMarker.setMap(null);
    }
    if (nearestMarker) {
        nearestMarker.setMap(null);
    }

    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var userLocation = results[0].geometry.location;

            // Adiciona marcador para a localização do usuário
            userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Sua Localização",
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }
            });

            var nearestLocation = null;
            var nearestDistance = Number.MAX_VALUE;

            markers.forEach(marker => {
                var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, marker.getPosition());
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestLocation = marker;
                }
            });

            if (nearestLocation) {
                var nearestIndex = markers.indexOf(nearestLocation);
                var nearestTitle = nearestLocation.getTitle();
                var nearestAddress = locations[nearestIndex].address; // Acessa o endereço correspondente na lista 'locations'

                nearestMarker = new google.maps.Marker({
                    position: nearestLocation.getPosition(),
                    map: map,
                    title: nearestTitle + ' (' + nearestAddress + ')', // Adiciona o endereço ao título do marcador
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }
                });

                document.getElementById('result').innerHTML = 'O ponto de coleta mais próximo é: ' + nearestTitle +
                    ' (' + nearestAddress + '). Distância aproximada: ' + (nearestDistance / 1000).toFixed(2) + ' km.';
                    
                // Move o mapa para o centro entre o usuário e o ponto de coleta mais próximo
                map.setCenter({lat: (userLocation.lat() + nearestLocation.getPosition().lat()) / 2, lng: (userLocation.lng() + nearestLocation.getPosition().lng()) / 2});
                map.setZoom(13);

                // Exibe o botão de traçar rota
                document.getElementById('routeButton').style.display = 'block';
            }
        } else {
            document.getElementById('result').innerHTML = 'Não foi possível geolocalizar o endereço fornecido. Tente novamente.';
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Função para calcular e exibir a rota no mapa
function calculateAndDisplayRoute() {
    // Verifica se o directionsRenderer já foi inicializado
    if (!directionsRenderer) {
        initializeDirectionsRenderer();
    }

    // Limpa a rota existente, se houver
    directionsRenderer.setMap(null);
    directionsRenderer.setMap(map);

    var directionsService = new google.maps.DirectionsService();
    var address = document.getElementById('address').value;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var userLocation = results[0].geometry.location;

            // Encontra o ponto de coleta mais próximo
            var nearestLocation = null;
            var nearestDistance = Number.MAX_VALUE;

            markers.forEach(marker => {
                var distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, marker.getPosition());
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestLocation = marker;
                }
            });

            // Se encontrou o ponto mais próximo, traça a rota
            if (nearestLocation) {
                var request = {
                    origin: userLocation,
                    destination: nearestLocation.getPosition(),
                    travelMode: 'DRIVING'
                };

                directionsService.route(request, function(result, status) {
                    if (status == 'OK') {
                        directionsRenderer.setDirections(result);
                        document.getElementById('clearRouteButton').style.display = 'block'; // Exibe o botão para limpar a rota
                    } else {
                        console.error('Directions request failed due to ' + status);
                        document.getElementById('clearRouteButton').style.display = 'none'; // Esconde o botão se a requisição da rota falhar
                    }
                });
            } else {
                console.log('No nearby location found.'); // Caso não encontre uma localização próxima
            }
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
            document.getElementById('clearRouteButton').style.display = 'none'; // Esconde o botão se a geolocalização falhar
        }
    });
}



