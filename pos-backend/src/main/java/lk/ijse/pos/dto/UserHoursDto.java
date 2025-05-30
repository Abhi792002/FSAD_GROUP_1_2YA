package lk.ijse.pos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserHoursDto {
    private String user;
    private String date;
    private double hours;

    public UserHoursDto(String user, String date, double hours){
        this.user = user;
        this.date = date;
        this.hours = hours;
    }
}
