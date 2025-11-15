// ============================================
// LearnAI TV 2.0 - Hackathon CS Girlies 2025
// Sistema educacional gamificado com IA para Smart TVs
// ============================================

// ============================================
// CONFIGURAÇÃO
// ============================================
const WEBHOOK_URL = 'https://iavendas-n8n.tkxtrv.easypanel.host/webhook/313ee9cc-b465-4154-8cc9-4e8145dbd38b';

// ============================================
// RENDERIZAR LATEX (WOLFRAM ALPHA)
// ============================================
function renderLatexInMessage(text) {
    // Converter \[ ... \] para $$ ... $$ (KaTeX)
    text = text.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');

    // Converter \( ... \) para $ ... $ (inline)
    text = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

    // Detectar links do Wolfram Alpha
    text = text.replace(
        /\[([^\]]+)\]\((https:\/\/www\.wolframalpha\.com[^\)]+)\)/g,
        '<a href="$2" target="_blank" style="color: #ff6b35; text-decoration: underline;">$1 🔗</a>'
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
// ESTADO DA APLICAÇÃO
// ============================================
let currentSubject = null;
let currentTopic = null;
let currentActivity = null;
let chatHistory = [];
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

// ============================================
// SISTEMA DE GAMIFICAÇÃO
// ============================================
let userScore = 0;
let userLevel = 1;
let userXP = 0;
let levelXPRequired = 100;
let badges = [];
let dailyChallenges = [];

// ============================================
// FUNÇÕES DE GAMIFICAÇÃO
// ============================================
function addPoints(points) {
    userScore += points;
    userXP += points;
    checkLevelUp();
    updateScoreDisplay();

    // Animação de pontos flutuantes
    const pointsDiv = document.createElement('div');
    pointsDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 100px;
            color: #ffd700;
            font-size: 2.5rem;
            font-weight: bold;
            z-index: 10000;
            animation: pointsFloat 2s ease-out forwards;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        ">
            +${points} pts! ⭐
        </div>
    `;
    document.body.appendChild(pointsDiv);
    setTimeout(() => document.body.removeChild(pointsDiv), 2000);

    console.log(`🎯 +${points} pontos! Total: ${userScore} | XP: ${userXP}/${levelXPRequired}`);
}

function checkLevelUp() {
    while (userXP >= levelXPRequired) {
        userXP -= levelXPRequired;
        userLevel++;
        levelXPRequired = Math.floor(levelXPRequired * 1.5); // XP necessário aumenta 50% por nível

        // Animação de level up
        showLevelUpAnimation();

        // Verificar badges desbloqueáveis
        checkBadges();

        console.log(`🚀 LEVEL UP! Agora você é nível ${userLevel}!`);
    }
}

function showLevelUpAnimation() {
    const levelUpDiv = document.createElement('div');
    levelUpDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
            padding: 40px;
            border-radius: 20px;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            z-index: 10000;
            animation: levelUpPulse 2s ease-out;
        ">
            🚀 LEVEL UP!<br>
            <span style="font-size: 1.5rem;">Agora você é nível ${userLevel}!</span>
        </div>
    `;
    document.body.appendChild(levelUpDiv);

    setTimeout(() => {
        document.body.removeChild(levelUpDiv);
    }, 2000);
}

function checkBadges() {
    const badgeConditions = {
        'primeiro_acertos': { name: '🏆 Primeiro Acertos', desc: 'Acertou 10 perguntas', condition: () => userScore >= 10 },
        'matematico': { name: '🧮 Matemático', desc: 'Completou 5 quizzes de Matemática', condition: () => true }, // TODO: implementar contador por matéria
        'explorador': { name: '🗺️ Explorador', desc: 'Explorou 20 tópicos diferentes', condition: () => true }, // TODO: implementar
        'conversador': { name: '💬 Conversador', desc: 'Fez 15 perguntas para a IA', condition: () => true }, // TODO: implementar
        'desafiador': { name: '🎯 Desafiador', desc: 'Completou 10 desafios surpresa', condition: () => true } // TODO: implementar
    };

    Object.keys(badgeConditions).forEach(badgeKey => {
        if (!badges.includes(badgeKey) && badgeConditions[badgeKey].condition()) {
            badges.push(badgeKey);
            showBadgeUnlock(badgeConditions[badgeKey]);
        }
    });
}

