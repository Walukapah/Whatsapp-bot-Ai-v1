FROM node:18-slim

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --production

COPY . .

RUN mkdir -p auth_info_baileys

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
