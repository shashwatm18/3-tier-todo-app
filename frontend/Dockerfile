FROM node:22-alpine AS builder

WORKDIR /app

# Copy package management files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy the rest of your frontend application source code
COPY . .

RUN npm run build


# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]