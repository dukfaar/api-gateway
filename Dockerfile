FROM node:alpine
ARG DB_HOST
ARG DB_PORT
ARG PORT

ARG ITEM_BACKEND_URL
ARG NAMESPACE_BACKEND_URL
ARG GRAPHQL_URLS

ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT

ENV PORT=$PORT

ENV ITEM_BACKEND_URL=$ITEM_BACKEND_URL
ENV NAMESPACE_BACKEND_URL=$NAMESPACE_BACKEND_URL

ENV GRAPHQL_URLS=$GRAPHQL_URLS

EXPOSE $PORT

RUN npm set registry https://npm-registry.dukfaar.com

COPY package*.json ./
RUN npm install --production

COPY tsconfig.json ./
COPY src ./src 
RUN npm run-script tsc

CMD ["node", "dist/"]