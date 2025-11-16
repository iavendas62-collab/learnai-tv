// ============================================
// LEARNAI TV - VERSÃO 2.0 COMPLETA
// Hackathon CS Girlies - Make Learning Cool Again
// ============================================

// CONFIGURAÇÃO
const WEBHOOK_URL = 'https://iavendas-n8n.tkxtrv.easypanel.host/webhook/313ee9cc-b465-4154-8cc9-4e8145dbd38b';

// ESTADO DA APLICAÇÃO
let currentSubject = null;
let currentTopic = null;
let currentActivity = null;
let chatHistory = [];
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

// GAMIFICAÇÃO
let userScore = 0;
let userLevel = 1;
let userXP = 0;
let levelXPRequired = 100;
let badges = [];

// ELEMENTOS DOM
const contentArea = document.getElementById('content-area');
const breadcrumb = document.getElementById('breadcrumb-text');
const subjectButtons = document.querySelectorAll('.subject-btn');

// ============================================
// FUNÇÕES DE GAMIFICAÇÃO
// ============================================
function addPoints(points) {
    userScore += points;
    userXP += points;
    checkLevelUp();
    updateScoreDisplay();
    console.log(`🎯 +${points} pontos! Total: ${userScore}`);
}

function checkLevelUp() {
    while (userXP >= levelXPRequired) {
        userXP -= levelXPRequired;
        userLevel++;
        levelXPRequired = Math.floor(levelXPRequired * 1.5);
        showLevelUpAnimation();
    }
}

function showLevelUpAnimation() {
    const div = document.createElement('div');
    div.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333;
            padding: 40px; border-radius: 20px; font-size: 2rem; font-weight: bold;
            text-align: center; box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            z-index: 10000; animation: levelUpPulse 2s ease-out;">
            🚀 LEVEL UP!<br><span style="font-size: 1.5rem;">Nível ${userLevel}!</span>
        </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => document.body.removeChild(div), 2000);
}

function updateScoreDisplay() {
    const el = document.getElementById('user-score-display');
    if (el) el.textContent = `⭐ ${userScore} pts | 📊 Nível ${userLevel}`;
}

// ============================================
// NAVEGAÇÃO: SELECIONAR MATÉRIA
// ============================================
subjectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        subjectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSubject = btn.dataset.subject;
        currentTopic = null;
        currentActivity = null;
        chatHistory = [];
        breadcrumb.textContent = currentSubject;
        showActivityHub();
    });
});

// ============================================
// HUB DE ATIVIDADES
// ============================================
function showActivityHub() {
    contentArea.innerHTML = `
        <div class="activity-hub">
            <div class="activity-card" tabindex="0" onclick="startTopics()">
                <span class="icon">📖</span>
                <h3>Estudar Tópicos</h3>
                <p>Explore ${currentSubject} com explicações visuais</p>
            </div>
            <div class="activity-card" tabindex="0" onclick="startChat()">
                <span class="icon">💬</span>
                <h3>Conversar com IA</h3>
                <p>Tire dúvidas com o tutor inteligente</p>
            </div>
            <div class="activity-card" tabindex="0" onclick="startQuiz()">
                <span class="icon">🎯</span>
                <h3>Fazer Quiz</h3>
                <p>Teste seus conhecimentos</p>
            </div>
            <div class="activity-card" tabindex="0" onclick="startChallenge()">
                <span class="icon">🎲</span>
                <h3>Desafio Surpresa</h3>
                <p>Atividade surpresa escolhida pela IA!</p>
            </div>
        </div>
    `;
    setTimeout(() => document.querySelector('.activity-card').focus(), 100);
}

