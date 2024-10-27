# Gather the official node.js image based on Alpine Linux
FROM node:lts-alpine3.20

# Set the working directory
WORKDIR /app

#Install Angular CLI globally first
RUN npm install -g @angular/cli

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 4200

# Use npm start instead of direct ng server
CMD ["npm","start"]

