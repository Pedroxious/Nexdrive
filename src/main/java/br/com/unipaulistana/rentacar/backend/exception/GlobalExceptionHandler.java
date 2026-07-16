package br.com.unipaulistana.rentacar.backend.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Central error handler — ensures internal implementation details, stack traces,
 * and Spring-generated messages never reach the client.
 *
 * Security rules:
 * - Authentication failures always return the SAME generic message (prevent user enumeration)
 * - Bean Validation errors return field-level messages (safe, developer-controlled strings from DTOs)
 * - Unknown server errors log full detail but return a generic message to the client
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Business exceptions ───────────────────────────────────────────────────

    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleVehicleNotFound(VehicleNotFoundException ex) {
        return createResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(VehicleNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleVehicleNotAvailable(VehicleNotAvailableException ex) {
        return createResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        // Only propagate messages from our own code — they are safe user-facing strings
        return createResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // ── Validation errors (Bean Validation) ───────────────────────────────────

    /**
     * @Valid on @RequestBody — returns structured field errors.
     * Messages come from DTO annotations (@NotBlank, @Size, etc.) — safe developer-controlled strings.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Dados inválidos.",
                "details", errors
        ));
    }

    /**
     * @Validated on path variables / request parameters.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> errors = ex.getConstraintViolations().stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Dados inválidos.",
                "details", errors
        ));
    }

    // ── Authentication & Authorization ────────────────────────────────────────

    /**
     * V-12 fix: single generic message for ALL authentication failures.
     * Never tell the client whether the email exists or whether it was the password that was wrong.
     */
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<Map<String, Object>> handleAuthFailure(Exception ex) {
        // Log internally for monitoring — client gets only generic message
        log.warn("Authentication failure: {}", ex.getClass().getSimpleName());
        return createResponse("E-mail ou senha incorretos.", HttpStatus.UNAUTHORIZED);
    }

    /**
     * Access denied — user is authenticated but lacks the required role.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return createResponse("Acesso negado.", HttpStatus.FORBIDDEN);
    }

    // ── Catch-all ─────────────────────────────────────────────────────────────

    /**
     * Final fallback — logs the full exception server-side but returns a generic message.
     * Stack traces, class names, and Spring internals NEVER reach the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled internal error: {}", ex.getMessage(), ex);
        return createResponse("Ocorreu um erro interno no servidor.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> createResponse(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(Map.of(
                "error", message,
                "status", status.value()
        ));
    }
}
