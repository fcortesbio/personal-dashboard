# --- Stage 1: The "Builder" ---
# Use the alpine image, but we'll add the build tools
FROM node:25-alpine AS builder

# Install the C++ build tools *only in this stage*
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install *only* production dependencies
# This will correctly compile sqlite3/better-sqlite3
RUN npm install --production

# Copy the rest of your app code
COPY . .

# --- Stage 2: The "Final" Image ---
# Start from a clean, minimal alpine image
FROM node:25-alpine

WORKDIR /app

# Copy *only* the compiled production node_modules from the "builder" stage
COPY --from=builder /app/node_modules ./node_modules

# Copy your app code from the "builder" stage
COPY --from=builder /app ./

# Create the directory for the persistent database
RUN mkdir -p /app/data

# Expose the port your app runs on (production)
EXPOSE 4000

# Run the main server entry point
CMD [ "node", "index.js" ]
