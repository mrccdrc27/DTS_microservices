FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
RUN npm install -g json-server

COPY start.sh .
RUN chmod +x /start.sh

EXPOSE 5000 1000

CMD ["node", "start.sh"]
