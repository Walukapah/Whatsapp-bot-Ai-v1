FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Create directory for auth info
RUN mkdir -p auth_info_baileys

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
