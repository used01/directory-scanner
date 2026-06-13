// Wordlists pré-configuradas
const wordlists = {
    common: [
        'admin', 'backup', 'config', 'data', 'database', 'upload', 'api', 'assets',
        'css', 'js', 'images', 'includes', 'plugins', 'themes', 'wp-admin', 'wp-content',
        'private', 'public', 'src', 'dist', 'build', 'docs', 'test', 'tmp', 'temp',
        'cache', 'logs', 'storage', 'uploads', 'downloads', 'files', 'documents',
        'archive', 'backup', 'old', 'new', 'dev', 'prod', 'staging', 'test',
        '.git', '.env', '.htaccess', 'web.config', 'robots.txt', 'sitemap.xml',
        'xmlrpc.php', 'wp-login.php', 'wp-register.php', 'index.html', 'index.php'
    ],
    wordpress: [
        'wp-admin', 'wp-content', 'wp-includes', 'wp-json', 'wp-login.php', 'wp-register.php',
        'xmlrpc.php', 'wp-cron.php', 'wp-mail.php', 'wp-comments-post.php',
        'wp-trackback.php', 'plugins', 'themes', 'mu-plugins', 'uploads'
    ],
    default: [
        'admin', 'administrator', 'users', 'login', 'signin', 'signup', 'register',
        'account', 'profile', 'dashboard', 'panel', 'backend', 'manage', 'control'
    ],
    api: [
        'api', 'api/v1', 'api/v2', 'api/v3', 'rest', 'graphql', 'swagger', 'openapi',
        'docs', 'documentation', 'endpoints', 'status', 'health', 'auth', 'oauth', 'token'
    ]
};

let scanResults = [];
let isScanning = false;
let scanCancelled = false;

// Carregar preset de wordlist
function loadPreset(preset) {
    const textarea = document.getElementById('customWordlist');
    const select = document.getElementById('wordlistSelect');
    
    if (wordlists[preset]) {
        textarea.value = wordlists[preset].join('\n');
        select.value = 'custom';
    }
}

// Validar e processar URL
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.origin;
    } catch {
        return null;
    }
}

// Fazer requisição com fetch
async function checkUrl(baseUrl, path, timeout = 5000) {
    const fullUrl = `${baseUrl}/${path}`;
    const startTime = Date.now();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(fullUrl, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'cors'
        }).catch(() => {
            // Fallback para GET
            return fetch(fullUrl, {
                method: 'GET',
                signal: controller.signal,
                mode: 'cors'
            });
        });
        
        clearTimeout(timeoutId);
        
        return {
            status: response.status,
            statusText: response.statusText,
            contentLength: response.headers.get('content-length') || 'N/A',
            time: Date.now() - startTime
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return { status: 'timeout', time: Date.now() - startTime };
        }
        return { status: 'error', error: error.message, time: Date.now() - startTime };
    }
}

// Processar fila de URLs com controle de concorrência
async function scanWithConcurrency(baseUrl, paths, threadCount) {
    const results = [];
    const queue = [...paths];
    const workers = [];
    
    const worker = async () => {
        while (queue.length > 0 && !scanCancelled) {
            const path = queue.shift();
            
            try {
                const result = await checkUrl(baseUrl, path);
                results.push({
                    path,
                    ...result
                });
            } catch (error) {
                results.push({
                    path,
                    status: 'error',
                    error: error.message
                });
            }
            
            // Atualizar progresso
            updateProgress(results.length, paths.length);
        }
    };
    
    // Criar workers
    for (let i = 0; i < threadCount; i++) {
        workers.push(worker());
    }
    
    await Promise.all(workers);
    return results;
}

// Atualizar progresso
function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('scanProgress').textContent = `${current}/${total}`;
}

