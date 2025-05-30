package lk.ijse.pos.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutDto {
    private List<CheckoutItemDto> checkoutItemList;
    private Double totalAmount;
}