/**
 * App Gestione PT - App Contenitore Unificata
 * Gestisce autenticazione Supabase e navigazione tra moduli
 */

// ============================================
// CONFIGURAZIONE SUPABASE
// ============================================
const SB_URL = "https://vnzrewcbnoqbqvzckome.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuenJld2Nibm9xYnF2emNrb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njk2NDUsImV4cCI6MjA4NjU0NTY0NX0.pdnPyYB4DwEjZ10aF3tGigAjiwLGkP-kx07-15L4ass";

let supabaseClient;

// ============================================
// MOSTRA FORM LOGIN DIRETTAMENTE
// ============================================
function mostraFormLogin() {
    const container = document.getElementById('auth-container');
    if (!container) {
        console.error("❌ Container auth non trovato!");
        return;
    }
    
    container.innerHTML = `
        <form id="login-form" onsubmit="handleLogin(event)">
            <div style="margin-bottom: 15px;">
                <input type="email" id="email" placeholder="Email" required
                       style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 20px;">
                <input type="password" id="password" placeholder="Password" required
                       style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem;">
            </div>
            <button type="submit" id="login-btn" style="width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: bold; cursor: pointer;">
                🔐 Accedi
            </button>
        </form>
        <div id="auth-error" style="color: var(--danger); margin-top: 15px; display: none;"></div>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #666; text-align: center;">
            Accedi con le credenziali Supabase.<br>
            <a href="https://supabase.com/dashboard" target="_blank" style="color: var(--primary);">Gestisci utenti →</a>
        </p>
    `;
}

// ============================================
// INIZIALIZZAZIONE - VERSIONE SEMPLIFICATA
// ============================================
window.addEventListener('load', function() {
    console.log("🚀 PT Gestione - Caricamento completato");
    
    // Mostra subito il form di login
    mostraFormLogin();
    
    // Aspetta un attimo e poi prova a connettere Supabase
    setTimeout(function() {
        if (typeof supabase !== 'undefined') {
            console.log("✅ Supabase caricato, inizializzo...");
            supabaseClient = supabase.createClient(SB_URL, SB_KEY);
            
            // Controlla sessione
            supabaseClient.auth.getSession().then(function(result) {
                if (result.data && result.data.session) {
                    console.log("✅ Utente già loggato:", result.data.session.user.email);
                    mostraDashboard(result.data.session.user);
                }
            }).catch(function(err) {
                console.log("📝 Errore sessione (normale):", err.message);
            });
            
            // Gestisci cambi stato auth
            supabaseClient.auth.onAuthStateChange(function(event, session) {
                console.log("📢 Evento:", event);
                if (event === 'SIGNED_IN' && session) {
                    mostraDashboard(session.user);
                }
            });
        } else {
            console.error("❌ Supabase non caricato!");
            document.getElementById('auth-container').innerHTML = 
                '<div style="color: red; padding: 20px; text-align: center;">❌ Errore caricamento. <a href="">Ricarica la pagina</a></div>';
        }
    }, 500);
});


// ============================================
// GESTIONE LOGIN
// ============================================
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('auth-error');
    
    errorDiv.style.display = 'none';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log("✅ Login effettuato:", data.user.email);
        
    } catch (error) {
        console.error("❌ Errore login:", error.message);
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}


// ============================================
// LOGOUT
// ============================================
async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Errore logout:", error);
    }
    mostraLogin();
}


// ============================================
// NAVIGAZIONE
// ============================================
function mostraLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('app-viewer').style.display = 'none';
    // Mostra di nuovo il form di login
    mostraFormLogin();
}

function mostraDashboard(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('app-viewer').style.display = 'none';
    
    // Mostra info utente
    document.getElementById('user-name').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('user-email').textContent = user.email;
}


// ============================================
// APERTURA APP ESTERNE
// ============================================
function apriApp(tipoApp) {
    const iframe = document.getElementById('viewer-iframe');
    const viewer = document.getElementById('app-viewer');
    const title = document.getElementById('viewer-title');
    
    // Percorsi alle app (cartelle con underscore su GitHub)
    const percorsiApp = {
        'verifiche': 'App_Verifiche_Antincendio_e_PrimoSoccorso/index.html',
        'carico-merci': 'App_Carico_WEB/index.html',
        'arrivi-merce': 'App_Arrivi_Merce_WEB/index.html',
        'calcolo-trasporti': 'App_Calcolo_Trasporti/index.html',
        'rapportini': 'App_Rapporto_di_Manutenzione/index.html'
    };
    
    const titoliApp = {
        'verifiche': '🔥🏥 Verifiche Periodiche',
        'carico-merci': '📦 Carico Merci',
        'arrivi-merce': '🚚 Arrivi Merce',
        'calcolo-trasporti': '🚛 Calcolo Trasporti',
        'rapportini': '📝 Rapportini Manutenzione'
    };
    
    const percorso = percorsiApp[tipoApp];
    const titolo = titoliApp[tipoApp];
    
    if (percorso) {
        // Apri in nuova finestra invece che iframe
        window.open(percorso, '_blank');
        console.log(`📱 Apertura app: ${titolo}`);
    } else {
        alert('App non disponibile: ' + tipoApp);
    }
}

// ============================================
// GESTIONE SESSIONE UTENTE
// ============================================
async function verificaPermessi(ruoloRichiesto) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) return false;
    
    // Controlla ruolo utente da tabella custom (se esiste)
    const { data, error } = await supabaseClient
        .from('utenti')
        .select('ruolo')
        .eq('email', user.email)
        .single();
    
    if (error || !data) return true; // Permetti accesso base se non trova ruolo
    
    const ruoli = {
        'admin': ['verifiche-antincendio', 'primo-soccorso', 'carico-merci', 'arrivi-merce', 'calcolo-trasporti', 'rapportini'],
        'operatore': ['verifiche-antincendio', 'primo-soccorso', 'carico-merci', 'rapportini'],
        'limitato': ['verifiche-antincendio']
    };
    
    return ruoli[data.ruolo]?.includes(ruoloRichiesto) || false;
}


// ============================================
// UTILITY
// ============================================
function mostraLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function nascondiLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}