// Formatar tamanho de arquivo
function formatSize(bytes) {
    if (!bytes || bytes === 'N/A') return 'N/A';
    bytes = parseInt(bytes);
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Obter classe CSS para status
function getStatusClass(status) {
    return `status-${status}`;
}

// Adicionar resultado à tabela
function addResult(result) {
    const tbody = document.getElementById('resultsBody');
    const row = document.createElement('tr');
    
    const statusClass = getStatusClass(result.status);
    const sizeFormatted = formatSize(result.contentLength);
    const fullUrl = `${document.getElementById('targetUrl').value}/${result.path}`;
    
    row.innerHTML = `
        <td><a href="${fullUrl}" target="_blank" class="url-link">/${result.path}</a></td>
        <td><span class="status-badge ${statusClass}">${result.status}</span></td>
        <td>${sizeFormatted}</td>
        <td>${result.time}ms</td>
    `;
    
    tbody.appendChild(row);
}

// Atualizar estatísticas
function updateStats(results) {
    const stats = {
        total: results.length,
        status200: results.filter(r => r.status === 200).length,
        status3xx: results.filter(r => [301, 302, 304].includes(r.status)).length,
        status403: results.filter(r => r.status === 403).length,
        status404: results.filter(r => r.status === 404).length,
        errors: results.filter(r => r.status === 'error' || r.status === 'timeout').length
    };
    
    const statsHtml = `
        <div class="stat-box">
            <h3>Total Checado</h3>
            <div class="value">${stats.total}</div>
        </div>
        <div class="stat-box" style="border-left-color: #28a745;">
            <h3>200 OK</h3>
            <div class="value" style="color: #28a745;">${stats.status200}</div>
        </div>
        <div class="stat-box" style="border-left-color: #ffc107;">
            <h3>3xx Redirect</h3>
            <div class="value" style="color: #ffc107;">${stats.status3xx}</div>
        </div>
        <div class="stat-box" style="border-left-color: #dc3545;">
            <h3>403/404/Erro</h3>
            <div class="value" style="color: #dc3545;">${stats.status403 + stats.status404 + stats.errors}</div>
        </div>
    `;
    
    document.getElementById('statsContainer').innerHTML = statsHtml;
}

// Filtrar tabela
function filterTable() {
    const searchTerm = document.getElementById('filterInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#resultsBody tr');
    
    rows.forEach(row => {
        const path = row.cells[0].textContent.toLowerCase();
        const status = row.cells[1].textContent.trim();
        
        const matchSearch = path.includes(searchTerm);
        const matchStatus = !statusFilter || status.includes(statusFilter);
        
        row.style.display = matchSearch && matchStatus ? '' : 'none';
    });
}

// Exportar resultados como CSV
function exportResults() {
    if (scanResults.length === 0) {
        alert('Nenhum resultado para exportar!');
        return;
    }
    
    const csv = [
        ['Caminho', 'Status', 'Tamanho', 'Tempo (ms)'],
        ...scanResults.map(r => [
            `/${r.path}`,
            r.status,
            r.contentLength || 'N/A',
            r.time
        ])
    ];
    
    const csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `directory-scan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Manipular submissão do formulário
document.getElementById('scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const targetUrl = document.getElementById('targetUrl').value;
    const baseUrl = normalizeUrl(targetUrl);
    
    if (!baseUrl) {
        alert('URL inválida!');
        return;
    }
    
    let paths = [];
    const wordlistSelect = document.getElementById('wordlistSelect').value;
    
    if (wordlistSelect === 'custom') {
        paths = document.getElementById('customWordlist').value
            .split('\n')
            .map(p => p.trim())
            .filter(p => p && p.length > 0);
    } else {
        paths = wordlists[wordlistSelect] || [];
    }
    
    if (paths.length === 0) {
        alert('Nenhuma wordlist configurada!');
        return;
    }
    
    const threadCount = parseInt(document.getElementById('threadCount').value);
    
    // Preparar UI
    scanResults = [];
    isScanning = true;
    scanCancelled = false;
    
    document.getElementById('resultsPanel').classList.add('active');
    document.getElementById('resultsBody').innerHTML = '';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').style.display = 'inline-block';
    document.getElementById('loadingContainer').style.display = 'block';
    
    // Executar scan
    try {
        scanResults = await scanWithConcurrency(baseUrl, paths, threadCount);
        
        if (!scanCancelled) {
            // Filtrar resultados
            const showAll = document.getElementById('showAll').checked;
            const filtered = showAll ? scanResults : scanResults.filter(r => r.status !== 404);
            
            // Renderizar resultados
            filtered.forEach(result => addResult(result));
            updateStats(filtered);
        }
    } catch (error) {
        console.error('Erro durante scan:', error);
        alert('Erro durante o scan: ' + error.message);
    } finally {
        isScanning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').style.display = 'none';
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
    }
});

// Botão para parar scan
document.getElementById('stopBtn').addEventListener('click', () => {
    scanCancelled = true;
    isScanning = false;
});