// ============================================
// ESTUDAR TÓPICOS
// ============================================
async function startTopics() {
    currentActivity = 'topics';
    breadcrumb.textContent = `${currentSubject} > Estudar Tópicos`;
    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>Carregando tópicos de ${currentSubject}...</p>
        </div>
    `;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'list_topics',
                question: `Liste 8 tópicos principais de ${currentSubject} para aluno do 3º ano fundamental. Use formato: 1. Nome do Tópico`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Resposta completa da API:', JSON.stringify(data, null, 2));

        const answerText = data.answer || data.response || data.output || '';
        console.log('📝 Texto da resposta:', answerText);

        const topics = extractTopics(answerText);
        renderTopicsList(topics);

    } catch (error) {
        console.error('❌ Erro ao carregar tópicos:', error.message);
        console.log('🔄 Usando tópicos padrão...');
        const topics = getFallbackTopics();
        renderTopicsList(topics);
    }
}

function extractTopics(text) {
    console.log('🔍 DEBUG - Texto recebido:', text);
    console.log('🔍 DEBUG - Tamanho do texto:', text.length);

    if (!text || text.trim().length === 0) {
        console.warn('⚠️ Texto vazio, usando fallback');
        return getFallbackTopics();
    }

    // Remove formatação markdown
    text = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();

    // MÉTODO 1: Extrai linhas numeradas (1., 1), 1-, etc)
    const patterns = [
        /^\d+[\.\)]\s*(.+)$/gm,           // 1. Tópico ou 1) Tópico
        /^[\d]+[\.\-\)]\s*\*\*(.+)\*\*$/gm, // 1. **Tópico**
        /^•\s*(.+)$/gm,                    // • Tópico
        /^-\s*(.+)$/gm,                    // - Tópico
        /^\*\s*(.+)$/gm                    // * Tópico
    ];

    for (let pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length >= 4) {
            const topics = matches
                .map(m => m[1].trim())
                .filter(t => t.length > 3 && t.length < 150)
                .filter(t => !t.toLowerCase().includes('aqui está'))
                .filter(t => !t.toLowerCase().includes('tópico'))
                .slice(0, 8);

            if (topics.length >= 4) {
                console.log('✅ Tópicos extraídos com padrão:', pattern.source);
                console.log('✅ Tópicos encontrados:', topics);
                return topics;
            }
        }
    }

    // MÉTODO 2: Extrai por quebras de linha (quando não tem numeração)
    const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 5 && l.length < 150)
        .filter(l => !l.toLowerCase().includes('lista'))
        .filter(l => !l.toLowerCase().includes('tópico'))
        .filter(l => !l.toLowerCase().includes('escolha'))
        .filter(l => !/^(aqui|segue|confira|veja)/i.test(l))
        .slice(0, 8);

    if (lines.length >= 4) {
        console.log('✅ Tópicos extraídos por linhas:', lines);
        return lines;
    }

    // MÉTODO 3: Fallback
    console.warn('⚠️ Nenhum padrão detectado, usando fallback para:', currentSubject);
    return getFallbackTopics();
}

function getFallbackTopics() {
    const defaults = {
        'Matemática': [
            'Números Naturais e Operações',
            'Adição e Subtração',
            'Multiplicação e Divisão',
            'Sistema Monetário Brasileiro',
            'Geometria Básica',
            'Medidas de Comprimento',
            'Frações Simples',
            'Gráficos e Tabelas'
        ],
        'Português': [
            'Interpretação de Texto',
            'Sinônimos e Antônimos',
            'Substantivos e Classificação',
            'Artigos Definidos e Indefinidos',
            'Adjetivos e Concordância',
            'Numerais',
            'Pronomes Pessoais',
            'Verbos no Modo Indicativo',
            'Análise Sintática',
            'Produção de Texto'
        ],
        'Ciências': [
            'Materiais e Propriedades',
            'Estados da Matéria',
            'Invenções e Tecnologia',
            'Reciclagem e Meio Ambiente',
            'Corpo Humano e Saúde',
            'Animais Vertebrados',
            'Plantas e Fotossíntese',
            'Ciclo da Água'
        ],
        'História': [
            'História de Fortaleza',
            'Primeiros Habitantes do Ceará',
            'Colonização Portuguesa',
            'Cultura e Tradições Locais',
            'Lazer e Turismo',
            'Monumentos Históricos',
            'Festas Populares',
            'Personagens Importantes'
        ],
        'Geografia': [
            'Mapas de Fortaleza',
            'Região Metropolitana',
            'Relevo do Ceará',
            'Clima e Vegetação',
            'Impactos Ambientais no Campo',
            'Zona Rural e Urbana',
            'Hidrografia Local',
            'Atividades Econômicas'
        ],
        'Idiomas': [
            'Greetings (Cumprimentos)',
            'Numbers (Números)',
            'Colors (Cores)',
            'Family Members (Família)',
            'Animals (Animais)',
            'Food and Drinks (Comida)',
            'School Objects (Material Escolar)',
            'Verb To Be (Ser/Estar)'
        ]
    };

    return defaults[currentSubject] || [
        'Introdução ao Tema',
        'Conceitos Fundamentais',
        'Aplicações Práticas',
        'Exercícios Básicos',
        'Curiosidades',
        'Revisão Geral',
        'Desafios',
        'Aprofundamento'
    ];
}

function renderTopicsList(topics) {
    console.log('🎨 Renderizando', topics.length, 'tópicos:', topics);

    if (!topics || topics.length === 0) {
        console.error('❌ Array de tópicos vazio!');
        topics = getFallbackTopics();
    }

    const html = topics.map((t, i) => `
        <div class="topic-item" tabindex="0" onclick="selectTopic('${t.replace(/'/g, "\\'")}')">
            <div class="topic-number">${i + 1}</div>
            <div>${t}</div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="content-screen topics-container">
            <h2>📚 Escolha um tópico de ${currentSubject}:</h2>
            <div class="topics-list">${html}</div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;

    setTimeout(() => document.querySelector('.topic-item').focus(), 100);
}

