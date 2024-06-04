# Use the official Node.js image based on Alpine Linux
FROM node:lts-alpine3.20

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the working directory for the Angular application
WORKDIR /app/client

# Install Angular application dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 4200
EXPOSE 3000

# Command to run the Angular development server and Node.js server
CMD ["sh", "-c", "cd /app && node server.js & cd /app/client && ng serve --host 0.0.0.0"]