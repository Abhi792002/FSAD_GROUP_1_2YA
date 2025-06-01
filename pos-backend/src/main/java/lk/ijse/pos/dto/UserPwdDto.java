package lk.ijse.pos.dto;

public class UserPwdDto{
    private String newPassword;
    
    // Default constructor
    public UserPwdDto() {}
    
    // Constructor with parameter
    public UserPwdDto(String newPassword) {
        this.newPassword = newPassword;
    }
    
    // Getter
    public String getNewPassword() {
        return newPassword;
    }
    
    // Setter
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}