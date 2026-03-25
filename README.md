# PT Gestione - App Contenitore Unificata

## 🎯 Descrizione
Questa è l'**app contenitore unificata** per Pannelli Termici S.r.l. che integra tutte le applicazioni in un'unica PWA con login sicuro via Supabase.

### ✅ Funzionalità
- 🔐 **Login con Supabase Auth** - Sistema di autenticazione sicuro
- 📊 **Dashboard** - Panoramica con statistiche
- 🧭 **Menu di navigazione** - Accesso rapido a tutte le app
- 📱 **Visualizzazione app** - Le app esistenti aperte in iframe
- 🔄 **Gestione sessioni** - Logout e cambio utente

## 📁 Struttura

```
App Pt Gestione/
├── index.html              # Pagina principale (login + dashboard)
├── app.js                  # Logica autenticazione e navigazione
├── manifest.json           # Configurazione PWA
├── pt.png                 # Logo app
├── README.md              # Questa documentazione
├── App Arrivi Merce/       # Versione Python (legacy)
├── App Arrivi Merce WEB/  # Versione HTML/JS (NUOVA!)
├── App Carico WEB/
├── App Calcolo Trasporti/
├── App Rapporto di Manutenzione/
└── App Verifiche Antincendio e PrimoSoccorso/
```

## 🚀 Come Usare

1. **Apri `index.html`** direttamente o con Live Server
2. **Clicca "🧪 Modalità Demo"** per testare senza account
3. **Oppure accedi** con le tue credenziali Supabase

### 📋 Credenziali Supabase
Per il login completo, usa le credenziali del progetto:
- **URL**: `https://vnzrewcbnoqbqvzckome.supabase.co`
- **Gestione utenti**: https://supabase.com/dashboard → Authentication → Users

## 🔧 Integrazione App

| App | Percorso | Stato |
|-----|----------|-------|
| **Verifiche Periodiche** | `App Verifiche Antincendio e PrimoSoccorso/index.html` | ✅ (Antincendio + Primo Soccorso) |
| Carico Merci | `App Carico WEB/index.html` | ✅ |
| **Arrivi Merce** | `App Arrivi Merce WEB/index.html` | ✅ **NUOVA** |
| Calcolo Trasporti | `App Calcolo Trasporti/index.html` | ✅ |
| Rapportini | `App Rapporto di Manutenzione/index.html` | ✅ |

## 📱 App Arrivi Merce WEB (NUOVA!)

Versione HTML/JS dell'app Arrivi Merce che sostituisce la versione Python/Streamlit.

### Funzionalità:
- 📸 Upload foto multipli
- 🔍 **OCR con Tesseract.js** (client-side)
- 📦 Gestione multi-collo
- 📊 Estrazione automatica: codice, MQ, peso, barcode
- 📥 Export Excel
- ☁️ Preparata per Supabase

## 🛠️ Tecnologie

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **PDF**: jsPDF
- **Excel**: SheetJS (xlsx)
- **OCR**: Tesseract.js
- **PWA**: Service Workers, Manifest

## 📋 Prossimi Passi

### Fase 1: Test ✅
- [x] Creare app contenitore nella root
- [x] Creare versione HTML Arrivi Merce
- [ ] Testare navigazione tra app
- [ ] Testare login Supabase

### Fase 2: Integrazione
- [ ] Tabella `utenti` in Supabase per ruoli
- [ ] Controllo permessi per app
- [ ] Completare Supabase in Arrivi Merce WEB

### Fase 3: Produzione
- [ ] Test su dispositivi reali
- [ ] Row Level Security (RLS)
- [ ] Backup configurazioni

## 📞 Supporto
Per problemi, controlla la console del browser (F12).
