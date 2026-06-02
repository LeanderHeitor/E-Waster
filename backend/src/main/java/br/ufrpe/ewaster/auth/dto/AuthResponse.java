package br.ufrpe.ewaster.auth.dto;

public class AuthResponse {

    private String token;
    private String nome;
    private String email;
    private String tipo;

    public AuthResponse(String token, String nome, String email, String tipo) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.tipo = tipo;
    }

    public String getToken() {
        return token;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTipo() {
        return tipo;
    }
}
