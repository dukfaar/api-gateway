FROM node:alpine
ARG DB_HOST
ARG DB_PORT
ARG PORT

ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT

ENV PORT=$PORT

EXPOSE 3000

RUN npm set registry https://npm-registry.dukfaar.com

COPY package*.json ./
RUN npm install --production

COPY tsconfig.json ./
COPY src ./src 
RUN npm run-script tsc

CMD ["node", "dist/"]