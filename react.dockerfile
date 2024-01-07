FROM node:18-slim

WORKDIR /app

COPY ./frontend/package.json /app

RUN npm install

COPY ./frontend /app

EXPOSE 3000

CMD ["npm", "start"]