function showBadgeUnlock(badge) {
    const badgeDiv = document.createElement('div');
    badgeDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 30%;
            right: 30px;
            background: linear-gradient(45deg, #ff6b6b, #ffa500);
            color: white;
            padding: 20px;
            border-radius: 15px;
            font-size: 1.2rem;
            box-shadow: 0 0 30px rgba(255, 107, 107, 0.6);
            z-index: 10000;
            animation: badgeSlide 3s ease-out;
        ">
            <div style="font-size: 2rem; margin-bottom: 10px;">${badge.name.split(' ')[0]}</div>
            <div style="font-weight: bold;">${badge.name}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">${badge.desc}</div>
        </div>
    `;
    document.body.appendChild(badgeDiv);

    setTimeout(() => {
        document.body.removeChild(badgeDiv);
    }, 3000);
}

function updateScoreDisplay() {
    const scoreElement = document.getElementById('user-score-display');
    if (scoreElement) {
        scoreElement.textContent = `⭐ ${userScore} pts | 📊 Nível ${userLevel}`;
    }
}

function playSound(type) {
    const sounds = {
        correct: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2i78OefTRALTqfj8LllHAU5k9fyz3guBSl3x/DeUXNnAA==',
        wrong: 'data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAEAACBhYiFjI6LhYB8dnJuamdlZWZnaGpsb3F0d3p9gIOFh4iJiYmIh4aFg4F+e3h1cmxjXFlVUU5MS0pKSkpKSkpLTE5P=='
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignora erro se navegador bloquear
}


// ============================================
// ELEMENTOS DOM
// ============================================
const contentArea = document.getElementById('content-area');
const breadcrumb = document.getElementById('breadcrumb-text');
const subjectButtons = document.querySelectorAll('.subject-btn');

// ============================================
// NAVEGAÇÃO: SELECIONAR MATÉRIA
// ============================================
subjectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Atualizar estado visual
        subjectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentSubject = btn.dataset.subject;
        currentTopic = null;
        currentActivity = null;
        chatHistory = [];

        breadcrumb.textContent = currentSubject;

        // Mostrar HUB de atividades
        showActivityHub();
    });
});

// ============================================
// HUB DE ATIVIDADES (4 cards)
// ============================================
function showActivityHub() {
    contentArea.innerHTML = `
        <div class="activity-hub">
            <!-- Card 1: Estudar Tópicos -->
            <div class="activity-card" tabindex="0" onclick="startTopics()">
                <span class="icon">📖</span>
                <h3>Estudar Tópicos</h3>
                <p>Explore os principais assuntos de ${currentSubject} com explicações da IA</p>
            </div>

            <!-- Card 2: Conversar com IA -->
            <div class="activity-card" tabindex="0" onclick="startChat()">
                <span class="icon">💬</span>
                <h3>Conversar com IA</h3>
                <p>Tire suas dúvidas diretamente com o tutor inteligente</p>
            </div>

            <!-- Card 3: Fazer Quiz -->
            <div class="activity-card" tabindex="0" onclick="startQuiz()">
                <span class="icon">🎯</span>
                <h3>Fazer Quiz</h3>
                <p>Teste seus conhecimentos com perguntas divertidas</p>
            </div>

            <!-- Card 4: Desafio Surpresa -->
            <div class="activity-card" tabindex="0" onclick="startChallenge()">
                <span class="icon">🎲</span>
                <h3>Desafio Surpresa</h3>
                <p>A IA escolhe uma atividade surpresa para você!</p>
            </div>
        </div>
    `;

    // Auto-focus no primeiro card
    setTimeout(() => {
        document.querySelector('.activity-card').focus();
    }, 100);
}

// ============================================
// ATIVIDADE 1: ESTUDAR TÓPICOS
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
        // Timeout de 5 segundos para evitar travamentos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'list_topics',
                question: `Liste 8 tópicos principais de ${currentSubject} para ensino fundamental`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Resposta não OK: ' + response.status);
        }

        const data = await response.json();
        const answer = data.answer || data.respond || '';
        const topics = extractTopics(answer);

        // Verificar se conseguiu extrair tópicos da IA
        if (topics && topics.length > 0) {
            renderTopicsList(topics);
        } else {
            throw new Error('Nenhum tópico extraído da resposta da IA');
        }

    } catch (error) {
        console.error('⚠️ Erro ao carregar tópicos da IA:', error);

        // Usar tópicos padrão mesmo com erro - sempre funciona
        const topics = extractTopics('');
        renderTopicsList(topics);
    }
}

function extractTopics(text) {
    // Tentar extrair da resposta da IA
    const lines = text.split('\n').filter(line =>
        /^[\d•\-\*]/.test(line.trim()) && line.length > 3
    );

    if (lines.length > 0) {
        return lines.map(l => l.replace(/^[\d•\-\*\.\)]+\s*/, '').trim()).slice(0, 8);
    }

    // Fallback: Tópicos atualizados para 3º ano do Ensino Fundamental
    const defaultTopics = {
        'Matemática': [
            'Números Naturais (sequência, pares e ímpares)',
            'Sistema de Numeração Decimal',
            'Adição e Subtração (com reagrupamento)',
            'Multiplicação e Divisão',
            'Sistema Monetário Brasileiro',
            'Geometria (linhas, sólidos e polígonos)',
            'Unidades de Medida (comprimento, massa, tempo)',
            'Gráficos e Tabelas'
        ],
        'Português': [
            'Interpretação de Texto',
            'Sinônimos e Antônimos',
            'Substantivos (classificação e formação)',
            'Artigos Definidos e Indefinidos',
            'Adjetivos (gênero, número e graus)',
            'Numerais (ordinais e cardinais)',
            'Pronomes Pessoais',
            'Verbos (conjugação e tempos)',
            'Análise Sintática (sujeito e predicado)',
            'Produção de Texto'
        ],
        'Ciências': [
            'Materiais que nos cercam',
            'Propriedades dos materiais',
            'Invenções e descobertas',
            'Materiais naturais e artificiais',
            'Reciclagem e meio ambiente',
            'Experimentos científicos',
            'Corpo humano e saúde',
            'Animais e plantas'
        ],
        'História': [
            'Povos indígenas do Brasil',
            'Descobrimento e colonização',
            'Período colonial brasileiro',
            'Independência do Brasil',
            'Primeiro Reinado e Regência',
            'República e abolição da escravidão',
            'Lazer e turismo em Fortaleza',
            'História local e regional'
        ],
        'Geografia': [
            'Continentes e oceanos',
            'O Brasil e suas regiões',
            'A cidade de Fortaleza',
            'Região Metropolitana de Fortaleza',
            'Clima e vegetação',
            'Relevo e hidrografia',
            'Impactos ambientais',
            'Mapas e orientação'
        ],
        'Idiomas': [
            'Unidades 7 e 8 (inglês)',
            'Vocabulário básico',
            'Materiais (materials)',
            'Cores e formas',
            'Números e quantidades',
            'Saudações e cumprimentos',
            'Família e casa',
            'Alimentos e bebidas'
        ]
    };

    return defaultTopics[currentSubject] || [
        'Tópico 1', 'Tópico 2', 'Tópico 3', 'Tópico 4',
        'Tópico 5', 'Tópico 6', 'Tópico 7', 'Tópico 8'
    ];
}

function renderTopicsList(topics) {
    const topicsHTML = topics.map((topic, i) => `
        <div class="topic-item" tabindex="0" onclick="selectTopic('${topic.replace(/'/g, "\\'")}')">
            <div class="topic-number">${i + 1}</div>
            <div>${topic}</div>
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="content-screen topics-container">
            <h2>📚 Escolha um tópico para estudar:</h2>
            <div class="topics-list">
                ${topicsHTML}
            </div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.querySelector('.topic-item').focus();
    }, 100);
}

