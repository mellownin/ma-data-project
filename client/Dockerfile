# Gather the official node.js image based on Alpine Linux
FROM node:lts-alpine3.20

# Set the working directory
WORKDIR /app

# Copy package.json, package-lock.json, and angular.json to the working directory
COPY package*.json ./
COPY angular.json ./

# Install dependencies
RUN npm install

# Copy the 'src' folder from client/src
COPY ./src ./src  

# Expose the port the app runs on
EXPOSE 4200

# Command to run the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0"]