async function selectTopic(topic) {
    currentTopic = topic;
    breadcrumb.textContent = `${currentSubject} > ${topic}`;
    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>🎨 Preparando aula de ${topic}...</p>
        </div>
    `;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                topic: topic,
                study_mode: 'explicacao',
                question: `Explique ${topic} para criança de 8 anos. Use exemplos práticos.`
            })
        });

        const data = await response.json();
        renderTopicContent(topic, data.answer || 'Conteúdo não disponível.');
    } catch (error) {
        console.error('Erro:', error);
        contentArea.innerHTML = `<div class="content-screen"><h2>❌ Erro</h2><p>Não foi possível carregar.</p></div>`;
    }
}

function renderTopicContent(topic, content) {
    // Adiciona formas geométricas visuais no texto
    content = addGeometricShapes(content);
    
    // Verifica se há menção de atividade interativa
    const hasInteractiveCall = /desenhar|desenhe|vamos (fazer|criar|desenhar)|pratique|faça você/gi.test(content);
    
    const interactiveButton = hasInteractiveCall ? `
        <button class="btn" style="background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; margin-top: 20px;" onclick="openDrawingCanvas()">
            🎨 Vamos Desenhar Juntos!
        </button>
    ` : '';
    
    contentArea.innerHTML = `
        <div class="content-screen">
            <h2>📖 ${topic}</h2>
            <div style="font-size: 1.6rem; line-height: 1.8; max-width: 900px; margin: 0 auto;">
                ${content.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}
            </div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="startTopics()">← Tópicos</button>
                <button class="btn btn-primary" onclick="startChat()">💬 Perguntar</button>
                <button class="btn btn-success" onclick="startQuiz()">🎯 Quiz</button>
            </div>
        </div>
    `;
}

function addGeometricShapes(text) {
    // Mapeia palavras-chave para formas visuais SVG ou Unicode
    const shapes = {
        'círculo': '<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(45deg, #3b82f6, #2563eb); vertical-align: middle; margin: 0 5px;"></span>',
        'circulo': '<span style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(45deg, #3b82f6, #2563eb); vertical-align: middle; margin: 0 5px;"></span>',
        'quadrado': '<span style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(45deg, #10b981, #059669); vertical-align: middle; margin: 0 5px;"></span>',
        'triângulo': '<span style="display: inline-block; width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 26px solid #f59e0b; vertical-align: middle; margin: 0 5px;"></span>',
        'triangulo': '<span style="display: inline-block; width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 26px solid #f59e0b; vertical-align: middle; margin: 0 5px;"></span>',
        'retângulo': '<span style="display: inline-block; width: 40px; height: 25px; background: linear-gradient(45deg, #8b5cf6, #7c3aed); vertical-align: middle; margin: 0 5px;"></span>',
        'retangulo': '<span style="display: inline-block; width: 40px; height: 25px; background: linear-gradient(45deg, #8b5cf6, #7c3aed); vertical-align: middle; margin: 0 5px;"></span>'
    };
    
    // Adiciona formas após mencionar a palavra
    for (const [word, shape] of Object.entries(shapes)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, match => `${match} ${shape}`);
    }
    
    return text;
}

function openDrawingCanvas() {
    contentArea.innerHTML = `
        <div class="content-screen">
            <h2>🎨 Vamos Desenhar Juntos!</h2>
            <p style="font-size: 1.4rem; margin-bottom: 20px;">Use o mouse ou dedo para desenhar!</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <canvas id="drawing-canvas" 
                    style="border: 4px solid #3b82f6; border-radius: 20px; cursor: crosshair; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"
                    width="700" 
                    height="500">
                </canvas>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="changeColor('#000000')">⚫ Preto</button>
                <button class="btn btn-primary" onclick="changeColor('#3b82f6')">🔵 Azul</button>
                <button class="btn btn-primary" onclick="changeColor('#ef4444')">🔴 Vermelho</button>
                <button class="btn btn-primary" onclick="changeColor('#10b981')">🟢 Verde</button>
                <button class="btn btn-primary" onclick="changeColor('#f59e0b')">🟡 Amarelo</button>
                <button class="btn btn-primary" onclick="changeColor('#8b5cf6')">🟣 Roxo</button>
                <button class="btn btn-success" onclick="clearCanvas()">🗑️ Limpar</button>
            </div>
            
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="backToTopic()">← Voltar ao Tópico</button>
            </div>
        </div>
    `;
    
    initializeCanvas();
}

let drawing = false;
let currentColor = '#000000';
let ctx = null;

function initializeCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events para mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
}

function startDrawing(e) {
    drawing = true;
    const rect = e.target.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!drawing) return;
    const rect = e.target.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function changeColor(color) {
    currentColor = color;
    if (ctx) ctx.strokeStyle = color;
}

function clearCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function backToTopic() {
    if (currentTopic) {
        selectTopic(currentTopic);
    } else {
        showActivityHub();
    }
}

// ============================================
// CHAT COM IA
// ============================================
function startChat() {
    currentActivity = 'chat';
    breadcrumb.textContent = `${currentSubject} > Chat`;

    const msgs = chatHistory.map(m => `
        <div class="message ${m.role}">
            ${m.role === 'ai' ? '🤖 ' : '👤 '}${renderLatexInMessage(m.text)}
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="chat-container">
            <h2 style="color: #3b82f6;">💬 Chat com IA</h2>
            <div class="chat-messages" id="chat-messages">
                ${msgs || '<p style="text-align: center; color: #6b7280;">Olá! Pergunte sobre ' + currentSubject + '! 😊</p>'}
            </div>
            <div class="chat-input-box">
                <input type="text" id="chat-input" placeholder="Digite sua pergunta..." />
                <button class="btn btn-primary" onclick="sendChatMessage()">Enviar</button>
            </div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;

    document.getElementById('chat-input').focus();
    document.getElementById('chat-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage();
        }
    });

    setTimeout(() => {
        const el = document.getElementById('chat-messages');
        if (el) applyKatexToElement(el);
    }, 100);
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    if (!question) return;

    chatHistory.push({ role: 'user', text: question });
    chatHistory.push({ role: 'ai', text: '⏳ Pensando...' });
    startChat();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                topic: currentTopic || '',
                study_mode: 'chat',
                question: question
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        chatHistory[chatHistory.length - 1] = { role: 'ai', text: data.answer || 'Erro ao responder.' };
        startChat();

        setTimeout(() => {
            const el = document.getElementById('chat-messages');
            if (el) {
                el.scrollTop = el.scrollHeight;
                applyKatexToElement(el);
            }
        }, 150);
    } catch (error) {
        console.error('Erro:', error);
        chatHistory[chatHistory.length - 1] = { role: 'ai', text: '❌ Erro na conexão.' };
        startChat();
    }
}

