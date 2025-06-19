FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=build /app/build ./build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
