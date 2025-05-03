FROM node:18-alpine

# Install required dependencies including git
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

# Install npm packages
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
