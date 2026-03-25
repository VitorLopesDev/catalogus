package io.thalita.vitor.catalogus.repository;

import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.model.User;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    Book findByTitle(@NonNull String title);
    Book findByTitleAndOwner(String title, User owner);
    void deleteByTitle(String title);
    List<Book> findByOwnerEmail(String email);
}