#!/bin/bash
# 🧠 Script de commit automático com mensagens inteligentes
# Autor: Pedro Farias + Cline IA
# Versão: 2.0 (Atualizado em 15/11/2025)

# Adiciona alterações
git add .

# Verifica se há mudanças
if git diff --cached --quiet; then
  echo "Nenhuma alteração para commitar."
  exit 0
fi

# Captura lista de arquivos modificados
CHANGED_FILES=$(git diff --cached --name-only)

# Função simples de "gerador de mensagem IA"
generate_commit_message() {
  local file="$1"
  if [[ $file == *".html" ]]; then
    echo "🎨 Atualiza layout ou estrutura da página ($file)"
  elif [[ $file == *".css" ]]; then
    echo "💅 Melhora o estilo visual ($file)"
  elif [[ $file == *".js" ]]; then
    echo "⚙️ Ajusta lógica ou interações ($file)"
  elif [[ $file == *".md" ]]; then
    echo "📝 Atualiza documentação ($file)"
  else
    echo "📦 Atualização geral ($file)"
  fi
}

# Gera mensagens de commit descritivas
COMMIT_MSG=""
for file in $CHANGED_FILES; do
  MSG=$(generate_commit_message "$file")
  COMMIT_MSG+="$MSG; "
done

# Remove espaço extra e faz commit
git commit -m "$COMMIT_MSG"

# Faz push para o branch main
git push origin main

echo "✅ Commit automático enviado com mensagem inteligente:"
echo "$COMMIT_MSG"
