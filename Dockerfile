# Use a Node.js image with build tools
FROM node:25-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install --production=false

# Copy the rest of your application source code
# (A .dockerignore file is recommended to speed this up)
COPY . .

# Run your build script from package.json
# This creates the 'dist' folder
RUN npm run build

# ----- Production Stage -----
# Use a slim Node.js image for the final container
FROM node:25-alpine

# Set the working directory
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy package files again
COPY package.json package-lock.json ./

# Install *only* production dependencies
RUN npm install --production=true

# Copy the built application from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Copy the 'public' static assets directory
COPY ./public ./public

# Your app listens on process.env.PORT or 8000
# Expose the default port
EXPOSE 8000

# Use the 'start' script from package.json to run the app
CMD [ "npm", "run", "start" ]