# 🧠 LearnAI TV 2.0 - Web Edition

**Plataforma educacional gamificada com IA para Smart TVs e navegadores**

**Data de Desenvolvimento:** 15 de novembro de 2025
**Hackathon:** CS Girlies AI 4 Students Hackathon 2025
**Desenvolvido por:** Cline (IA assistente) com orientação de Pedro Farias

## 🎯 Visão Geral
LearnAI TV transforma qualquer dispositivo com navegador em um tutor inteligente, oferecendo educação personalizada com gamificação para crianças do ensino fundamental.

## ✨ Funcionalidades
- ✅ 6 matérias alinhadas ao currículo do 3º ano (Matemática, Português, Ciências, História, Geografia, Idiomas)
- 🤖 Chat com IA para tirar dúvidas
- 🎯 Sistema de quiz interativo
- 🎲 Desafios surpresa
- ⭐ Gamificação completa (pontos, níveis, badges)
- 🎮 Interface otimizada para controle remoto e teclado
- 📱 Responsiva para diferentes tamanhos de tela

## 🛠️ Tecnologias
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **IA**: Claude API via n8n webhook
- **Design**: Interface moderna com gradientes e animações
- **Compatibilidade**: Navegadores modernos, Smart TVs

## 📁 Estrutura do Projeto

```
cs-girlies-project/
├── index.html                 # Página principal
├── css/
│   └── style.css             # Estilos da aplicação
├── js/
│   └── script.js             # Lógica da aplicação
├── package.json              # Dependências Node.js
├── .env                      # Configurações (não versionado)
├── .env.example              # Exemplo de configurações
├── .nojekyll                 # Para GitHub Pages
└── README.md                 # Esta documentação
```

## 🚀 Como Usar

### Opção 1: Abrir Localmente
```bash
# Clonar o repositório
git clone https://github.com/Pfarias1972/cs-girlies-project.git
cd cs-girlies-project

# Abrir no navegador
start index.html
# ou
open index.html
```

### Opção 2: GitHub Pages (Online)
Acesse: https://pfarias1972.github.io/cs-girlies-project/

## 🎮 Como Navegar
1. **Escolha uma matéria** no menu lateral usando setas ou clique
2. **Selecione uma atividade**:
   - 📖 **Estudar Tópicos**: Explore assuntos com explicações da IA
   - 💬 **Conversar com IA**: Tire dúvidas diretamente
   - 🎯 **Fazer Quiz**: Teste seus conhecimentos
   - 🎲 **Desafio Surpresa**: Atividade aleatória da IA
3. **Ganhe pontos** e **suba de nível**!

## 📊 Sistema de Gamificação
- **Quiz**: +10 pontos por acerto
- **Desafio Surpresa**: +15 pontos por acerto
- **Level Up**: A cada 100 XP acumulados
- **Badges**: Conquistas desbloqueáveis
- **Easter Egg**: Konami Code (↑↑↓↓←→←→BA) para modo especial

## 🔧 Desenvolvimento

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Git (para contribuir)
- Node.js (opcional, para desenvolvimento)

### Configuração Local
```bash
# Instalar dependências (se necessário)
npm install

# O projeto é 100% client-side, não precisa de servidor
```

### API Integration
A aplicação se conecta a um webhook n8n que integra com Claude API:
- **Endpoint**: Configurado em `js/script.js`
- **Métodos suportados**:
  - `list_topics`: Lista tópicos de uma matéria
  - `explicacao`: Explica um tópico específico
  - `chat`: Conversa com a IA
  - `quiz`: Gera perguntas de múltipla escolha
  - `challenge`: Cria desafio surpresa

## 📋 Funcionalidades Técnicas
- ✅ Interface responsiva para Smart TVs
- ✅ Navegação por teclado/controle remoto
- ✅ Sistema de gamificação persistente na sessão
- ✅ Animações e efeitos visuais
- ✅ Tratamento de erros e fallbacks
- ✅ Suporte offline parcial (tópicos padrão)

