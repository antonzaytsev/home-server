FROM node:24.7-bookworm

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

#COPY . .

#ARG API_URL
#ENV API_URL=$API_URL

# Default command for development (can be overridden)
#CMD ["npm", "start"]
