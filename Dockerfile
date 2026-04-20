# Use lightweight Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy all source code
COPY . .

# Cloud Run uses port 8080
ENV PORT=8080

# Expose port (not required but good practice)
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
