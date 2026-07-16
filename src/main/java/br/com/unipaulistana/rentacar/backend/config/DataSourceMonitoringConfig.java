package br.com.unipaulistana.rentacar.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import jakarta.annotation.PostConstruct;
import java.sql.Connection;

/**
 * Diagnostic helper to log database connectivity attempts on startup.
 * Logs explicitly before and after attempting to get a connection from the pool.
 * If the connection fails, it catches the exception, logs a critical error,
 * and rethrows it to fail-fast the Spring application context startup.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSourceMonitoringConfig {

    private final DataSource dataSource;

    @org.springframework.beans.factory.annotation.Value("${DB_HOST:localhost}")
    private String dbHost;

    @org.springframework.beans.factory.annotation.Value("${DB_PORT:5432}")
    private String dbPort;

    @org.springframework.beans.factory.annotation.Value("${DB_NAME:neondb}")
    private String dbName;

    @PostConstruct
    public void testConnection() {
        log.info("[DIAGNOSTICO DATABASE] Tentando alcancar o banco de dados no endereco {}:{} (Banco: {})...", dbHost, dbPort, dbName);
        log.info("[DIAGNOSTICO DATABASE] Iniciando tentativa de conexao com o banco de dados...");
        
        try (Connection connection = dataSource.getConnection()) {
            log.info("[DIAGNOSTICO DATABASE] Conexao com o banco de dados estabelecida com SUCESSO!");
            log.info("[DIAGNOSTICO DATABASE] Banco de dados: {}, Driver: {}", 
                     connection.getMetaData().getDatabaseProductName(),
                     connection.getMetaData().getDriverName());
        } catch (Exception e) {
            log.error("[DIAGNOSTICO DATABASE] ERRO CRITICO: Nao foi possivel conectar ao banco de dados!");
            log.error("[DIAGNOSTICO DATABASE] Mensagem do erro: {}", e.getMessage());
            // Rethrowing forces application initialization failure immediately
            throw new IllegalStateException("Falha na conexao inicial com o banco de dados. Abortando inicializacao do servidor.", e);
        }
    }
}
