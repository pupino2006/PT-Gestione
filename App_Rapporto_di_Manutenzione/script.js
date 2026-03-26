// 1. CONFIGURAZIONE SUPABASE
const SB_URL = "https://vnzrewcbnoqbqvzckome.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuenJld2Nibm9xYnF2emNrb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njk2NDUsImV4cCI6MjA4NjU0NTY0NX0.pdnPyYB4DwEjZ10aF3tGigAjiwLGkP-kx07-15L4ass";
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

// Rileva se è in modalità container o app singola
const isContainerMode = window.self !== window.parent || window.location.href.includes('PT-Gestione');

// Edge function URL
const EDGE_FUNCTION_URL = 'https://vnzrewcbnoqbqvzckome.supabase.co/functions/v1/send-email-rapportino';

let carrello = [];
let signaturePad;

// Navigazione tra le schede
function openTab(evt, tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(tab => tab.style.display = 'none');
    
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    if(evt) evt.currentTarget.classList.add('active');

    // Se apri la scheda firma, ricalcola le dimensioni del canvas
    if (tabId === 'tab3') {
        setTimeout(resizeCanvas, 50); // Piccolo ritardo per permettere al browser di mostrare il tab
    }
}

window.onload = () => {
    // 2. INIZIALIZZA FIRMA
    const canvas = document.getElementById('signature-pad');
    if (canvas) {
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            velocityFilterWeight: 0.7
        });
        resizeCanvas();
    }
    
    // Imposta la data di oggi in automatico
    if(document.getElementById('dataIntervento')) {
        document.getElementById('dataIntervento').valueAsDate = new Date();
    }
    
    console.log("Sistema pronto e connesso a Supabase");
};

// Funzione globale per il ridimensionamento del canvas
function resizeCanvas() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return;
    
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    
    if (signaturePad) signaturePad.clear(); 
}

window.addEventListener("resize", resizeCanvas);

// 3. RICERCA NEL CLOUD
async function searchInDanea() {
    let input = document.getElementById('searchArticolo');
    let query = input.value.trim();
    let divRisultati = document.getElementById('risultatiRicerca');
    
    if (query.length < 2) {
        divRisultati.innerHTML = "";
        return;
    }

    const { data, error } = await supabaseClient
        .from('articoli')
        .select('"Cod.", "Descrizione"')
        .or(`"Cod.".ilike.%${query}%,"Descrizione".ilike.%${query}%`)
        .limit(15);

    if (error) {
        console.error("Errore Supabase:", error.message);
        return;
    }

    divRisultati.innerHTML = "";

    if (!data || data.length === 0) {
        divRisultati.innerHTML = "<div style='padding:10px; color:orange;'>Nessun articolo trovato</div>";
        return;
    }

    data.forEach(art => {
        let p = document.createElement('div');
        p.className = "item-ricerca";
        p.style = "padding:15px; border-bottom:1px solid #eee; background:white; cursor:pointer; color:black; text-align:left;";
        
        let c = art["Cod."]; 
        let d = art["Descrizione"];
        
        p.innerHTML = `<strong>${c}</strong> - ${d}`;
        p.onclick = () => {
            aggiungiAlCarrello(c, d);
            divRisultati.innerHTML = "";
            input.value = "";
        };
        divRisultati.appendChild(p);
    });
}

function aggiungiAlCarrello(cod, desc) {
    carrello.push({ cod: cod, desc: desc, qta: 1 });
    aggiornaCarrelloUI();
}

function aggiornaCarrelloUI() {
    const container = document.getElementById('carrelloMateriali');
    container.innerHTML = carrello.map((item, index) => `
        <div class="card-materiale" style="border:1px solid #ddd; padding:10px; margin:10px 0; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:white;">
            <div style="flex:1">
                <b style="color:#004a99">${item.cod}</b><br>
                <small>${item.desc}</small>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="number" value="${item.qta}" style="width:50px; padding:5px;" onchange="carrello[${index}].qta=this.value">
                <button onclick="carrello.splice(${index}, 1); aggiornaCarrelloUI()" style="border:none; background:none; font-size:1.2em; color:red;">❌</button>
            </div>
        </div>
    `).join('');
}