async function selectTopic(topic) {
    currentTopic = topic;
    breadcrumb.textContent = `${currentSubject} > ${topic}`;

    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>A IA está preparando uma explicação sobre ${topic}...</p>
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
                question: `Explique ${topic} de forma didática e divertida para uma criança`
            })
        });

        const data = await response.json();
        const answer = data.answer || data.respond || 'Conteúdo não disponível.';

        renderTopicContent(topic, answer);

    } catch (error) {
        console.error('Erro:', error);
        showError('Não foi possível carregar o conteúdo');
    }
}

function renderTopicContent(topic, content) {
    // Normalize spacing: replace multiple consecutive newlines with double breaks, single newlines with single breaks
    const normalizedContent = content
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive newlines with double newlines
        .replace(/\n/g, '<br>');     // Replace single newlines with single breaks

    contentArea.innerHTML = `
        <div class="content-screen">
            <h2>📖 ${topic}</h2>
            <p>${normalizedContent}</p>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="startTopics()">← Voltar aos tópicos</button>
                <button class="btn btn-primary" onclick="startChat()">💬 Fazer uma pergunta</button>
                <button class="btn btn-success" onclick="startQuiz()">🎯 Testar conhecimento</button>
            </div>
        </div>
    `;
}

// ============================================
// ATIVIDADE 2: CONVERSAR COM IA
// ============================================
function startChat() {
    currentActivity = 'chat';
    breadcrumb.textContent = `${currentSubject} > Conversar com IA`;

    const messagesHTML = chatHistory.map(msg => `
        <div class="message ${msg.role}">
            ${msg.role === 'ai' ? '🤖 ' : '👤 '}${renderLatexInMessage(msg.text)}
        </div>
    `).join('');

    contentArea.innerHTML = `
        <div class="chat-container">
            <h2 style="color: #3b82f6; margin-bottom: 20px;">💬 Chat com a IA</h2>
            <div class="chat-messages" id="chat-messages">
                ${messagesHTML || '<p style="text-align: center; color: #6b7280;">Olá! Pode me fazer qualquer pergunta sobre ' + currentSubject + '! 😊</p>'}
            </div>
            <div class="chat-input-box">
                <input type="text" id="chat-input" placeholder="Digite sua pergunta aqui..." />
                <button class="btn btn-primary" onclick="sendChatMessage()">Enviar</button>
            </div>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;

    // Aplicar KaTeX nas mensagens
    setTimeout(() => {
        const messagesDiv = document.getElementById('chat-messages');
        if (messagesDiv) {
            applyKatexToElement(messagesDiv);
        }
    }, 100);

    document.getElementById('chat-input').focus();

    // Enter para enviar
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const question = input.value.trim();

    if (!question) return;

    // Limpar input imediatamente
    input.value = '';

    // Adicionar pergunta ao histórico
    chatHistory.push({ role: 'user', text: question });

    // Mostrar loading
    chatHistory.push({ role: 'ai', text: '⏳ Pensando...' });
    startChat();

    // Scroll para mostrar a mensagem de loading
    setTimeout(() => {
        const messages = document.getElementById('chat-messages');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }, 50);

    // Focar no input após recriar a interface
    setTimeout(() => {
        const newInput = document.getElementById('chat-input');
        if (newInput) {
            newInput.focus();
        }
    }, 50);

    try {
        // Timeout de 8 segundos para chat
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

        if (!response.ok) {
            throw new Error('Resposta não OK: ' + response.status);
        }

        const data = await response.json();
        const answer = data.answer || data.respond || 'Desculpe, não consegui responder.';

        // Substituir loading pela resposta
        chatHistory[chatHistory.length - 1] = { role: 'ai', text: answer };
        startChat();

        // Scroll para o final
        setTimeout(() => {
            const messages = document.getElementById('chat-messages');
            messages.scrollTop = messages.scrollHeight;
        }, 100);

        // Renderizar LaTeX
        setTimeout(() => {
            const messages = document.getElementById('chat-messages');
            if (messages) {
                applyKatexToElement(messages);
            }
        }, 150);

    } catch (error) {
        console.error('Erro:', error);
        chatHistory[chatHistory.length - 1] = { role: 'ai', text: '❌ Erro na conexão com a IA. Tente novamente!' };
        startChat();
    }
}

// ============================================
// ATIVIDADE 3: FAZER QUIZ
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
            <p>Preparando quiz de ${currentSubject}...</p>
        </div>
    `;

    try {
        // Timeout de 10 segundos para quiz
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                topic: currentTopic || '',
                study_mode: 'quiz',
                question: `Crie 5 perguntas de múltipla escolha sobre ${currentSubject}. Formate cada uma assim: **Pergunta:** [pergunta] a) [opcao1] b) [opcao2] c) [opcao3] d) [opcao4] **Resposta correta:** [letra] **Explicação:** [breve explicação instrutiva] Separe cada pergunta com ---`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Resposta não OK: ' + response.status);
        }

        const data = await response.json();
        const answer = data.answer || data.respond || '';

        quizQuestions = parseQuizMultiple(answer);

        // Verificar se conseguiu gerar perguntas
        if (quizQuestions && quizQuestions.length > 0) {
            renderQuiz();
        } else {
            throw new Error('Nenhuma pergunta gerada pela IA');
        }

    } catch (error) {
        console.error('Erro:', error);
        // Fallback: Quiz simples com perguntas padrão
        quizQuestions = [
            {
                question: `Qual é a matéria que estamos estudando?`,
                options: { a: currentSubject, b: 'Outra matéria', c: 'Não sei', d: 'Talvez' },
                correct: 'a',
                explanation: `Estamos estudando ${currentSubject}!`
            },
            {
                question: `O que significa aprender?`,
                options: { a: 'Esquecer', b: 'Descobrir coisas novas', c: 'Dormir', d: 'Correr' },
                correct: 'b',
                explanation: 'Aprender significa descobrir e entender coisas novas!'
            }
        ];
        renderQuiz();
    }
}

