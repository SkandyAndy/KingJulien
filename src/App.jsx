import { useState, useEffect } from 'react';
import { getLogs, addLog, logsStore } from './db';
import { AlertTriangle, HardHat, List, Download } from 'lucide-react';
import Papa from 'papaparse';
import './App.css';

const MAX_PER_DAY = 10;

const CATEGORIES = {
  A: "Theoretisch instabil",
  B: "Falsche Randbedingungen",
  C: "Materialermüdung",
  D: "KingJulien-Konstante"
};

function getRank(count) {
  if (count <= 10) return "Trainee of Nonsense";
  if (count <= 50) return "Bachelor of Nonsense";
  if (count <= 120) return "Master of Misinformation";
  return "Ehrendoktor der Thermodramatik";
}

function App() {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [quote, setQuote] = useState("");
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'log'

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await getLogs();
    setLogs(data);
  };

  const handleAddSubmit = async (categoryKey) => {
    await addLog(categoryKey, quote);
    setQuote("");
    setShowModal(false);
    loadLogs();
  };

  const exportCSV = () => {
    const csv = Papa.unparse(logs.map(l => ({
      ...l,
      categoryName: CATEGORIES[l.category]
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "kj_bsm_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats
  const todayStr = new Date().toISOString().split('T')[0];
  const logsToday = logs.filter(l => l.timestamp.startsWith(todayStr)).length;
  
  const loadPercentage = Math.min((logsToday / MAX_PER_DAY) * 100, 100);
  
  const isOverheating = logsToday >= MAX_PER_DAY;

  return (
    <div className="app-container">
      <header className="header panel">
        <div className="screw screw-tl"></div>
        <div className="screw screw-tr"></div>
        <div className="screw screw-bl"></div>
        <div className="screw screw-br"></div>
        <h1><AlertTriangle size={24} color={isOverheating ? "var(--btn-red)" : "var(--accent-orange)"} /> KingJulien Bullshit-Meter v1.0</h1>
        <div className="header-tabs">
          <button className={`tab-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>DASHBOARD</button>
          <button className={`tab-btn ${view === 'log' ? 'active' : ''}`} onClick={() => setView('log')}>LOGBUCH</button>
        </div>
      </header>

      <main className="main-content">
        {view === 'dashboard' ? (
          <>
            <div className="panel status-panel">
               <div className="screw screw-tl"></div><div className="screw screw-tr"></div>
               <div className="screw screw-bl"></div><div className="screw screw-br"></div>
               <h2 className="title-analog">SYSTEM STATUS</h2>
               
               <div className="stats-grid">
                  <div className="stat-box">
                     <span className="stat-label">TOTAL VORFÄLLE</span>
                     <span className="stat-value lcd-text">{logs.length.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="stat-box">
                     <span className="stat-label">AKTUELLER RANG</span>
                     <span className="stat-value text-orange" style={{fontSize: '1em'}}>{getRank(logs.length)}</span>
                  </div>
               </div>

               <div className="gauge-container">
                  <span className="gauge-label">BELASTUNGSGRENZE (Heute: {logsToday}/{MAX_PER_DAY})</span>
                  <div className="gauge-bar-bg">
                     <div 
                        className={`gauge-bar-fill ${isOverheating ? 'danger-blink' : ''}`} 
                        style={{width: `${loadPercentage}%`, backgroundColor: isOverheating ? 'var(--gauge-danger)' : (loadPercentage > 60 ? 'var(--gauge-warn)' : 'var(--gauge-safe)')}}
                     ></div>
                  </div>
                  {isOverheating && <div className="warning-text">WARNUNG: SYSTEMÜBERHITZUNG!</div>}
               </div>
            </div>

            <div className="interaction-area">
               <div className="notaus-border">
                 <button className="notaus-btn" onClick={() => setShowModal(true)}>
                    <span className="btn-inner">LOG<br/>BULLSHIT</span>
                 </button>
               </div>
               <p className="notaus-label">QUICK LOG BUTTON</p>
            </div>
          </>
        ) : (
          <div className="panel log-panel">
            <div className="screw screw-tl"></div><div className="screw screw-tr"></div>
            <div className="screw screw-bl"></div><div className="screw screw-br"></div>
            <div className="log-header">
              <h2 className="title-analog">EREIGNIS ARCHIV</h2>
              <button className="btn-primary" onClick={exportCSV}><Download size={16}/> CSV EXPORT</button>
            </div>
            
            <div className="log-table-container">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>DATUM</th>
                    <th>TYP</th>
                    <th>ZITAT</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice().reverse().map(l => (
                    <tr key={l.id}>
                      <td>{new Date(l.timestamp).toLocaleString("de-DE")}</td>
                      <td>[{l.category}] {CATEGORIES[l.category]}</td>
                      <td className="quote-cell">{l.quote || "-"}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="3" style={{textAlign:'center', padding: '20px'}}>Keine Datenpunkte aufgezeichnet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel panel">
            <div className="screw screw-tl"></div><div className="screw screw-tr"></div>
            <div className="screw screw-bl"></div><div className="screw screw-br"></div>
            
            <h2 className="title-analog" style={{color: 'var(--btn-red)'}}>NEUER VORFALL</h2>
            
            <div className="modal-form">
              <label className="form-label">Optionales Zitat / Herleitung:</label>
              <textarea 
                className="industrial-input" 
                rows="3" 
                placeholder="Genauer Wortlaut..."
                value={quote}
                onChange={e => setQuote(e.target.value)}
              />

              <label className="form-label">Klassifizierung wählen:</label>
              <div className="category-buttons">
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <button 
                    key={key} 
                    className="cat-btn"
                    onClick={() => handleAddSubmit(key)}
                  >
                    <span className="cat-key">Typ {key}</span>
                    <span className="cat-label">{label}</span>
                  </button>
                ))}
              </div>

              <button className="btn-cancel" onClick={() => setShowModal(false)}>ABBRECHEN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
