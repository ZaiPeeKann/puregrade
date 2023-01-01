FROM node:18-alpine
WORKDIR /server
COPY . .
RUN npm i --production
CMD ["node", "src/index.js"]
EXPOSE 3000