## 💻 Processo de Desenvolvimento - Documento das Ações da Cline

Este projeto foi **100% desenvolvido pela IA Cline** seguindo instruções detalhadas para recriar o LearnAI TV 2.0. Abaixo está a documentação completa das ações realizadas:

### 📋 Ações Realizadas pela Cline (15 de novembro de 2025)

#### 🤖 Configuração e Setup Inicial
- ✅ Criou estrutura de pastas: `css/`, `js/`, e arquivos base
- ✅ Configurou sistema de watch automático para commits no `.cline.json`
- ✅ Criou script `auto-commit.sh` para versionamento automático

#### 📁 Arquivos Criados/Modificados
1. **`index.html`** - Página principal criada com:
   - Estrutura HTML otimizada para Smart TV
   - Navegação por controle remoto
   - Interface responsiva
   - Meta tags apropriadas

2. **`app.js`** - Lógica principal implementada com:
   - 6 matérias completas (Matemática, Português, Ciências, História, Geografia, Idiomas)
   - Sistema de gamificação completo (pontos, níveis, badges)
   - Integração com 4 webhooks n8n
   - Navegação keyboard/controle remoto
   - Easter egg Konami Code

3. **`styles.css`** - Design system completo:
   - Gradientes e animações modernas
   - Interface otimizada para Smart TV
   - Responsividade total
   - Scrollbars customizadas
   - Paleta de cores harmoniosa

#### 🔧 Configurações Técnicas
- **package.json**: Atualizado para versão 2.0.0
- **README.md**: Documentação completa com todas as funcionalidades
- **prompt.txt**: Arquivo de instruções usado para desenvolvimento

#### 🔗 Integração com IA
- **n8n Workflow**: Configurado em `Hackathon  CS girlies.json`
- **4 Pontos de API**:
  - `list_topics`: Geração dinâmica de tópicos por matéria
  - `explicacao`: Explicações contextualizadas
  - `chat`: Conversa interativa
  - `quiz`: Perguntas de múltipla escolha
  - `challenge`: Desafios surpresa

#### 🎮 Funcionalidades Implementadas
- **Gamificação**: Pontos, níveis (XP crescente), animations, badges
- **Navegação**: Setas + ENTER, BACKSPACE, ESC
- **Easter Eggs**: Konami Code para modo especial
- **Fallbacks**: Funcionamento offline com tópicos padrão

#### 🧪 Testes e Debugging
- ⚡ Tratamento de erros em todas as chamadas de API
- 🔄 Timeouts configurados (5-10 segundos) para estabilidade
- 💪 Fallbacks robustos para funcionamento sem internet

### 📊 Estatísticas do Desenvolvimento
- **Arquivos Criados**: 8 (HTML, JS, CSS, configs)
- **Linhas de Código**: ~600+ no JavaScript
- **Materias Suportadas**: 6 completas
- **Atividades**: 4 (Tópicos, Chat, Quiz, Desafio)
- **Pontos de Integração IA**: 4 webhooks
- **Tempo Estimado**: ~2 horas de desenvolvimento contínuo

### 🔄 Melhorias Futuras Sugeridas
- Adicionar mais idiomas ao sistema
- Implementar progresso persistente entre sessões
- Sistema de ranking/hall of fame
- Modo pai com controles parentais

## 🎓 Sobre o Projeto
Desenvolvido durante o **CS Girlies AI 4 Students Hackathon 2025** com o objetivo de democratizar o acesso à educação de qualidade através da tecnologia e inteligência artificial.

**Nota:** Todo o código foi gerado pela IA Cline com base no prompt detalhado em `prompt.txt`, demonstrando o potencial da IA para acelerar o desenvolvimento de aplicações educacionais.

## 📄 Licença
MIT License - veja LICENSE para detalhes
