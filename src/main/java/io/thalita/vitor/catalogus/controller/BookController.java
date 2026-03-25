package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.dto.BookRequestDTO;
import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/book")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/list")
    public ResponseEntity<List<Book>> listBooks(@RequestParam String email) {
        List<Book> books = bookService.findAllBooks(email);
        if (books.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(books);
    }

    @PostMapping
    public ResponseEntity<?> addBook(@RequestBody BookRequestDTO dto) {
        Book response = bookService.createBook(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{title}")
    public ResponseEntity<Void> deleteBook(@PathVariable String title, @RequestParam String email) {
        bookService.deleteBook(title, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{title}")
    public ResponseEntity<Book> findBook(@PathVariable String title, @RequestParam String email) {
        Book book = bookService.findBookByTitle(title, email);
        return ResponseEntity.ok().body(book);
    }

    @PutMapping("/{title}")
    public ResponseEntity<Book> replaceBook(@RequestBody BookRequestDTO dto) {
        Book book = bookService.replaceBook(dto);
        return ResponseEntity.ok().body(book);
    }

    @PatchMapping("/{title}/favorite")
    public ResponseEntity<Book> toggleFavorite(@PathVariable String title, @RequestParam String email) {
        Book book = bookService.toggleFavorite(title, email);
        return ResponseEntity.ok().body(book);
    }
}