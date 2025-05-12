# Use a imagem oficial do Node.js como base
FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json (se existir)
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todos os arquivos restantes para o container
COPY . .

# Exponha a porta que seu app usará
EXPOSE 3000

# Comando para rodar o bot
CMD ["node", "index.js"]  