function parseQuiz(text) {
    const lines = text.split('\n');
    let question = '';
    let options = {};
    let correct = '';
    let explanation = '';

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('**Pergunta:**')) {
            question = line.replace('**Pergunta:**', '').trim();
        } else if (/^[a-d]\)/.test(line)) {
            const match = line.match(/^([a-d])\)\s*(.+)$/);
            if (match) {
                options[match[1]] = match[2];
            }
        } else if (line.startsWith('**Resposta correta:**')) {
            correct = line.replace('**Resposta correta:**', '').trim().toLowerCase();
        } else if (line.startsWith('**Explicação:**')) {
            explanation = line.replace('**Explicação:**', '').trim();
        }
    }

    return { question, options, correct, explanation };
}

function parseQuizMultiple(text) {
    const parts = text.split('---').map(p => p.trim()).filter(p => p);
    return parts.map(parseQuiz).filter(q => q.question && Object.keys(q.options).length > 0 && q.correct);
}

function renderQuiz() {
    if (quizQuestions.length === 0 || currentQuizIndex >= quizQuestions.length) {
        showFinalScore();
        return;
    }

    const parsed = quizQuestions[currentQuizIndex];

    const optionsHTML = Object.keys(parsed.options).map(letter => `
        <button class="quiz-option" data-letter="${letter}" onclick="selectQuizOption('${letter}', '${parsed.correct}')">
            ${letter}) ${parsed.options[letter]}
        </button>
    `).join('');

    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎯 Quiz de ${currentSubject} (${currentQuizIndex + 1}/${quizQuestions.length})</h2>
            <div style="
                width: 100%;
                height: 6px;
                background: rgba(59, 130, 246, 0.2);
                border-radius: 10px;
                margin-bottom: 15px;
                overflow: hidden;
            ">
                <div style="
                    width: ${((currentQuizIndex + 1) / quizQuestions.length) * 100}%;
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #9333ea);
                    transition: width 0.3s ease;
                "></div>
            </div>
            <p style="font-size: 1.4rem; margin-bottom: 20px;">${parsed.question}</p>
            <div class="quiz-options">
                ${optionsHTML}
            </div>
        </div>
    `;
}

function showFinalScore() {
    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎉 Quiz Finalizado!</h2>
            <p style="font-size: 2rem; margin-bottom: 30px;">Sua pontuação: ${quizScore}/${quizQuestions.length}</p>
            <div class="action-bar">
                <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
                <button class="btn btn-primary" onclick="startQuiz()">🔄 Refazer quiz</button>
            </div>
        </div>
    `;
}

