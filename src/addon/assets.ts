export const menuIcon = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>
`;

export const panel = `
    <div class="cnc-panel-header">
        <h2>CNC TA Tools</h2>
        <button id="cnc-close-btn">×</button>
    </div>
    <div class="cnc-panel-content">
        <button id="cnc-sync-btn" class="cnc-tool-btn">💾 Sync</button>
        <button id="cnc-quick-scan-btn" class="cnc-tool-btn">⚡ Quick Scan</button>
        <button id="cnc-scan-btn" class="cnc-tool-btn">🔍 Regular Scan</button>
        <button id="cnc-auto-scan-btn" class="cnc-tool-btn">🔄 Auto Scan</button>
        <button id="cnc-sheet-btn" class="cnc-tool-btn" title="Shift-click to change the sheet URL">📊 Sheet</button>
    </div>
`

export const styles = `
    #cnc-optimizer-btn {
        position: fixed;
        bottom: 90px;
        right: 5px;
        width: 48px;
        height: 48px;
        border-radius: 4px;
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
        border: 2px solid #4a90c8;
        color: #4fc3f7;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        z-index: 10000;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #cnc-optimizer-btn:hover {
        background: linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%);
        border-color: #5fa3d8;
        box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
    }

    #cnc-optimizer-btn:active {
        transform: translateY(1px);
        box-shadow: 0 1px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    #cnc-optimizer-panel {
        position: fixed;
        top: 0;
        right: -350px;
        width: 350px;
        height: 100%;
        background: rgba(30, 41, 59, 0.30);
        backdrop-filter: blur(2px);
        box-shadow: -4px 0 12px rgba(0,0,0,0.3);
        z-index: 10001;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    #cnc-optimizer-panel.open {
        right: 0;
    }
    
    .cnc-panel-header {
        padding: 20px;
        background: rgba(15, 23, 42, 0.40);
        border-bottom: 2px solid rgba(51, 65, 85, 0.9);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .cnc-panel-header h2 {
        margin: 0;
        color: #60a5fa;
        font-size: 20px;
    }

    #cnc-close-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 32px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        line-height: 1;
    }

    #cnc-close-btn:hover {
        color: #e4e4e7;
    }

    .cnc-panel-content {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
    }

    .cnc-tool-btn {
        width: 100%;
        padding: 12px;
        margin-bottom: 10px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .cnc-tool-btn:hover {
        background: #2563eb;
    }

    .cnc-tool-btn:disabled {
        background: #475569;
        cursor: not-allowed;
    }

    .cnc-tool-btn.running {
        background: #f59e0b;
        cursor: wait;
    }

    .cnc-tool-btn.running:hover {
        background: #d97706;
    }

    .cnc-tool-btn.success {
        background: #22c55e;
    }

    .cnc-tool-btn.success:hover {
        background: #16a34a;
    }

    .cnc-tool-btn.error {
        background: #ef4444;
    }

    .cnc-tool-btn.error:hover {
        background: #dc2626;
    }

    .cnc-tool-btn.active {
        background: #8b5cf6;
    }

    .cnc-tool-btn.active:hover {
        background: #7c3aed;
    }
`