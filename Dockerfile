FROM node:18.7.0

WORKDIR /app

COPY package*.json ./

RUN  npm install

COPY . .

COPY ./dist ./dist

CMD ["npm","run", "dev"]