function renderLatexInMessage(text) {
    text = text.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    text = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    text = text.replace(
        /\[([^\]]+)\]\((https:\/\/www\.wolframalpha\.com[^\)]+)\)/g,
        '<a href="$2" target="_blank" style="color: #ff6b35;">$1 🔗</a>'
    );
    return text.replace(/\n/g, '<br>');
}

function applyKatexToElement(element) {
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
}

// ============================================
// QUIZ
// ============================================
async function startQuiz() {
    currentActivity = 'quiz';
    breadcrumb.textContent = `${currentSubject} > Quiz`;
    quizQuestions = [];
    currentQuizIndex = 0;
    quizScore = 0;

    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>🎯 Preparando quiz de ${currentSubject}...</p>
        </div>
    `;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

        const topicInfo = currentTopic ? ` sobre ${currentTopic}` : '';

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                topic: currentTopic || '',
                study_mode: 'quiz',
                question: `Crie EXATAMENTE 5 perguntas de múltipla escolha${topicInfo} sobre ${currentSubject} para aluno do 3º ano fundamental.

Formato obrigatório para CADA pergunta:

Pergunta 1: [texto da pergunta]?
a) [opção A]
b) [opção B]
c) [opção C]
d) [opção D]
Resposta correta: [letra]
Explicação: [por que está correta]

---

