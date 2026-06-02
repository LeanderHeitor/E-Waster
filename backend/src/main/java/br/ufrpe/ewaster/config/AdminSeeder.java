package br.ufrpe.ewaster.config;

import br.ufrpe.ewaster.user.TipoUsuario;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garante que exista um usuario ADMIN no banco ao subir a aplicacao.
 * Idempotente: so cria se o email ainda nao existir. Independente do Flyway
 * (usa apenas a tabela usuario, que ja existe no schema baselined).
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminNome;
    private final String adminEmail;
    private final String adminSenha;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.nome:Administrador}") String adminNome,
            @Value("${app.admin.email:admin@ewaster.com}") String adminEmail,
            @Value("${app.admin.senha:admin123}") String adminSenha
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminNome = adminNome;
        this.adminEmail = adminEmail;
        this.adminSenha = adminSenha;
    }

    @Override
    public void run(String... args) {

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.debug("AdminSeeder: admin '{}' ja existe, nada a fazer.", adminEmail);
            return;
        }

        User admin = new User(adminNome, adminEmail, passwordEncoder.encode(adminSenha));
        admin.setTipo(TipoUsuario.ADMIN);
        userRepository.save(admin);

        log.info("AdminSeeder: usuario ADMIN '{}' criado.", adminEmail);
    }
}
