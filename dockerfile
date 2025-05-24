# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# package.json ve package-lock.json'ı kopyala ve install et
COPY package*.json ./
RUN npm install --production

# Geri kalan kodu kopyala
COPY . .

# App port
EXPOSE 3000

# Container ayağa kalkınca bunu çalıştır
CMD ["npm", "start"]