Repita esse formato exato para as 5 perguntas, separando cada uma com "---"`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 QUIZ - Resposta completa:', JSON.stringify(data, null, 2));

        const answerText = data.answer || data.response || data.output || '';
        console.log('📝 QUIZ - Texto da resposta:', answerText);

        quizQuestions = parseQuizMultiple(answerText);

        if (quizQuestions.length === 0) {
            console.warn('⚠️ Nenhuma pergunta válida, usando fallback');
            throw new Error('Sem perguntas válidas');
        }

        console.log('✅ Quiz carregado com', quizQuestions.length, 'perguntas');
        renderQuiz();

    } catch (error) {
        console.error('❌ Erro ao gerar quiz:', error);
        quizQuestions = generateFallbackQuiz();
        renderQuiz();
    }
}

function parseQuizMultiple(text) {
    console.log('🔍 QUIZ DEBUG - Texto recebido:', text);
    console.log('🔍 QUIZ DEBUG - Tamanho:', text.length);

    if (!text || text.trim().length === 0) {
        console.warn('⚠️ Texto do quiz vazio!');
        return [];
    }

    // Remove formatação markdown
    text = text.replace(/\*\*/g, '').replace(/\*/g, '');

    // MÉTODO 1: Tenta dividir por separadores comuns
    let parts = [];

    // Tenta separador ---
    if (text.includes('---')) {
        parts = text.split('---').map(p => p.trim()).filter(p => p.length > 20);
        console.log('✅ Dividido por --- :', parts.length, 'perguntas');
    }

    // Tenta separador Pergunta X:
    if (parts.length === 0 && /Pergunta \d+:/gi.test(text)) {
        parts = text.split(/Pergunta \d+:/gi).map(p => p.trim()).filter(p => p.length > 20);
        console.log('✅ Dividido por "Pergunta X":', parts.length, 'perguntas');
    }

    // Tenta separador **Pergunta X**
    if (parts.length === 0 && /\*\*Pergunta \d+\*\*/gi.test(text)) {
        parts = text.split(/\*\*Pergunta \d+\*\*/gi).map(p => p.trim()).filter(p => p.length > 20);
        console.log('✅ Dividido por "**Pergunta X**":', parts.length, 'perguntas');
    }

    // Tenta números seguidos de ponto no início da linha
    if (parts.length === 0) {
        const regex = /(?=^\d+\.\s)/gm;
        parts = text.split(regex).map(p => p.trim()).filter(p => p.length > 20);
        console.log('✅ Dividido por números:', parts.length, 'perguntas');
    }

    // Se ainda não achou nada, trata como pergunta única
    if (parts.length === 0) {
        parts = [text];
        console.log('⚠️ Tratando como pergunta única');
    }

    const questions = parts.map(parseQuiz).filter(q => {
        const isValid = q.question && Object.keys(q.options).length >= 2;
        if (!isValid) {
            console.warn('❌ Pergunta inválida descartada:', q);
        }
        return isValid;
    });

    console.log('✅ Total de perguntas válidas:', questions.length);
    return questions;
}

function parseQuiz(text) {
    console.log('🔍 Parseando pergunta:', text.substring(0, 150) + '...');

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let question = '', options = {}, correct = '', explanation = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`  Linha ${i}: "${line.substring(0, 60)}..."`);

        // FILTRO: Ignora linhas introdutórias e saudações
        const isIntroLine = /^(aqui|olá|oi|bem-vindo|vamos|segue|confira|tudo no formato|benjamim)/gi.test(line);
        if (isIntroLine && !line.includes('?')) {
            console.log(`  ⊗ Ignorada (introdução): "${line.substring(0, 40)}..."`);
            continue;
        }

        // CASO 1: Linha contém "Pergunta:" seguido do texto (mesma linha ou próxima)
        if (!question && /^Pergunta\s*\d*\s*:/gi.test(line)) {
            console.log('  ✓ Detectado label "Pergunta:"');
            const afterColon = line.split(':').slice(1).join(':').trim();
            if (afterColon && afterColon.length > 3) {
                question = afterColon;
                console.log(`  ✓ Pergunta extraída (mesma linha): "${question}"`);
            } else if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                if (!nextLine.match(/^([a-dA-D])\s*[\)\.\-\:]/)) {
                    question = nextLine;
                    i++; // Pula a próxima
                    console.log(`  ✓ Pergunta extraída (próxima linha): "${question}"`);
                }
            }
            continue;
        }

        // CASO 2: Linha com '?' é a pergunta (mas NÃO se for introdução)
        if (!question && line.includes('?') && !isIntroLine) {
            question = line
                .replace(/^\d+[\.\)]\s*/, '')
                .replace(/\*\*/g, '')
                .trim();
            console.log(`  ✓ Pergunta detectada por '?': "${question}"`);
            continue;
        }

        // Detecta opções
        const optionMatch = line.match(/^([a-dA-D])\s*[\)\.\-\:]\s*(.+)$/);
        if (optionMatch) {
            const letter = optionMatch[1].toLowerCase();
            const text = optionMatch[2].trim();
            options[letter] = text;
            console.log(`  ✓ Opção ${letter}: "${text.substring(0, 40)}..."`);
            continue;
        }

        // Detecta resposta correta
        if (line.toLowerCase().includes('resposta') && line.toLowerCase().includes('correta')) {
            // Tenta pegar letra após os dois pontos: "Resposta correta: b"
            const afterColon = line.split(':')[1];
            if (afterColon) {
                const correctMatch = afterColon.match(/[a-dA-D]/);
                if (correctMatch) {
                    correct = correctMatch[0].toLowerCase();
                    console.log(`  ✓ Resposta correta detectada: ${correct} (de "${line}")`);
                }
            }
            continue;
        }

        // Detecta explicação
        if (line.toLowerCase().includes('explicação') || line.toLowerCase().includes('explicacao') || line.toLowerCase().includes('porque')) {
            explanation = line
                .replace(/Explicação:?/gi, '')
                .replace(/Explicacao:?/gi, '')
                .replace(/Porque:?/gi, '')
                .trim();
            console.log(`  ✓ Explicação: "${explanation.substring(0, 40)}..."`);
        }
    }

    // Fallbacks
    if (!correct && Object.keys(options).length > 0) {
        correct = 'a';
        console.warn('⚠️ Resposta correta não detectada, usando "a"');
    }

    if (!question || question.trim().length === 0) {
        question = 'Pergunta não encontrada - verifique o formato';
        console.error('❌ ERRO: Pergunta vazia!');
    }

    if (!explanation) {
        explanation = 'Explicação indisponível';
    }

    // VALIDAÇÃO INTELIGENTE: Desabilitada temporariamente - causava mais problemas
    // A detecção da resposta correta já funciona corretamente agora
    console.log(`✅ Usando resposta declarada: '${correct}'`);

    const result = { question, options, correct, explanation };
    console.log('📝 Resultado final:', JSON.stringify(result, null, 2));

    return result;
}

function validateCorrectAnswer(options, declaredCorrect, explanation) {
    console.log('🔍 Validando resposta correta...');
    
    // Se não tem explicação, mantém a resposta declarada
    if (!explanation || explanation === 'Explicação indisponível') {
        return declaredCorrect;
    }

    const expLower = explanation.toLowerCase();
    
    // Pega os primeiros 100 caracteres da explicação (parte mais importante)
    const expStart = expLower.substring(0, 100);
    
    let bestMatch = declaredCorrect;
    let highestScore = 0;
    let declaredScore = 0;

    for (const [letter, optionText] of Object.entries(options)) {
        let score = 0;
        const optLower = optionText.toLowerCase();
        
        // SCORE POR POSIÇÃO: Opção que aparece no INÍCIO da explicação ganha mais pontos
        const positionInExp = expLower.indexOf(optLower);
        if (positionInExp >= 0 && positionInExp < 50) {
            score += 30; // Aparece nos primeiros 50 caracteres
            console.log(`  ✓ Opção ${letter} ("${optionText}") no INÍCIO da explicação (score +30)`);
        } else if (positionInExp >= 50 && positionInExp < 100) {
            score += 15; // Aparece entre 50-100 caracteres
            console.log(`  ✓ Opção ${letter} ("${optionText}") na explicação (score +15)`);
        } else if (positionInExp >= 100) {
            score += 5; // Aparece depois, menos relevante
            console.log(`  ✓ Opção ${letter} ("${optionText}") no final da explicação (score +5)`);
        }
        
        // Extrai números da opção e explicação
        const optNumbers = optionText.match(/\d+/g) || [];
        const expNumbers = explanation.match(/\d+/g) || [];
        
        // Verifica se algum número da opção aparece na explicação
        for (const num of optNumbers) {
            if (expNumbers.includes(num)) {
                score += 20;
                console.log(`  ✓ Número "${num}" da opção ${letter} aparece na explicação (score +20)`);
            }
        }

        // Se a explicação menciona especificamente esta letra
        const letterPatterns = [
            new RegExp(`\\b${letter}\\)`, 'i'),
            new RegExp(`opção\\s+${letter}`, 'i'),
            new RegExp(`alternativa\\s+${letter}`, 'i'),
            new RegExp(`letra\\s+${letter}`, 'i')
        ];
        
        for (const pattern of letterPatterns) {
            if (pattern.test(explanation)) {
                score += 40;
                console.log(`  ✓ Letra ${letter} mencionada explicitamente (score +40)`);
                break;
            }
        }

        // Guarda o score da resposta declarada
        if (letter === declaredCorrect) {
            declaredScore = score;
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = letter;
        }
    }

    // SÓ corrige se a diferença for SIGNIFICATIVA (pelo menos 15 pontos)
    if (bestMatch !== declaredCorrect && (highestScore - declaredScore) >= 15) {
        console.log(`🔧 Resposta corrigida: '${declaredCorrect}' (score ${declaredScore}) → '${bestMatch}' (score ${highestScore})`);
        return bestMatch;
    }

    console.log(`✓ Resposta '${declaredCorrect}' mantida (score: ${declaredScore}, melhor: ${highestScore})`);
    return declaredCorrect;
}

function renderQuiz() {
    if (currentQuizIndex >= quizQuestions.length) {
        showFinalScore();
        return;
    }

    const q = quizQuestions[currentQuizIndex];
    console.log('🎯 RENDER QUIZ DEBUG - Pergunta atual:', currentQuizIndex, q);
    console.log('🎯 RENDER QUIZ DEBUG - Resposta correta detectada:', q.correct);

    const opts = Object.keys(q.options).map(l => `
        <button class="quiz-option" data-letter="${l.toLowerCase()}" onclick="selectQuizOption('${l.toLowerCase()}', '${q.correct}')">
            ${l}) ${q.options[l]}
        </button>
    `).join('');

    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎯 Quiz (${currentQuizIndex + 1}/${quizQuestions.length})</h2>
            <p style="font-size: 1.8rem; margin-bottom: 30px;">${q.question}</p>
            <div class="quiz-options">${opts}</div>
        </div>
    `;
}

