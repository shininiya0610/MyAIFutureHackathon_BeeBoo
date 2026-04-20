FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build React app
RUN npm run build

ENV PORT=8080

CMD ["npm", "start"]
