FROM node:22-alpine

WORKDIR /app

# Install system dependencies
RUN apk --no-cache add curl git

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve MUI version conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
