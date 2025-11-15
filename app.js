// ============================================
// LEARNAI TV - VERSÃO 2.0 COMPLETA
// Hackathon CS Girlies - Make Learning Cool Again
// ============================================

// CONFIGURAÇÃO
const WEBHOOK_URL = 'https://iavendas-n8n.tkxtrv.easypanel.host/webhook/2a093c22-b223-4bc5-8ae8-b18446d75ceb';

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
            <p>Carregando tópicos...</p>
        </div>
    `;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'list_topics',
                question: `Liste 8 tópicos de ${currentSubject} para 3º ano`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        const topics = extractTopics(data.answer || '');
        renderTopicsList(topics);
    } catch (error) {
        console.error('Erro:', error);
        renderTopicsList(extractTopics(''));
    }
}

function extractTopics(text) {
    const lines = text.split('\n').filter(l => /^[\d•\-\*]/.test(l.trim()) && l.length > 3);
    if (lines.length > 0) {
        return lines.map(l => l.replace(/^[\d•\-\*\.\)]+\s*/, '').trim()).slice(0, 8);
    }

    const defaults = {
        'Matemática': ['Números Naturais', 'Adição e Subtração', 'Multiplicação', 'Divisão', 'Sistema Monetário', 'Geometria', 'Medidas', 'Gráficos'],
        'Português': ['Interpretação', 'Sinônimos', 'Substantivos', 'Artigos', 'Adjetivos', 'Numerais', 'Pronomes', 'Verbos'],
        'Ciências': ['Materiais', 'Propriedades', 'Invenções', 'Reciclagem', 'Experimentos', 'Corpo Humano', 'Animais', 'Plantas']
    };
    return defaults[currentSubject] || ['Tópico 1', 'Tópico 2', 'Tópico 3', 'Tópico 4'];
}

function renderTopicsList(topics) {
    const html = topics.map((t, i) => `
        <div class="topic-item" tabindex="0" onclick="selectTopic('${t.replace(/'/g, "\\'")}')">
            <div class="topic-number">${i + 1}</div>
            <div>${t}</div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="content-screen topics-container">
            <h2>📚 Escolha um tópico:</h2>
            <div class="topics-list">${html}</div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;
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
    contentArea.innerHTML = `
        <div class="content-screen">
            <h2>📖 ${topic}</h2>
            <div style="font-size: 1.6rem; line-height: 1.8;">
                ${content.replace(/\n/g, '<br><br>')}
            </div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="startTopics()">← Tópicos</button>
                <button class="btn btn-primary" onclick="startChat()">💬 Perguntar</button>
                <button class="btn btn-success" onclick="startQuiz()">🎯 Quiz</button>
            </div>
        </div>
    `;
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
            <p>Preparando quiz...</p>
        </div>
    `;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'quiz',
                question: `Crie 5 perguntas de múltipla escolha sobre ${currentSubject}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        quizQuestions = parseQuizMultiple(data.answer || '');

        if (quizQuestions.length > 0) {
            renderQuiz();
        } else throw new Error('Sem perguntas');
    } catch (error) {
        console.error('Erro:', error);
        quizQuestions = [{
            question: `Qual matéria estamos estudando?`,
            options: { a: currentSubject, b: 'Outra', c: 'Não sei', d: 'Talvez' },
            correct: 'a',
            explanation: `Estamos estudando ${currentSubject}!`
        }];
        renderQuiz();
    }
}

function parseQuizMultiple(text) {
    const parts = text.split('---').map(p => p.trim()).filter(p => p);
    return parts.map(parseQuiz).filter(q => q.question && Object.keys(q.options).length > 0);
}

function parseQuiz(text) {
    const lines = text.split('\n');
    let question = '', options = {}, correct = '', explanation = '';

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('**Pergunta:**')) {
            question = line.replace('**Pergunta:**', '').trim();
        } else if (/^[a-d]\)/.test(line)) {
            const m = line.match(/^([a-d])\)\s*(.+)$/);
            if (m) options[m[1]] = m[2];
        } else if (line.startsWith('**Resposta correta:**')) {
            correct = line.replace('**Resposta correta:**', '').trim().toLowerCase();
        } else if (line.startsWith('**Explicação:**')) {
            explanation = line.replace('**Explicação:**', '').trim();
        }
    }
    return { question, options, correct, explanation };
}

function renderQuiz() {
    if (currentQuizIndex >= quizQuestions.length) {
        showFinalScore();
        return;
    }

    const q = quizQuestions[currentQuizIndex];
    const opts = Object.keys(q.options).map(l => `
        <button class="quiz-option" data-letter="${l}" onclick="selectQuizOption('${l}', '${q.correct}')">
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
    if (selected === correct) {
        quizScore++;
        addPoints(10);
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

function showFinalScore() {
    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎉 Quiz Finalizado!</h2>
            <p style="font-size: 2rem;">Pontuação: ${quizScore}/${quizQuestions.length}</p>
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
                question: `Crie 1 pergunta desafiadora sobre ${currentSubject}`
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
    const opts = Object.keys(c.options).map(l => `
        <button class="quiz-option" data-letter="${l}" onclick="selectChallengeOption('${l}', '${c.correct}', '${c.explanation.replace(/'/g, "\\'")}')">
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
    if (selected === correct) addPoints(15);

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.disabled = true;
        if (opt.dataset.letter === correct) {
            opt.style.background = 'rgba(16, 185, 129, 0.3)';
            opt.style.borderColor = '#10b981';
        } else if (opt.dataset.letter === selected && selected !== correct) {
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