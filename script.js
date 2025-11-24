document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURAZIONE FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyDtQSvMYX6lt4Px8ZhaCaFTSbGhLfi7dHk",
        authDomain: "secretsantagdr.firebaseapp.com",
        databaseURL: "https://secretsantagdr-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "secretsantagdr",
        storageBucket: "secretsantagdr.firebasestorage.app",
        messagingSenderId: "15439604314",
        appId: "1:15439604314:web:d1a9dafa88100a81750663"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

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

    // --- CARICAMENTO DATI ---
    db.ref('pairs').once('value').then(() => {
        if(loadingDiv) loadingDiv.style.display = 'none';
        if(gameContainer) gameContainer.style.display = 'block';
        initStep1();
    }, (error) => {
        console.error("Errore Firebase:", error);
        alert("Errore di connessione: " + error.message);
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
                checkIfPlayerAlreadyPlayed(selectedNick);
            }
        });
    }

    function checkIfPlayerAlreadyPlayed(nick) {
        db.ref('pairs/' + nick).once('value', (snapshot) => {
            if (snapshot.exists()) {
                const savedReceiver = snapshot.val();
                showResult(nick, savedReceiver, true);
            } else {
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
        selectCharMenu.id = 'charSelect';
        selectCharMenu.style.margin = '15px auto'; 
        selectCharMenu.style.display = 'block'; 

        const defaultCharOption = document.createElement('option');
        defaultCharOption.text = "-- Seleziona Personaggio --";
        defaultCharOption.value = "";
        selectCharMenu.add(defaultCharOption);

        players[nick].forEach(char => {
            const option = document.createElement('option');
            option.text = char;
            option.value = char;
            selectCharMenu.add(option);
        });
        step2.appendChild(selectCharMenu);

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Scopri il tuo abbinamento 🎁";
        confirmBtn.onclick = () => {
            const selectedChar = selectCharMenu.value;
            if (selectedChar === "") {
                alert("Per favore, seleziona un personaggio!");
            } else {
                generatePairingOnline(nick, selectedChar);
            }
        };
        step2.appendChild(confirmBtn);
    }
    function generatePairingOnline(giverPlayer, giverChar) {
        db.ref('pairs').once('value', (snapshot) => {
            const currentPairs = snapshot.val() || {}; 
            const takenReceivers = Object.values(currentPairs); 
            
            let receivers = allCharacters.filter(r => 
                r !== giverChar && 
                !takenReceivers.includes(r) 
            );

            receivers = receivers.filter(r => {
                const receiverPlayerName = Object.keys(players).find(p => players[p].includes(r));
                return receiverPlayerName !== giverPlayer;
            });

            if (receivers.length === 0) {
                alert("Errore: Non ci sono pairing disponibili! Contatta l'admin.");
                location.reload(); 
                return;
            }

            const receiver = receivers[Math.floor(Math.random() * receivers.length)];

            db.ref('pairs/' + giverPlayer).set(receiver, (error) => {
                if (error) {
                    alert('Errore di connessione!');
                } else {
                    showResult(giverPlayer, receiver, false);
                }
            });
        });
    }

    function showResult(giver, receiver, isReplay) {
        step1.style.display = 'none';
        step2.style.display = 'none';
        step3.style.display = 'block';
        step3.style.textAlign = 'center'; 

        let msg = isReplay ? "Avevi già effettuato l'estrazione! 🎅" : "Nuova estrazione confermata! 🎅";
        
        resultDiv.innerHTML = `<p style="font-size:0.9em">${msg}</p>Il destinatario per <strong>${giver}</strong> è:<br><br><span style="font-size: 2em; color: white; text-shadow: 2px 2px 4px #000000;">${receiver}</span>`;
    }

    // --- FUNZIONI ADMIN ---
    window.checkAdmin = function () {
        const pwd = document.getElementById('adminPassword').value;
        if (pwd === 'Dragonriders25!') {
            document.getElementById('adminPanel').style.display = 'block';
            showAllPairsFromDB();
        } else {
            alert('Password errata!');
        }
    };

    function showAllPairsFromDB() {
        db.ref('pairs').on('value', (snapshot) => {
            const pairs = snapshot.val() || {};
            const div = document.getElementById('allPairs');
            div.innerHTML = '<ul>' + Object.entries(pairs).map(([giver, receiver]) => `<li>${giver} → ${receiver}</li>`).join('') + '</ul>';
        });
    }

    window.resetDatabase = function() {
        if(confirm("SEI SICURO? Questo cancellerà tutti gli abbinamenti fatti finora!")) {
            db.ref('pairs').remove();
            alert("Database resettato!");
            location.reload();
        }
    };

    window.downloadCSV = function () {
        db.ref('pairs').once('value', (snapshot) => {
            const pairs = snapshot.val() || {};
            if (Object.keys(pairs).length < Object.keys(players).length) {
                alert('Attenzione: Non tutti hanno ancora giocato!');
            }
            let csv = 'Giver,Receiver\n';
            for (const [giver, receiver] of Object.entries(pairs)) {
                csv += `${giver},${receiver}\n`;
            }
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'secret_santa_pairs.csv';
            a.click();
        });
    };
});
