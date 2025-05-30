package lk.ijse.pos.dto;

import lk.ijse.pos.entity.CategoryEntity;
import lk.ijse.pos.entity.StockEntity;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutItemDto {
    private Long itemId;
    private Integer qty;
}
