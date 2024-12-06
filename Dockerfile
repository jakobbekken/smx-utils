FROM node:22 AS base

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g ts-node typescript
RUN npm install


FROM base AS build

COPY . .
RUN npm run build

FROM base

COPY --from=build /usr/src/app/dist /usr/src/app/dist
CMD ["npm", "start"]
