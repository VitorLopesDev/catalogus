package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User login(String username, String password) {
        User user = userRepository.findByEmail(username);

        if (user == null) {
            return null;
        }

        return passwordEncoder.matches(password, user.getPassword()) ? user : null;
    }

    public User register(String nickName, String email, String password) {
        if (userRepository.findByEmail(email) != null) {
            throw new RuntimeException("Usuário já existe");
        }

        if (userRepository.findByNickName(nickName) != null) {
            throw new RuntimeException("O nick name já está cadastrado");
        }

        User user = new User();
        user.setNickName(nickName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ROLE_USER");

        return userRepository.save(user);
    }
}