function selectQuizOption(selected, correct) {
    console.log('🎯 QUIZ DEBUG - Selecionada:', selected, 'Correta:', correct);
    console.log('🎯 QUIZ DEBUG - Tipo selecionada:', typeof selected, 'Tipo correta:', typeof correct);

    // Converte para minúsculo para garantir comparação
    selected = selected.toLowerCase();
    correct = correct.toLowerCase();

    console.log('🎯 QUIZ DEBUG - Após normalização - Selecionada:', selected, 'Correta:', correct);

    const isCorrect = selected === correct;
    console.log('🎯 QUIZ DEBUG - É correta?', isCorrect);

    if (isCorrect) {
        quizScore++;
        addPoints(10);
        console.log('✅ QUIZ - Resposta CORRETA! Score:', quizScore);
    } else {
        console.log('❌ QUIZ - Resposta ERRADA!');
    }

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.disabled = true;
        const l = opt.dataset.letter;
        if (l === correct) {
            opt.style.background = 'rgba(16, 185, 129, 0.3)';
            opt.style.borderColor = '#10b981';
        } else if (l === selected && selected !== correct) {
            opt.style.background = 'rgba(239, 68, 68, 0.3)';
            opt.style.borderColor = '#ef4444';
        }
    });

    const exp = quizQuestions[currentQuizIndex].explanation;
    const msg = selected === correct ? 'Parabéns! ✅' : `A correta é '${correct.toUpperCase()}' porque ${exp}`;

    const feedback = document.createElement('div');
    feedback.innerHTML = `<p style="font-size: 1.4rem; margin-top: 20px; color: ${selected === correct ? '#10b981' : '#ef4444'};">${msg}</p>`;

    const nextBtn = document.createElement('div');
    nextBtn.innerHTML = `<div class="action-bar" style="margin-top: 20px;"><button class="btn btn-primary" onclick="nextQuizQuestion()">${currentQuizIndex < quizQuestions.length - 1 ? 'Próximo →' : 'Ver resultado'}</button></div>`;

    const container = document.querySelector('.quiz-question');
    container.appendChild(feedback);
    container.appendChild(nextBtn);
}

