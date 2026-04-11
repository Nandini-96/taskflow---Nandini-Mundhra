# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /backend

COPY package*.json ./
RUN npm install

COPY . .

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

WORKDIR /backend

# install dbmate
RUN apk add --no-cache curl \
  && curl -fsSL https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 -o /usr/local/bin/dbmate \
  && chmod +x /usr/local/bin/dbmate

COPY --from=builder /backend /backend

# DEBUG (optional - helps verify files)
# RUN ls -R /app

EXPOSE 3000

CMD ["sh", "-c", "dbmate up && node src/app.js"]