function selectQuizOption(selected, correct) {
    console.log('DEBUG Quiz:', { selected, correct, quizQuestions: quizQuestions[currentQuizIndex] });

    if (selected === correct) {
        quizScore++;
        addPoints(10); // +10 pontos por acerto no quiz
        playSound('correct');
    } else {
        playSound('wrong');
    }

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.disabled = true;
        const letter = opt.dataset.letter;
        if (letter === correct) {
            opt.style.background = 'rgba(16, 185, 129, 0.3)';
            opt.style.borderColor = '#10b981';
            if (selected !== correct) {
                opt.style.boxShadow = '0 0 15px #10b981';
            }
        } else if (letter === selected && selected !== correct) {
            opt.style.background = 'rgba(239, 68, 68, 0.3)';
            opt.style.borderColor = '#ef4444';
        }
    });

    const explanation = quizQuestions[currentQuizIndex].explanation;
    const message = selected === correct
        ? '🎉 Isso aí! Resposta correta! Continue assim! 🥳'
        : `Quase isso! A resposta correta é '${correct.toUpperCase()}' porque ${explanation}`;
    const feedback = document.createElement('div');
    feedback.innerHTML = `<p style="font-size: 1.2rem; margin-top: 10px; color: ${selected === correct ? '#10b981' : '#ef4444'}; line-height: 1.4;">${message}</p>`;

    const nextBtn = document.createElement('div');
    nextBtn.innerHTML = `<div class="action-bar" style="margin-top: 20px;"><button class="btn btn-primary" onclick="nextQuizQuestion()">${currentQuizIndex < quizQuestions.length - 1 ? 'Próximo Desafio →' : 'Ver resultado'}</button></div>`;

    const container = document.querySelector('.quiz-question');
    container.appendChild(feedback);
    container.appendChild(nextBtn);
}

