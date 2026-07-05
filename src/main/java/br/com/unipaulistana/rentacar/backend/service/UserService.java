package br.com.unipaulistana.rentacar.backend.service;

import br.com.unipaulistana.rentacar.backend.domain.User;
import br.com.unipaulistana.rentacar.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@SuppressWarnings("null")
public class UserService {

    private final UserRepository userRepository;

    public List<User> findAll() {
        return this.userRepository.findAll();
    }

    public Optional<User> findById(final Long id) {
        return this.userRepository.findById(id);
    }

    public User save(User user) {
        return this.userRepository.save(user);
    }

    public void deleteById(Long id) {
        this.userRepository.deleteById(id);
    }
}
