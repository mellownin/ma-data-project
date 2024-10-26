# Gather the official node.js image based on Alpine Linux
FROM node:lts-alpine3.20

# Set the working directory to /client
WORKDIR /client

# Copy package.json, package-lock.json, and angular.json to the working directory
COPY *.json ./
COPY ./src ./src

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 4200

# Command to run the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0"]
