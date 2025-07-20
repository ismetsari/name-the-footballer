# Step 1: Build React app with env variable
FROM node:18-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the app (REACT_APP_BACKEND_URL must be passed during build)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

# Step 2: Serve the static files
FROM node:18-slim

WORKDIR /app

# Install a static file server
RUN npm install -g serve

# Copy build artifacts from previous stage
COPY --from=build /app/build /app/build

# Expose port 3000
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "build", "-l", "3000"]
