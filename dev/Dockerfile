FROM oven/bun:1-alpine

WORKDIR /app

# Install system dependencies
RUN apk --no-cache add curl git

# Copy package files and lockfile
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["bun", "run", "dev"]
