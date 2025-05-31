package lk.ijse.pos.dto;

public class LoginResponseDto {
    private String token;
    private String username;
    private Long userId;

    public LoginResponseDto() {}

    public LoginResponseDto(String token, String username, Long userId) {
        this.token = token;
        this.username = username;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public Long getUserId() {
        return userId;
    }
}