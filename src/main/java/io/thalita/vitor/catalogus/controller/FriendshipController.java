package io.thalita.vitor.catalogus.controller;

import io.thalita.vitor.catalogus.model.Book;
import io.thalita.vitor.catalogus.model.Friendship;
import io.thalita.vitor.catalogus.model.User;
import io.thalita.vitor.catalogus.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/friends")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestParam String senderEmail,
                                         @RequestParam String receiverNickname) {
        try {
            Friendship f = friendshipService.sendRequest(senderEmail, receiverNickname);
            return ResponseEntity.status(HttpStatus.CREATED).body(f);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id,
                                           @RequestParam String email) {
        try {
            Friendship f = friendshipService.acceptRequest(id, email);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/refuse")
    public ResponseEntity<?> refuseRequest(@PathVariable Long id,
                                           @RequestParam String email) {
        try {
            Friendship f = friendshipService.refuseRequest(id, email);
            return ResponseEntity.ok(f);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listFriends(@RequestParam String email) {
        try {
            List<User> friends = friendshipService.listFriends(email);
            return ResponseEntity.ok(friends);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> listPending(@RequestParam String email) {
        try {
            List<Friendship> pending = friendshipService.listPending(email);
            return ResponseEntity.ok(pending);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/books")
    public ResponseEntity<?> getFriendBooks(@RequestParam String email,
                                            @RequestParam String friendNickname) {
        try {
            List<Book> books = friendshipService.getFriendBooks(email, friendNickname);
            return ResponseEntity.ok(books);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }
}
