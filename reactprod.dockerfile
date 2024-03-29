FROM node:14-alpine as build

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /etc/nginx

COPY ./nginx.conf ./conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
