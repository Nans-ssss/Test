const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3001;

// Servir les fichiers statiques (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Page d'accueil (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Callback pour afficher la page (le serveur n'a pas besoin de traiter le fragment)
app.get('/callback', (req, res) => {
    res.send('Callback reçu ! Vous pouvez maintenant vérifier les logs dans la console.');
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré à http://localhost:${port}`);
});
