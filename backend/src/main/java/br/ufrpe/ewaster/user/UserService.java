package br.ufrpe.ewaster.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User salvar(User user) {

        return repository.save(user);
    }
}