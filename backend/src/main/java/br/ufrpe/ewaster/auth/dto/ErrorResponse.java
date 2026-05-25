package br.ufrpe.ewaster.auth.dto;

public class ErrorResponse {

    private String erro;

    public ErrorResponse(String erro) {
        this.erro = erro;
    }

    public String getErro() {
        return erro;
    }
}
