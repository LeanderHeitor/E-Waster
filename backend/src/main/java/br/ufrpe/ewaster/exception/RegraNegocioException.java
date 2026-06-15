package br.ufrpe.ewaster.exception;

import org.springframework.http.HttpStatus;

/**
 * Erro de regra de negócio (esperado): vira uma resposta HTTP com status e mensagem
 * amigáveis, em vez do 500 genérico. O status default é 409 (CONFLICT); use o
 * construtor com status para casos como 404 (não encontrado) ou 403 (sem permissão).
 */
public class RegraNegocioException extends RuntimeException {

    private final HttpStatus status;

    public RegraNegocioException(String mensagem) {
        this(mensagem, HttpStatus.CONFLICT);
    }

    public RegraNegocioException(String mensagem, HttpStatus status) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
