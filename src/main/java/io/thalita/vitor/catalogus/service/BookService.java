package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.dto.BookRequestDTO;
import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.model.ReadingStatus;
import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.repository.BookRepository;
import io.thalita.vitor.catalogus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RestTemplate restTemplate;

    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    public Book createBook(BookRequestDTO dto) {
        Book bookExist = bookRepository.findByTitle(dto.getTitle());
        User owner = userRepository.findByEmail(dto.getOwnerEmail());

        if (bookExist != null) throw new RuntimeException("O Livro já cadastrado");
        if (owner == null)     throw new RuntimeException("Usuário não encontrado");

        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setStatus(dto.getStatus() != null ? dto.getStatus() : ReadingStatus.NAO_LIDO);
        book.setIsbn(dto.getIsbn());
        book.setComment(dto.getComment());
        book.setOwner(owner);
        book.setRating(dto.getRating());

        if (dto.getIsbn() != null && !dto.getIsbn().isBlank()) {
            buscarDadosOpenLibrary(book, dto.getIsbn());
        }

        if (dto.getStatus() == ReadingStatus.NAO_LIDO) {
            book.setCurrentPage(0);
        } else if (dto.getStatus() == ReadingStatus.LIDO) {
            book.setCurrentPage(book.getPages());
            book.setReadDate(dto.getReadDate());
        } else {
            book.setCurrentPage(dto.getCurrentPage());
        }

        return bookRepository.save(book);
    }

    public void deleteBook(String title) {
        Book book = bookRepository.findByTitle(title);
        if (book == null) throw new RuntimeException("Livro não encontrado");
        bookRepository.delete(book);
    }

    public Book findBookByTitle(String title) {
        Book book = bookRepository.findByTitle(title);
        if (book == null) throw new RuntimeException("Livro não encontrado");
        return book;
    }

    public Book replaceBook(BookRequestDTO dto) {
        Book book = bookRepository.findByTitle(dto.getTitle());
        if (book == null) throw new RuntimeException("Livro não encontrado");

        book.setAuthor(dto.getAuthor());
        book.setStatus(dto.getStatus());
        book.setTitle(dto.getTitle());
        book.setIsbn(dto.getIsbn());
        book.setComment(dto.getComment());
        book.setRating(dto.getRating());

        if (dto.getIsbn() != null && !dto.getIsbn().isBlank()) {
            buscarDadosOpenLibrary(book, dto.getIsbn());
        }

        if (dto.getStatus() == ReadingStatus.NAO_LIDO) {
            book.setCurrentPage(0);
            book.setReadDate(null);
        } else if (dto.getStatus() == ReadingStatus.LIDO) {
            book.setCurrentPage(book.getPages());
            book.setReadDate(dto.getReadDate());
        } else {
            book.setCurrentPage(dto.getCurrentPage());
            book.setReadDate(null);
        }

        bookRepository.saveAndFlush(book);
        return book;
    }

    public Book toggleFavorite(String title) {
        Book book = bookRepository.findByTitle(title);
        if (book == null) throw new RuntimeException("Livro não encontrado");
        book.setFavorite(!book.isFavorite());
        return bookRepository.save(book);
    }

    private void buscarDadosOpenLibrary(Book book, String isbn) {
        try {
            String url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + isbn + "&format=json&jscmd=data";
            String json = restTemplate.getForObject(url, String.class);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            com.fasterxml.jackson.databind.JsonNode info = root.get("ISBN:" + isbn);

            if (info != null) {
                if (info.has("publish_date"))
                    book.setPublishYear(info.get("publish_date").asText());
                if (info.has("publishers") && info.get("publishers").size() > 0)
                    book.setPublisher(info.get("publishers").get(0).get("name").asText());
                if (info.has("number_of_pages"))
                    book.setPages(info.get("number_of_pages").asInt());
                book.setCoverUrl("https://covers.openlibrary.org/b/isbn/" + isbn + "-M.jpg");
            }
        } catch (Exception e) {

        }
    }
}