function nextQuizQuestion() {
    currentQuizIndex++;
    renderQuiz();
}

function generateFallbackQuiz() {
    console.log('🔄 Gerando quiz fallback para:', currentSubject);

    const quizzes = {
        'Matemática': [
            {
                question: 'Quanto é 5 + 3?',
                options: { a: '7', b: '8', c: '9', d: '10' },
                correct: 'b',
                explanation: '5 + 3 = 8'
            },
            {
                question: 'Qual é o resultado de 4 x 2?',
                options: { a: '6', b: '8', c: '10', d: '12' },
                correct: 'b',
                explanation: '4 multiplicado por 2 é igual a 8'
            },
            {
                question: 'Quanto é 10 - 6?',
                options: { a: '3', b: '4', c: '5', d: '6' },
                correct: 'b',
                explanation: '10 menos 6 é igual a 4'
            },
            {
                question: 'Qual forma geométrica tem 3 lados?',
                options: { a: 'Quadrado', b: 'Círculo', c: 'Triângulo', d: 'Retângulo' },
                correct: 'c',
                explanation: 'O triângulo tem exatamente 3 lados'
            },
            {
                question: 'Quanto é 12 ÷ 3?',
                options: { a: '2', b: '3', c: '4', d: '5' },
                correct: 'c',
                explanation: '12 dividido por 3 é igual a 4'
            }
        ],
        'Português': [
            {
                question: 'Qual palavra é um substantivo?',
                options: { a: 'Correr', b: 'Casa', c: 'Bonito', d: 'Rapidamente' },
                correct: 'b',
                explanation: 'Casa é um substantivo (nome de coisa)'
            },
            {
                question: 'Qual é o sinônimo de "feliz"?',
                options: { a: 'Triste', b: 'Alegre', c: 'Bravo', d: 'Cansado' },
                correct: 'b',
                explanation: 'Alegre tem o mesmo significado de feliz'
            },
            {
                question: 'Quantas vogais tem no alfabeto português?',
                options: { a: '3', b: '4', c: '5', d: '6' },
                correct: 'c',
                explanation: 'São 5 vogais: A, E, I, O, U'
            },
            {
                question: 'Qual frase está correta?',
                options: { a: 'O menino correu', b: 'O menino correram', c: 'Os menino correu', d: 'Os meninos corre' },
                correct: 'a',
                explanation: 'Sujeito e verbo devem concordar em número'
            },
            {
                question: 'Qual é o plural de "animal"?',
                options: { a: 'Animais', b: 'Animales', c: 'Animalos', d: 'Animaes' },
                correct: 'a',
                explanation: 'O plural correto é "animais"'
            }
        ],
        'Ciências': [
            {
                question: 'O que as plantas fazem com a luz do sol?',
                options: { a: 'Dormem', b: 'Fotossíntese', c: 'Respiram', d: 'Crescem' },
                correct: 'b',
                explanation: 'As plantas fazem fotossíntese usando luz solar'
            },
            {
                question: 'Quantos estados físicos tem a água?',
                options: { a: '1', b: '2', c: '3', d: '4' },
                correct: 'c',
                explanation: 'Sólido (gelo), líquido (água) e gasoso (vapor)'
            },
            {
                question: 'Qual órgão bombeia o sangue no corpo?',
                options: { a: 'Pulmão', b: 'Cérebro', c: 'Coração', d: 'Estômago' },
                correct: 'c',
                explanation: 'O coração é responsável por bombear o sangue'
            },
            {
                question: 'O que reciclamos para proteger o meio ambiente?',
                options: { a: 'Comida', b: 'Lixo', c: 'Ar', d: 'Luz' },
                correct: 'b',
                explanation: 'Reciclar lixo ajuda a proteger a natureza'
            },
            {
                question: 'Qual animal é um mamífero?',
                options: { a: 'Peixe', b: 'Cachorro', c: 'Pássaro', d: 'Cobra' },
                correct: 'b',
                explanation: 'Cachorro é um mamífero (mama quando filhote)'
            }
        ]
    };

    return quizzes[currentSubject] || quizzes['Matemática'];
}