async function generaEInviaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Recupero dati dai campi
    const tipoIntervento = document.getElementById('tipoIntervento').value;
    const operatore = document.getElementById('operatore').value;
    const zona = document.getElementById('zona').value;
    const dataInt = document.getElementById('dataIntervento').value;
    const descrizioneIntervento = document.getElementById('descrizioneIntervento').value;

    if (!operatore || !zona) {
        alert("Per favore, inserisci Operatore e Zona prima di inviare.");
        return;
    }

    // --- COSTRUZIONE PDF ---
    const img = document.querySelector('.header-logo img');
    if (img) doc.addImage(img, 'PNG', 10, 10, 50, 20);
    doc.setFontSize(18);
    doc.text("RAPPORTO DI MANUTENZIONE", 70, 25);
    doc.setFontSize(12);
    
    if (tipoIntervento) {
        doc.text(`Tipo Intervento: ${tipoIntervento}`, 10, 45);
        doc.text(`Operatore: ${operatore}`, 10, 55);
        doc.text(`Zona: ${zona}`, 10, 65);
        doc.text(`Data: ${dataInt}`, 10, 75);
    } else {
        doc.text(`Operatore: ${operatore}`, 10, 50);
        doc.text(`Zona: ${zona}`, 10, 60);
        doc.text(`Data: ${dataInt}`, 10, 70);
    }
    
    // Descrizione intervento
    if (descrizioneIntervento) {
        doc.text("Descrizione Intervento:", 10, 90);
        doc.setFontSize(10);
        const splitDesc = doc.splitTextToSize(descrizioneIntervento, 180);
        doc.text(splitDesc, 10, 100);
        doc.setFontSize(12);
    }

    doc.text("Materiali utilizzati:", 10, 90);
    let y = 100;
    carrello.forEach((item) => {
        doc.text(`- ${item.cod}: ${item.desc} (Q.tà: ${item.qta})`, 15, y);
        y += 10;
    });

    let firmaBase64 = "";
    if (!signaturePad.isEmpty()) {
        firmaBase64 = signaturePad.toDataURL();
        doc.text("Firma Cliente:", 10, y + 10);
        doc.addImage(firmaBase64, 'PNG', 10, y + 15, 50, 20);
    }

    // Trasformiamo il PDF in una stringa Base64 per l'invio via API
    const pdfBase64 = doc.output('datauristring');

    // --- STEP A: SALVATAGGIO SU SUPABASE ---
    console.log("Salvataggio nel database...");
    const { error: dbError } = await supabaseClient
        .from('rapportini')
        .insert([{
            tipo_intervento: tipoIntervento,
            operatore: operatore,
            zona: zona,
            data: dataInt,
            descrizione: descrizioneIntervento,
            materiali: carrello,
            firma: firmaBase64
        }]);

    if (dbError) {
        alert("Errore salvataggio DB: " + dbError.message);
        return;
    }

    // --- STEP B: SALVA PDF SU STORAGE E INVIO VIA EDGE FUNCTION ---
    console.log("Salvo PDF su Storage e invio email...");
    
    try {
        // 1. Carica PDF su Storage
        const pdfFileName = `rapportino_${zona}_${Date.now()}.pdf`;
        const pdfData = pdfBase64.split(',')[1];
        
        // Converte base64 a binary
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Upload su Supabase Storage (usa bucket 'ai_verifiche' esistente)
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('ai_verifiche')
            .upload(pdfFileName, bytes, {
                contentType: 'application/pdf',
                upsert: true
            });
        
        if (uploadError) {
            console.error("Errore upload:", uploadError);
            alert("Errore salvataggio PDF. Continuo con download locale.");
            doc.save(`Rapportino_${zona}.pdf`);
            return;
        }
        
        // Ottieni URL pubblico
        const { data: { publicUrl } } = supabaseClient.storage
            .from('ai_verifiche')
            .getPublicUrl(pdfFileName);
        
        console.log("PDF salvato:", publicUrl);
        
        // 2. Invia email via edge function
        const emailRes = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SB_KEY}`
            },
            body: JSON.stringify({
                to: 'geom.rip@gmail.com',
                zona: zona,
                dataInt: dataInt,
                operatore: operatore,
                descrizione: document.getElementById('descrizioneIntervento')?.value || '',
                pdfUrl: publicUrl
            })
        });

        if (emailRes.ok) {
            alert("✅ Rapporto inviato con successo e salvato nel Cloud!");
            doc.save(`Rapportino_${zona}.pdf`);
        } else {
            const errData = await emailRes.json();
            console.error(errData);
            alert("❌ Errore invio email: " + (errData.error || errData.message || 'Errore sconosciuto'));
        }
    } catch (err) {
        console.error("❌ Errore:", err);
        alert("❌ Errore: " + err.message);
    }
}