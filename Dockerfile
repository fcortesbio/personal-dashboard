# Node.js version
FROM node:25-alpine3.21

# set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install **only** production dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create a directory for SQLite database
RUN mkdir -p /app/data

# Expose the internal port (used by Traefik)
EXPOSE 3000

# The command to run the application
CMD [ "npm", "start" ]