function showFinalScore() {
    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎉 Quiz Finalizado!</h2>
            <p style="font-size: 2rem;">Pontuação: ${quizScore}/${quizQuestions.length}</p>
            <p style="font-size: 1.4rem; color: #6b7280; margin-top: 20px;">
                👨‍👩‍👧‍👦 Faça junto com sua família!<br>
                Parabéns pelo esforço, continue firme! ⏳👏✨
            </p>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
                <button class="btn btn-primary" onclick="startQuiz()">🔄 Refazer</button>
            </div>
        </div>
    `;
}

// ============================================
// DESAFIO SURPRESA
// ============================================
async function startChallenge() {
    currentActivity = 'challenge';
    breadcrumb.textContent = `${currentSubject} > Desafio`;

    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>🎲 Preparando desafio...</p>
        </div>
    `;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'challenge',
                question: `Crie uma pergunta de múltipla escolha desafiadora sobre ${currentSubject} para aluno do 3º ano fundamental.

Formato obrigatório:
Pergunta: [texto da pergunta]?
a) [opção A]
b) [opção B]
c) [opção C]
d) [opção D]
Resposta correta: [letra]
Explicação: [breve explicação]`
            })
        });

        const data = await response.json();
        const challenge = parseQuiz(data.answer || '');
        if (challenge.question) renderChallenge(challenge);
        else throw new Error('Erro');
    } catch (error) {
        console.error('Erro:', error);
        renderChallenge({
            question: 'Qual a cor do céu?',
            options: { a: 'Azul', b: 'Verde', c: 'Vermelho', d: 'Amarelo' },
            correct: 'a',
            explanation: 'O céu é azul!'
        });
    }
}

function renderChallenge(c) {
    console.log('🎲 RENDER CHALLENGE DEBUG - Challenge:', c);
    console.log('🎲 RENDER CHALLENGE DEBUG - Resposta correta detectada:', c.correct);

    // Escapa tanto aspas simples quanto duplas na explicação
    const safeExplanation = c.explanation.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const opts = Object.keys(c.options).map(l => `
        <button class="quiz-option" data-letter="${l.toLowerCase()}" onclick="selectChallengeOption('${l.toLowerCase()}', '${c.correct}', '${safeExplanation}')">
            ${l}) ${c.options[l]}
        </button>
    `).join('');

    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎲 Desafio Surpresa!</h2>
            <p style="font-size: 1.4rem;">${c.question}</p>
            <div class="quiz-options">${opts}</div>
        </div>
    `;
}

function selectChallengeOption(selected, correct, explanation) {
    console.log('🎲 CHALLENGE DEBUG - Selecionada:', selected, 'Correta:', correct);
    console.log('🎲 CHALLENGE DEBUG - Tipo selecionada:', typeof selected, 'Tipo correta:', typeof correct);

    // Converte para minúsculo para garantir comparação
    selected = selected.toLowerCase();
    correct = correct.toLowerCase();

    console.log('🎲 CHALLENGE DEBUG - Após normalização - Selecionada:', selected, 'Correta:', correct);

    const isCorrect = selected === correct;
    console.log('🎲 CHALLENGE DEBUG - É correta?', isCorrect);

    if (isCorrect) {
        addPoints(15);
        console.log('✅ CHALLENGE - Resposta CORRETA!');
    } else {
        console.log('❌ CHALLENGE - Resposta ERRADA! Resposta correta:', correct.toUpperCase());
    }

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.disabled = true;
        const l = opt.dataset.letter;
        console.log('🎲 CHALLENGE DEBUG - Checking option:', l, 'vs correct:', correct);
        if (l === correct) {
            opt.style.background = 'rgba(16, 185, 129, 0.3)';
            opt.style.borderColor = '#10b981';
        } else if (l === selected && selected !== correct) {
            opt.style.background = 'rgba(239, 68, 68, 0.3)';
            opt.style.borderColor = '#ef4444';
        }
    });

    const msg = selected === correct ? '🎉 Acertou!' : `A correta é '${correct.toUpperCase()}' - ${explanation}`;
    const feedback = document.createElement('div');
    feedback.innerHTML = `<p style="font-size: 1.2rem; margin-top: 15px; color: ${selected === correct ? '#10b981' : '#ef4444'};">${msg}</p>`;

    const nextBtn = document.createElement('div');
    nextBtn.innerHTML = `<div class="action-bar" style="margin-top: 15px;"><button class="btn btn-success" onclick="startChallenge()">🎲 Outro Desafio</button></div>`;

    const container = document.querySelector('.quiz-question');
    container.appendChild(feedback);
    container.appendChild(nextBtn);
}

// ============================================
// NAVEGAÇÃO TECLADO
// ============================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && currentSubject) showActivityHub();
    if (e.key === 'Backspace' && document.activeElement !== document.getElementById('chat-input')) {
        e.preventDefault();
        location.reload();
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================
console.log('%c🧠 LearnAI TV 2.0', 'font-size: 24px; color: #3b82f6; font-weight: bold;');
console.log('%cHackathon CS Girlies 2025', 'font-size: 14px; color: #9333ea;');
updateScoreDisplay();
