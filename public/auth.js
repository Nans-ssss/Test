// Fonction principale encapsulée
function main() {
    const clientId = "80754982ba614be283fcae97f6ab9290"; // Remplacez par votre Client ID
    const redirectUri = "http://localhost:3001"; // L'URL de callback configurée
    const authEndpoint = "https://accounts.spotify.com/authorize";
    const scopes = [
        "streaming",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing"
    ];
    window.sdkLoaded = true;

    // Démarrage de l'authentification
    document.getElementById('login-btn').addEventListener('click', function () {
        const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}&show_dialog=true`;
        window.location.href = authUrl;
    });

    // Vérifier si un access token est présent dans l'URL de redirection
    window.addEventListener('load', function () {
        const hash = window.location.hash.substring(1).split("&").reduce(function (acc, item) {
            const [key, value] = item.split("=");
            acc[key] = value;
            return acc;
        }, {});

        const accessToken = hash.access_token;
        if (accessToken) {
            console.log("Access Token récupéré :", accessToken);
            localStorage.setItem("spotifyAccessToken", accessToken);
            if (window.sdkLoaded) {
                initializeSpotifyPlayer(accessToken);
            } else {
                console.error('SDK Spotify n\'est pas encore prêt.');
            }
        } else {
            console.error("Erreur : Aucun access token trouvé.");
        }
    });

    // Fonction d'initialisation du lecteur Spotify
    let player;

    function initializeSpotifyPlayer(accessToken) {
        // Vérifiez que le SDK est bien chargé
        if (!window.Spotify || !window.Spotify.Player) {
            console.error('Le SDK de Spotify n\'est pas encore disponible.');
            return;
        }

        // Vérifiez que le token d'accès est valide
        if (!accessToken || typeof accessToken !== 'string') {
            console.error('Token d\'accès invalide ou manquant.');
            return;
        }

        console.log("Initialisation du lecteur Spotify avec accessToken :", accessToken);
        // Créez une instance du lecteur Spotify
        player = new Spotify.Player({
            name: 'Synchronisation Lyrics Player',
            getOAuthToken: cb => { cb(accessToken); },
            volume: 0.5
        });

        // Vérifiez la validité de l'objet player
        if (!player || typeof player.addListener !== 'function') {
            console.error("Le lecteur Spotify n'a pas été correctement initialisé.");
            return;
        }

        // Ajoutez des écouteurs
        player.addListener('ready', ({ device_id }) => {
            console.log('Prêt avec Device ID:', device_id);
        });

        player.addListener('player_state_changed', state => {
            if (!state) {
                console.error('L\'état du lecteur est undefined ou null');
                return;
            }

            console.log('État du lecteur:', state);
            const currentTime = state.position / 1000; // Convertir la position en secondes
            synchronizeLyrics(currentTime);
        });

        player.addListener('player_error', ({ message }) => {
            console.error('Erreur du lecteur:', message);
        });

        // Connectez le lecteur Spotify
        player.connect().then(success => {
            if (success) {
                console.log("Le lecteur a été connecté avec succès !");
            } else {
                console.error("Échec de la connexion du lecteur.");
            }
        }).catch(error => {
            console.error("Erreur de connexion du lecteur:", error);
        });
    }

    // Synchronisation des paroles avec le temps de lecture
    const lyrics = [
        { time: 0, text: "Bienvenue dans la chanson." },
        { time: 5, text: "Les paroles sont synchronisées." },
        { time: 10, text: "Amusez-vous bien !" },
        { time: 15, text: "C'est la fin du couplet." },
        { time: 20, text: "Merci d'avoir écouté." }
    ];

    const lyricsContainer = document.getElementById('lyrics-container');

    // Affichage des paroles dans le conteneur
    lyrics.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.classList.add('line');
        lineElement.setAttribute('data-index', index);
        lineElement.textContent = line.text;
        lyricsContainer.appendChild(lineElement);
    });

    // Fonction de synchronisation des paroles
    function synchronizeLyrics(currentTime) {
        lyrics.forEach((line, index) => {
            const lineElement = lyricsContainer.querySelector(`[data-index="${index}"]`);
            if (currentTime >= line.time && (index === lyrics.length - 1 || currentTime < lyrics[index + 1].time)) {
                lineElement.classList.add('highlight');
                lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                lineElement.classList.remove('highlight');
            }
        });
    }

    // Contrôles de lecture
    document.getElementById('playPauseBtn').addEventListener('click', function () {
        if (player) {
            player.togglePlay().catch(error => {
                console.error("Erreur lors de la tentative de lecture/pause:", error);
            });
        }
    });

    document.getElementById('nextBtn').addEventListener('click', function () {
        if (player) {
            player.skipToNext().catch(error => {
                console.error("Erreur lors du saut à la piste suivante:", error);
            });
        }
    });
}

// Déclenchement de la fonction après 5 secondes
setTimeout(main, 5000);
