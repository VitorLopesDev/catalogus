package io.thalita.vitor.catalogus.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = "title"))
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    private ReadingStatus status = ReadingStatus.NAO_LIDO;

    @NonNull
    private String title;

    @NonNull
    private String author;

    private String isbn;
    private String comment;
    private String publishYear;
    private String publisher;
    private Integer pages;
    private String coverUrl;
    private Double rating;
    private Integer currentPage;
    private LocalDate readDate;
    private boolean favorite = false;
}