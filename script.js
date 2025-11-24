document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAZIONE FIREBASE ---
    
    // I tuoi dati di configurazione (formattati corretti per il web classico)
    const firebaseConfig = {
        apiKey: "AIzaSyDtQSvMYX6lt4Px8ZhaCaFTSbGhLfi7dHk",
        authDomain: "secretsantagdr.firebaseapp.com",
        databaseURL: "https://secretsantagdr-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "secretsantagdr",
        storageBucket: "secretsantagdr.firebasestorage.app",
        messagingSenderId: "15439604314",
        appId: "1:15439604314:web:d1a9dafa88100a81750663"
    };

    // Inizializza Firebase (controlla se è già attivo per non farlo due volte)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // --- FINE CONFIGURAZIONE ---

    // --- LISTA GIOCATORI ---
    const players = {
        "Dany 🦁": ["Charlie Ravengard", "Daphne Grimes", "Niara Blackthorne", "William Namari", "Arwan Frost", "Eoin Dasher"],
        "Hel 🌙": ["Caoimhe Tavis", "Jaime Fowler", "Licia Vargas", "Kieran Matthias", "Joakim Gillstead"],
        "Aesir 🪼": ["Subaru Kazuki"],
        "Ash ✨": ["Lumiel Carr"],
        "Elle 🌷": ["Arthemis Namari", "Clover Veylaren"],
        "Emma 📚": ["Elowen Roth", "Jos Varrish", "Riven Eraklyon", "Charles McQueen", "Manon Stirling"],
        "Mirai ❤️": ["Kairos Antares", "Aaron Ravengard", "Layla Stirling"],
        "Sere 🦄": ["Michaela Bjorg", "Tristan Vesper"]
    };

    const allCharacters = Object.values(players).flat();
    
    // Elementi DOM
    const loadingDiv = document.getElementById('loading');
    const gameContainer = document.getElementById('game-container');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const resultDiv = document.getElementById('result');

    // --- CARICAMENTO DATI INIZIALE ---
    // Controlliamo se Firebase risponde
    // Nota: Usiamo .ref('/') per testare la connessione alla radice o .ref('pairs')
    db.ref('pairs').once('value').then(() => {
        // Se arriviamo qui, Firebase ha risposto!
        if(loadingDiv) loadingDiv.style.display = 'none';
        if(gameContainer) gameContainer.style.display = 'block';
        initStep1();
    }, (error) => {
        // Se c'è un errore di connessione
        console.error("Errore Firebase:", error);
        alert("Errore di connessione al database: " + error.message);
    });

    function initStep1() {
        step1.innerHTML = ''; 
        const label1 = document.createElement('h3');
        label1.textContent = "Step 1: Seleziona il tuo nickname";
        label1.style.color = "white";
        step1.appendChild(label1);

        const selectPlayerMenu = document.createElement('select');
        selectPlayerMenu.id = 'playerSelect';
        
        const defaultOption = document.createElement('option');
        defaultOption.text = "-- Chi sta giocando? --";
        defaultOption.value = "";
        selectPlayerMenu.add(defaultOption);

        Object.keys(players).forEach(nick => {
            const option = document.createElement('option');
            option.text = nick;
            option.value = nick;
            selectPlayerMenu.add(option);
        });

        step1.appendChild(selectPlayerMenu);

        selectPlayerMenu.addEventListener('change', (event) => {
            const selectedNick = event.target.value;
            if (selectedNick) {
                // Prima di procedere, controlliamo se questo player ha già pescato!
                checkIfPlayerAlreadyPlayed(selectedNick);
            }
        });
    }

    function checkIfPlayerAlreadyPlayed(nick) {
        db.ref('pairs/' + nick).once('value', (snapshot) => {
            if (snapshot.exists()) {
                // Se ha già giocato, mostriamogli direttamente il suo risultato
                const savedReceiver = snapshot.val();
                showResult(nick, savedReceiver, true);
            } else {
                // Se non ha giocato, vai allo step 2
                showCharacters(nick);
            }
        });
    }

    function showCharacters(nick) {
        step1.style.display = 'none';
        step2.style.display = 'block';
        step2.innerHTML = ''; 
        step2.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = `Ciao ${nick}, quale personaggio usi?`;
        title.style.color = "white"; 
        step2.appendChild(title);
        
        const selectCharMenu = document.createElement('select');
        selectChar
