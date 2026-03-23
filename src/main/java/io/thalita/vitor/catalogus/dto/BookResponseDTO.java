package io.thalita.vitor.catalogus.dto;

public class BookResponseDTO {

    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String comment;

    public BookResponseDTO(Long id, String title, String author, String isbn, String comment) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getDescription(){
        return comment;
    }
}
