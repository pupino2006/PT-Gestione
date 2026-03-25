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
// INIZIALIZZAZIONE
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 PT Gestione - Inizializzazione...");
    
    // Inizializza Supabase
    supabaseClient = supabase.createClient(SB_URL, SB_KEY);
    
    // MODALITÀ DEBUG: Salta login se c'è un utente demo nella localStorage
    // Oppure usa il bypass per test
    const bypassLogin = localStorage.getItem('pt_demo_mode');
    
    if (bypassLogin === 'true') {
        // Modalità demo: mostra direttamente la dashboard
        const demoUser = {
            email: localStorage.getItem('pt_demo_email') || 'demo@pt.it',
            user_metadata: {
                full_name: localStorage.getItem('pt_demo_name') || 'Utente Demo'
            }
        };
        mostraDashboard(demoUser);
        return;
    }
    
    // Controlla sessione esistente
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        mostraDashboard(session.user);
    } else {
        mostraLogin();
    }
    
    // Gestisci cambiamenti stato auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            mostraDashboard(session.user);
        } else if (event === 'SIGNED_OUT') {
            mostraLogin();
        }
    });
    
    // Inizializza UI Auth di Supabase
    inizializzaAuthUI();
});


// ============================================
// CONFIGURAZIONE AUTH UI
// ============================================
function inizializzaAuthUI() {
    const container = document.getElementById('auth-container');
    
    // Configurazione per il redirect
    supabaseClient.auth.getSession().then(({ data }) => {
        if (!data.session) {
            // Mostra form di login se non c'è sessione
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
                    <button type="submit" style="width: 100%; padding: 15px; background: var(--primary); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: bold; cursor: pointer;">
                        🔐 Accedi
                    </button>
                </form>
                <div id="auth-error" style="color: var(--danger); margin-top: 15px; display: none;"></div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #ddd;">
                    <p style="font-size: 0.8rem; color: var(--secondary); text-align: center; margin-bottom: 10px;">
                        Non hai un account?
                    </p>
                    <button onclick="attivaModalitaDemo()" style="width: 100%; padding: 12px; background: var(--warning); color: #333; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: bold; cursor: pointer;">
                        🧪 Modalità Demo (Test)
                    </button>
                </div>
                <p style="margin-top: 15px; font-size: 0.7rem; color: #999; text-align: center;">
                    Per accedere serve un account Supabase.<br>
                    <a href="#" onclick="apriSupabaseDashboard()" style="color: var(--primary);">Crea un utente qui →</a>
                </p>
            `;
        }
    });
}

// ============================================
// MODALITÀ DEMO
// ============================================
function attivaModalitaDemo() {
    // Attiva modalità demo nella localStorage
    localStorage.setItem('pt_demo_mode', 'true');
    localStorage.setItem('pt_demo_email', 'demo@pt.it');
    localStorage.setItem('pt_demo_name', 'Utente Demo PT');
    
    // Ricarica la pagina per applicare
    location.reload();
}

function disattivaModalitaDemo() {
    localStorage.removeItem('pt_demo_mode');
    localStorage.removeItem('pt_demo_email');
    localStorage.removeItem('pt_demo_name');
    location.reload();
}

function apriSupabaseDashboard() {
    window.open('https://supabase.com/dashboard', '_blank');
}


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
    // Disattiva anche la modalità demo
    const isDemoMode = localStorage.getItem('pt_demo_mode') === 'true';
    localStorage.removeItem('pt_demo_mode');
    localStorage.removeItem('pt_demo_email');
    localStorage.removeItem('pt_demo_name');
    
    if (!isDemoMode) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("Errore logout:", error);
        }
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
    
    // Percorsi alle app (ora siamo nella cartella principale)
    const percorsiApp = {
        'verifiche': 'App Verifiche Antincendio e PrimoSoccorso/index.html',
        'carico-merci': 'App Carico WEB/index.html',
        'arrivi-merce': 'App Arrivi Merce WEB/index.html',
        'calcolo-trasporti': 'App Calcolo Trasporti/index.html',
        'rapportini': 'App Rapporto di Manutenzione/index.html'
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
        title.textContent = titolo;
        iframe.src = percorso;
        viewer.style.display = 'block';
        console.log(`📱 Apertura app: ${titolo}`);
    } else {
        alert('App non disponibile: ' + tipoApp);
    }
}

function chiudiApp() {
    const iframe = document.getElementById('viewer-iframe');
    const viewer = document.getElementById('app-viewer');
    
    iframe.src = 'about:blank';
    viewer.style.display = 'none';
    console.log('✅ Tornato al menu principale');
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
