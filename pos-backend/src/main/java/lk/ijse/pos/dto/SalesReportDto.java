package lk.ijse.pos.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class SalesReportDto {
    private String label;
    private Double total;

    public SalesReportDto(String label, Double total) {
        this.label = label;
        this.total = total;
    }
}
