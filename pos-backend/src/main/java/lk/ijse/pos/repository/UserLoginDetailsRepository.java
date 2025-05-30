package lk.ijse.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import lk.ijse.pos.entity.UserEntity;
import lk.ijse.pos.entity.UserLoginDetailsEntity;

@Repository
public interface UserLoginDetailsRepository extends JpaRepository<UserLoginDetailsEntity, Long> {
    @Query(value = "SELECT * FROM user_login_details WHERE user_id = :userId AND logout_time IS NULL LIMIT 1", nativeQuery = true)
    UserLoginDetailsEntity findActiveLoginByUserId(@Param("userId") Long userId);
} 