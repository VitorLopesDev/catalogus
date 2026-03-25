package io.thalita.vitor.catalogus.repository;

import io.thalita.vitor.catalogus.model.Friendship;
import io.thalita.vitor.catalogus.model.FriendshipStatus;
import io.thalita.vitor.catalogus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    List<Friendship> findByReceiverAndStatus(User receiver, FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.status = 'ACEITO' AND (f.sender = :user OR f.receiver = :user)")
    List<Friendship> findAcceptedFriendships(@Param("user") User user);

    Optional<Friendship> findBySenderAndReceiver(User sender, User receiver);
}
