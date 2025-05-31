package lk.ijse.pos.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

//import lk.ijse.pos.dto.LoginDto;
import lk.ijse.pos.dto.LoginRequestDto;
import lk.ijse.pos.dto.LoginResponseDto;
import lk.ijse.pos.entity.UserEntity;
import lk.ijse.pos.repository.UserRepository;
import lk.ijse.pos.security.jwt.JwtUtils;
import lk.ijse.pos.service.UserService;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;
    
    @PostMapping("/auth/login") 
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginDTO) {
        try {
            UserEntity user = userService.handleLoginAttempt(loginDTO.getUsername(), loginDTO.getPassword());
            if (user == null) {
                return ResponseEntity.status(401).body("Invalid username or password");
            }

            // Create Authentication object
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword())
            );

            // Generate JWT token
            String token = jwtUtils.generateJwtToken(authentication);

            userService.recordLoginDetails(user, "SUCCESS");
           LoginResponseDto response = new LoginResponseDto(token, user.getUsername(), user.getId());
           // return ResponseEntity.ok().body(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
   
    
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody UserEntity userEntity) {
        
        if(userRepository.existsByUsername(userEntity.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already in use");
        }

        if(userRepository.existsByEmail(userEntity.getEmail())) {
            return ResponseEntity.badRequest().body("This email is being used");
        }

        UserEntity newUser = new UserEntity();
        newUser.setUsername(userEntity.getUsername());
        newUser.setEmail(userEntity.getEmail());
        newUser.setPassword(passwordEncoder.encode(userEntity.getPassword()));

        return ResponseEntity.ok(userService.createUser(newUser));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(@RequestBody LoginRequestDto loginDto) {
        try {
            UserEntity user = userRepository.findByUsername(loginDto.getUsername()).orElse(null);
            if (user != null) {
                userService.recordLogoutDetails(user);
            }
            return ResponseEntity.ok().body("Logged out successfully");
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error during logout");

        }
    }
}