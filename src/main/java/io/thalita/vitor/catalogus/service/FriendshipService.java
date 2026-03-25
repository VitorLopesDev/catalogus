package io.thalita.vitor.catalogus.service;

import io.thalita.vitor.catalogus.model.*;
import io.thalita.vitor.catalogus.repository.BookRepository;
import io.thalita.vitor.catalogus.repository.FriendshipRepository;
import io.thalita.vitor.catalogus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookRepository bookRepository;

    public Friendship sendRequest(String senderEmail, String receiverNickname) {
        User sender   = userRepository.findByEmail(senderEmail);
        User receiver = userRepository.findByNickName(receiverNickname);

        if (sender == null)   throw new RuntimeException("Usuário não encontrado");
        if (receiver == null) throw new RuntimeException("Amigo não encontrado");
        if (sender.equals(receiver)) throw new RuntimeException("Você não pode se adicionar");

        Optional<Friendship> existing = friendshipRepository.findBySenderAndReceiver(sender, receiver);
        Optional<Friendship> reverse  = friendshipRepository.findBySenderAndReceiver(receiver, sender);

        if (existing.isPresent() || reverse.isPresent()) {
            throw new RuntimeException("Solicitação já enviada ou vocês já são amigos");
        }

        Friendship friendship = new Friendship();
        friendship.setSender(sender);
        friendship.setReceiver(receiver);
        friendship.setStatus(FriendshipStatus.PENDENTE);

        return friendshipRepository.save(friendship);
    }

    public Friendship acceptRequest(Long id, String receiverEmail) {
        Friendship friendship = friendshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        if (!friendship.getReceiver().getEmail().equals(receiverEmail)) {
            throw new RuntimeException("Sem permissão para aceitar esta solicitação");
        }

        friendship.setStatus(FriendshipStatus.ACEITO);
        return friendshipRepository.save(friendship);
    }

    public Friendship refuseRequest(Long id, String receiverEmail) {
        Friendship friendship = friendshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        if (!friendship.getReceiver().getEmail().equals(receiverEmail)) {
            throw new RuntimeException("Sem permissão para recusar esta solicitação");
        }

        friendship.setStatus(FriendshipStatus.RECUSADO);
        return friendshipRepository.save(friendship);
    }

    public List<User> listFriends(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("Usuário não encontrado");

        return friendshipRepository.findAcceptedFriendships(user)
                .stream()
                .map(f -> f.getSender().equals(user) ? f.getReceiver() : f.getSender())
                .toList();
    }

    public List<Friendship> listPending(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("Usuário não encontrado");

        return friendshipRepository.findByReceiverAndStatus(user, FriendshipStatus.PENDENTE);
    }

    public List<Book> getFriendBooks(String email, String friendNickname) {
        User user   = userRepository.findByEmail(email);
        User friend = userRepository.findByNickName(friendNickname);

        if (user == null || friend == null) throw new RuntimeException("Usuário não encontrado");

        List<User> friends = listFriends(email);
        boolean saoAmigos  = friends.stream().anyMatch(f -> f.equals(friend));

        if (!saoAmigos) throw new RuntimeException("Vocês não são amigos");

        return bookRepository.findByOwnerEmail(friend.getEmail());
    }
}
