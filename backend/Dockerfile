FROM ruby:3.1-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Gemfile and install gems
COPY Gemfile* ./
RUN bundle install

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p db

EXPOSE 4567

CMD ["puma", "-p", "4567", "-e", "production"]