# ---- Etapa 1: build (compila o JAR com Maven + JDK 21) ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia o pom primeiro para aproveitar cache de dependencias
COPY pom.xml .
RUN mvn -B -q dependency:go-offline || true

COPY src ./src
# Pula testes: eles rodam contra o banco de dev local (ver memoria do projeto)
RUN mvn -B -q clean package -DskipTests

# ---- Etapa 2: runtime (so o JRE + o JAR, imagem menor) ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Limita memoria para caber no plano free do Render (512MB)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"

# Porta padrao; o Render injeta a variavel PORT em runtime
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
