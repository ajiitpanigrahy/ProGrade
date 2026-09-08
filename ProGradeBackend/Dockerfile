# Stage 1: Build the application using Java 21
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy the maven wrapper and pom.xml first
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Grant execution permissions to the Maven wrapper to prevent permission denied errors
RUN chmod +x ./mvnw

# Copy the actual source code
COPY src src

# Build the application, skipping tests to speed up deployment
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application using Java 21 JRE (lighter image)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]