FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY server.js .
COPY overlay.html .
COPY items/ ./items/
COPY fonts/ ./fonts/
EXPOSE 3030
CMD ["node", "server.js"]
