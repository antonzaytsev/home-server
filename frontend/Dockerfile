FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Install serve for static file serving
RUN npm install -g serve

# Copy app source
COPY . .

# Build the app
RUN npm run build

EXPOSE 80

# Serve the built app on port 80
CMD ["serve", "-s", "build", "-l", "80"]