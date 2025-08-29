FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install serve for static file serving
RUN npm install -g serve

# Copy app source and build
COPY . .
ARG API_URL
ENV API_URL=$API_URL
RUN npm run build