function nextQuizQuestion() {
    currentQuizIndex++;
    renderQuiz();
}

// ============================================
// ATIVIDADE 4: DESAFIO SURPRESA
// ============================================
async function startChallenge() {
    currentActivity = 'challenge';
    breadcrumb.textContent = `${currentSubject} > Desafio Surpresa`;

    contentArea.innerHTML = `
        <div class="loading-screen">
            <div class="loading"></div>
            <p>🎲 A IA está preparando um desafio surpresa para você...</p>
        </div>
    `;

    try {
        // Timeout de 8 segundos para desafio
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentSubject,
                study_mode: 'challenge',
                question: `Crie uma pergunta de múltipla escolha desafiadora sobre ${currentSubject}. Formate assim: **Pergunta:** [pergunta] a) [opcao1] b) [opcao2] c) [opcao3] d) [opcao4] **Resposta correta:** [letra] **Explicação:** [explicação divertida]`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Resposta não OK: ' + response.status);
        }

        const data = await response.json();
        const answer = data.answer || data.respond || '';

        const challengeData = parseChallenge(answer);

        // Verificar se conseguiu parsear o desafio
        if (challengeData && challengeData.question) {
            renderChallenge(challengeData);
        } else {
            throw new Error('Não conseguiu parsear o desafio da IA');
        }

    } catch (error) {
        console.error('Erro:', error);
        // Fallback: Desafio simples
        const fallbackChallenge = {
            question: `Qual é a cor do céu em um dia ensolarado?`,
            options: { a: 'Azul', b: 'Verde', c: 'Vermelho', d: 'Amarelo' },
            correct: 'a',
            explanation: 'O céu fica azul porque a luz do sol é espalhada pela atmosfera!'
        };
        renderChallenge(fallbackChallenge);
    }
}

function parseChallenge(text) {
    const lines = text.split('\n');
    let question = '';
    let options = {};
    let correct = '';
    let explanation = '';

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('**Pergunta:**')) {
            question = line.replace('**Pergunta:**', '').trim();
        } else if (/^[a-d]\)/.test(line)) {
            const match = line.match(/^([a-d])\)\s*(.+)$/);
            if (match) {
                options[match[1]] = match[2];
            }
        } else if (line.startsWith('**Resposta correta:**')) {
            correct = line.replace('**Resposta correta:**', '').trim().toLowerCase();
        } else if (line.startsWith('**Explicação:**')) {
            explanation = line.replace('**Explicação:**', '').trim();
        }
    }

    return { question, options, correct, explanation };
}

function renderChallenge(challengeData) {
    if (!challengeData.question || Object.keys(challengeData.options).length === 0) {
        // Fallback se não conseguir parsear
        contentArea.innerHTML = `
            <div class="content-screen">
                <h2>🎲 Desafio Surpresa!</h2>
                <p>Desafio: Conte quantos animais você vê nesta sala! 🐾</p>
                <div class="action-bar">
                    <button class="btn btn-secondary" onclick="showActivityHub()">← Voltar</button>
                    <button class="btn btn-success" onclick="startChallenge()">🎲 Outro desafio</button>
                </div>
            </div>
        `;
        return;
    }

    const optionsHTML = Object.keys(challengeData.options).map(letter => `
        <button class="quiz-option" data-letter="${letter}" onclick="selectChallengeOption('${letter}', '${challengeData.correct}', '${challengeData.explanation.replace(/'/g, "\\'")}')">
            ${letter}) ${challengeData.options[letter]}
        </button>
    `).join('');

    contentArea.innerHTML = `
        <div class="quiz-question">
            <h2>🎲 Desafio Surpresa!</h2>
            <p style="font-size: 1.47rem; margin-bottom: 15px; line-height: 1.5;">${challengeData.question}</p>
            <div class="quiz-options">
                ${optionsHTML}
            </div>
        </div>
    `;
}

