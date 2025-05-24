# Book API (Docker)

## Gereksinimler
- Docker & Docker Compose

## Kurulum
1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/kullaniciAdi/book-api-docker.git
   cd book-api-docker

.env.example dosyasını kopyalayıp .env adıyla kaydedin ve içindeki değerleri düzenleyin:
   cp .env.example .env

   
Docker Compose ile ayağa kaldırın:
   docker-compose up -d --build

http://localhost:3000/books
