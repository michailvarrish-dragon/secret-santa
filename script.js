document.addEventListener('DOMContentLoaded', () => {
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
    const allPairsMap = {};

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const resultDiv = document.getElementById('result');

    // --- STEP 1: Menu a Tendina per i Player ---

    // PULIZIA: Rimuove qualsiasi cosa ci sia in step1
    step1.innerHTML = ''; 

    // Titolo per lo step 1
    const label1 = document.createElement('h3');
    label1.textContent = "Step 1: Seleziona il tuo nickname";
    label1.style.color = "white";
    step1.appendChild(label1);

    const selectPlayerMenu = document.createElement('select');
    selectPlayerMenu.id = 'playerSelect';
    
    // Opzione di default
    const defaultOption = document.createElement('option');
    defaultOption.text = "-- Chi sta giocando? --";
    defaultOption.value = "";
    selectPlayerMenu.add(defaultOption);

    // Riempimento menu player
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
            showCharacters(selectedNick);
        }
    });

    // ------------------------------------------------

    function showCharacters(nick) {
        step1.style.display = 'none';
        step2.style.display = 'block';
        step2.innerHTML = ''; 
        
        // CENTRATURA
        step2.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = `Ciao ${nick}, quale personaggio usi?`;
        title.style.color = "white"; 
        step2.appendChild(title);

        // --- STEP 2: Menu a Tendina per i Personaggi ---
        
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

        // --- Bottone di Conferma ---
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Scopri il tuo abbinamento 🎁";
        
        confirmBtn.onclick = () => {
            const selectedChar = selectCharMenu.value;
            if (selectedChar === "") {
                alert("Per favore, seleziona un personaggio dal menu!");
            } else {
                generatePairing(selectedChar);
            }
        };

        step2.appendChild(confirmBtn);
    }

    function generatePairing(giver) {
        let receivers = allCharacters.filter(r => r !== giver && !Object.values(allPairsMap).includes(r));
        const giverPlayer = Object.keys(players).find(p => players[p].includes(giver));
        
        receivers = receivers.filter(r => {
            const receiverPlayer = Object.keys(players).find(p => players[p].includes(r));
            return receiverPlayer !== giverPlayer;
        });

        step2.style.display = 'none';
        step3.style.display = 'block';
        step3.style.textAlign = 'center'; 

        if (receivers.length === 0) {
            resultDiv.textContent = 'Nessun pairing disponibile. Riprova o contatta l\'admin.';
            resultDiv.style.color = "white";
        } else {
            const receiver = receivers[Math.floor(Math.random() * receivers.length)];
            allPairsMap[giver] = receiver;
            // Risultato in BIANCO
            resultDiv.innerHTML = `🎅 Il destinatario per <strong>${giver}</strong> è:<br><br><span style="font-size: 2em; color: white; text-shadow: 2px 2px 4px #000000;">${receiver}</span>`;
        }
    }

    // Le funzioni per l'admin devono essere globali (window.) perché chiamate dall'HTML
    window.checkAdmin = function () {
        const pwd = document.getElementById('adminPassword').value;
        if (pwd === 'Dragonriders25!') {
            document.getElementById('adminPanel').style.display = 'block';
            showAllPairs();
        } else {
            alert('Password errata!');
        }
    };

    window.downloadCSV = function () {
        if (Object.keys(allPairsMap).length < allCharacters.length) {
            alert('Attenzione: Non tutti i personaggi sono stati ancora abbinati!');
        }
        let csv = 'Giver,Receiver\n';
        for (const [giver, receiver] of Object.entries(allPairsMap)) {
            csv += `${giver},${receiver}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'secret_santa_pairs.csv';
        a.click();
    };

    function showAllPairs() {
        const div = document.getElementById('allPairs');
        div.innerHTML = '<ul>' + Object.entries(allPairsMap).map(([giver, receiver]) => `<li>${giver} → ${receiver}</li>`).join('') + '</ul>';
    }
});
