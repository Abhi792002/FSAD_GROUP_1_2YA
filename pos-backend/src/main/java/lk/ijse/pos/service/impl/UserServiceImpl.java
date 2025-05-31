package lk.ijse.pos.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lk.ijse.pos.dto.UserPwdDto;
import lk.ijse.pos.entity.UserEntity;
import lk.ijse.pos.entity.UserLoginDetailsEntity;
import lk.ijse.pos.repository.UserRepository;
import lk.ijse.pos.repository.UserLoginDetailsRepository;
import lk.ijse.pos.service.UserService;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLoginDetailsRepository userLoginDetailsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserEntity changeUserPassword(Long id, UserPwdDto userPwdDto) {
        UserEntity userEntity = userRepository.findById(id).orElse(null);
        System.out.println(userPwdDto.getNewPassword());
        if (userEntity!=null) {
            String encodedPassword = passwordEncoder.encode(userPwdDto.getNewPassword());
            userEntity.setPassword(encodedPassword);
            //userEntity.setPassword(userPwdDto.getNewPassword());
            return userRepository.save(userEntity);
        } else {
            return null;
        }
    }

    @Override
    public UserEntity createUser(UserEntity userEntity) {
        return userRepository.save(userEntity);
    }

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public UserEntity handleLoginAttempt(String username, String password) {
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        if (user.isAccountLocked()) {
            user.setLastLoginAttempt(LocalDateTime.now());
            userRepository.save(user);
            throw new RuntimeException("Account is locked due to multiple failed login attempts");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            user.setLastLoginAttempt(LocalDateTime.now());
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLocked(true);
            }
            userRepository.save(user);
            return null;
        }

        user.setFailedLoginAttempts(0);
        user.setLastLoginAttempt(LocalDateTime.now());
        userRepository.save(user);
        return user;
    }

    @Override
    public void recordLoginDetails(UserEntity user, String status) {
        UserLoginDetailsEntity loginDetails = new UserLoginDetailsEntity();
        loginDetails.setUser(user);
        loginDetails.setLoginTime(LocalDateTime.now());
        loginDetails.setStatus(status);
        userLoginDetailsRepository.save(loginDetails);
    }

    @Override
    public void recordLogoutDetails(UserEntity user) {
        UserLoginDetailsEntity lastLogin = userLoginDetailsRepository.findActiveLoginByUserId(user.getId());
        if (lastLogin != null) {
            LocalDateTime logoutTime = LocalDateTime.now();
            lastLogin.setLogoutTime(logoutTime);
            lastLogin.setStatus("LOGOUT");
            userLoginDetailsRepository.save(lastLogin);
            // Update last_logout_time in user table
            user.setLastLogoutTime(logoutTime);
            userRepository.save(user);
        }
    }
}