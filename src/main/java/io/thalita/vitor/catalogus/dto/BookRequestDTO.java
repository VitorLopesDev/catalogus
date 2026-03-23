package io.thalita.vitor.catalogus.dto;

import io.thalita.vitor.catalogus.model.ReadingStatus;

import java.time.LocalDate;

public class BookRequestDTO {
    private Long id;
    private String ownerEmail;
    private ReadingStatus status;
    private String title;
    private String author;
    private String isbn;
    private String comment;
    private Double rating;
    private Integer currentPage;
    private LocalDate readDate;

    public Long getId() { return id; }
    public String getOwnerEmail() { return ownerEmail; }
    public ReadingStatus getStatus() { return status; }
    public String getAuthor() { return author; }
    public String getTitle() { return title; }
    public String getIsbn() { return isbn; }
    public String getComment() { return comment; }
    public Double getRating() { return rating; }
    public Integer getCurrentPage() { return currentPage; }
    public LocalDate getReadDate() { return readDate; }

    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public void setAuthor(String author) { this.author = author; }
    public void setStatus(ReadingStatus status) { this.status = status; }
    public void setTitle(String title) { this.title = title; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public void setComment(String comment) { this.comment = comment; } // bug corrigido: era this.comment = comment (variável errada)
    public void setRating(Double rating) { this.rating = rating; }
    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }
    public void setReadDate(LocalDate readDate) { this.readDate = readDate; }
}
