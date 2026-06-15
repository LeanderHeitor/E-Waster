package br.ufrpe.ewaster.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduz exceções em respostas JSON consistentes ({timestamp,status,error,message,path}),
 * para o front conseguir exibir a mensagem real em vez de um 500 sem detalhes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Regra de negócio esperada: usa o status que a própria exceção carrega.
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, Object>> handleRegraNegocio(RegraNegocioException ex, HttpServletRequest req) {
        return montar(ex.getStatus(), ex.getMessage(), req);
    }

    private ResponseEntity<Map<String, Object>> montar(HttpStatus status, String mensagem, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", mensagem);
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
