FROM node:18-alpine

WORKDIR /app

COPY frontend/package.json .
RUN npm install

COPY frontend/ .

ENV NEXT_PUBLIC_API_URL=http://backend:8000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
