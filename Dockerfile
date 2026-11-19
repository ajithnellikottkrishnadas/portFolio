# --- Stage 1: Build the React application ---
FROM node:22-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (optimizes Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your source code and build the app
COPY . .
RUN npm run build



# --- Stage 2: Serve with Nginx ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
