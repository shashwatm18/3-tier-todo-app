FROM node:22-alpine

WORKDIR /app

# Copy package management files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy the rest of your frontend application source code
COPY . .

# Expose port 3000 (matching the "dev" script in your package.json)
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev"]
