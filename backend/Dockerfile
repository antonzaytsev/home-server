FROM ruby:3.1-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
