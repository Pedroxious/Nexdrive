# --- Stage 1: Build Angular Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY autohunt-web/package*.json ./
RUN npm install

# Copy source and build
COPY autohunt-web/ ./
RUN npm run build -- --configuration=production

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend

# Copy Maven descriptor
COPY pom.xml .

# Copy Java source code
COPY src ./src

# Copy built Angular frontend assets to Spring Boot static resources folder
COPY --from=frontend-build /app/frontend/dist/autohunt-web/browser/ src/main/resources/static/

# Package backend application into a runnable jar (skip tests for build speed)
RUN mvn clean package -DskipTests

# --- Stage 3: Run Unified Application ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Render dynamic port binding support (defaults to 8080)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
