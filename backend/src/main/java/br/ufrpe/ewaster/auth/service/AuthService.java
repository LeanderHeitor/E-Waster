package br.ufrpe.ewaster.auth.service;

import br.ufrpe.ewaster.auth.dto.RegisterRequest;
import br.ufrpe.ewaster.user.User;
import br.ufrpe.ewaster.user.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        User user = new User(
                request.getNome(),
                request.getEmail(),
                request.getSenha()
        );

        return userRepository.save(user);
    }
}