function selectChallengeOption(selected, correct, explanation) {
    if (selected === correct) {
        addPoints(15); // +15 pontos por acerto no desafio surpresa (mais pontos pois é mais difícil)
        playSound('correct');
    } else {
        playSound('wrong');
    }

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.disabled = true;
        const letter = opt.dataset.letter;
        if (letter === correct) {
            opt.style.background = 'rgba(16, 185, 129, 0.3)';
            opt.style.borderColor = '#10b981';
            if (selected !== correct) {
                opt.style.boxShadow = '0 0 15px #10b981';
            }
        } else if (letter === selected && selected !== correct) {
            opt.style.background = 'rgba(239, 68, 68, 0.3)';
            opt.style.borderColor = '#ef4444';
        }
    });

    const message = selected === correct
        ? '🎉 Parabéns! Você acertou o desafio! 🏆'
        : `😅 Quase! A resposta correta é '${correct.toUpperCase()}' porque ${explanation}`;

    const feedback = document.createElement('div');
    feedback.innerHTML = `<p style="font-size: 1.2rem; margin-top: 10px; color: ${selected === correct ? '#10b981' : '#ef4444'}; line-height: 1.4;">${message}</p>`;

    const nextBtn = document.createElement('div');
    nextBtn.innerHTML = `<div class="action-bar" style="margin-top: 20px;"><button class="btn btn-success" onclick="startChallenge()">🎲 Próximo Desafio</button></div>`;

    const container = document.querySelector('.quiz-question');
    container.appendChild(feedback);
    container.appendChild(nextBtn);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function showError(message) {
    contentArea.innerHTML = `
        <div class="content-screen">
            <h2>❌ Ops!</h2>
            <p style="font-size: 1.8rem; color: #ef4444;">${message}</p>
            <div class="action-bar">
                <button class="btn btn-primary" onclick="showActivityHub()">← Voltar</button>
            </div>
        </div>
    `;
}

// ============================================
// NAVEGAÇÃO COM TECLADO (CONTROLE REMOTO)
// ============================================
document.addEventListener('keydown', (e) => {
    // Escape volta para o hub
    if (e.key === 'Escape' && currentSubject) {
        showActivityHub();
    }

    // Backspace volta para escolher matéria (apenas quando não está digitando)
    if (e.key === 'Backspace' && document.activeElement !== document.getElementById('chat-input')) {
        e.preventDefault();
        subjectButtons.forEach(b => b.classList.remove('active'));
        currentSubject = null;
        currentTopic = null;
        currentActivity = null;
        chatHistory = [];
        breadcrumb.textContent = 'Bem-vindo!';
        contentArea.innerHTML = document.getElementById('welcome-screen').outerHTML;
    }
});

// ============================================
// EASTER EGG: KONAMI CODE
// ============================================
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Ativa modo "genius"
            document.body.style.animation = 'rainbow 3s infinite';
            alert('🎓 Modo Gênio Ativado! Você desbloqueou o poder máximo da IA! 🚀');
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Animação rainbow
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ============================================
// LOG INICIAL
// ============================================
console.log('%c🧠 LearnAI TV 2.0', 'font-size: 24px; color: #3b82f6; font-weight: bold;');
console.log('%cOtimizado para Smart TV + Controle Remoto', 'font-size: 14px; color: #9333ea;');
console.log('%cIntegração: n8n + Claude API', 'font-size: 12px; color: #10b981;');
console.log('%c\n📍 Pontos de envio para IA:', 'font-size: 14px; color: #f59e0b; font-weight: bold;');
console.log('1️⃣ startTopics() → Linha ~235 (list_topics)');
console.log('2️⃣ selectTopic() → Linha ~271 (explicacao)');
console.log('3️⃣ sendChatMessage() → Linha ~358 (chat)');
console.log('4️⃣ startQuiz() → Linha ~399 (quiz)');
console.log('5️⃣ startChallenge() → Linha ~439 (challenge)');
