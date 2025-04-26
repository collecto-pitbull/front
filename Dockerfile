FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV TS_NODE_TRANSPILE_ONLY=true

EXPOSE 3000

CMD ["npm", "run", "dev"]