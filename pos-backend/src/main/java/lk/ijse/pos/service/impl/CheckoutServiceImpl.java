package lk.ijse.pos.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lk.ijse.pos.dto.CheckoutItemDto;
import lk.ijse.pos.entity.CheckoutItemEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lk.ijse.pos.dto.CheckoutDto;
import lk.ijse.pos.entity.CheckoutEntity;
import lk.ijse.pos.entity.ItemEntity;
import lk.ijse.pos.entity.StockEntity;
import lk.ijse.pos.repository.CheckoutRepository;
import lk.ijse.pos.repository.ItemRepository;
import lk.ijse.pos.repository.StockRepository;
import lk.ijse.pos.service.CheckoutService;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    @Autowired
    private CheckoutRepository checkoutRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StockRepository stockRepository;

    @Override
    public CheckoutEntity createCheckout(CheckoutDto checkoutDto) {

        List<CheckoutItemDto> checkoutItemDtos = checkoutDto.getCheckoutItemList(); // each contains itemId + quantity

        CheckoutEntity checkout = new CheckoutEntity();
        checkout.setOrderTime(LocalDateTime.now());
        checkout.setCheckoutItems(new ArrayList<>());

        for (CheckoutItemDto itemDto : checkoutItemDtos) {
            Long itemId = itemDto.getItemId();
            int quantity = itemDto.getQty();

            ItemEntity item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));

            StockEntity stock = item.getStockEntity();
            if (stock != null) {
                int currentQty = stock.getQty();
                if (currentQty >= quantity) {
                    stock.setQty(currentQty - quantity);
                    stockRepository.save(stock);
                } else {
                    throw new RuntimeException("Insufficient stock for item: " + item.getName());
                }
            }

            // Create CheckoutItemEntity and set relations
            CheckoutItemEntity checkoutItem = new CheckoutItemEntity();
            checkoutItem.setItem(item);
            checkoutItem.setCheckout(checkout); // attach to current checkout
            checkoutItem.setQuantity(quantity);

            // Add to checkout's list
            checkout.getCheckoutItems().add(checkoutItem);
        }

        checkout.setTotal(checkoutDto.getTotalAmount());
        return checkoutRepository.save(checkout);
    }


    @Override
    public List<CheckoutEntity> getAllCheckouts() {
        return checkoutRepository.findAll();
    }

    @Override
    public CheckoutEntity getCheckoutById(Long id) {
        return checkoutRepository.findById(id).orElse(null);
    }

    @Override
    public CheckoutEntity deleteCheckout(Long id) {
        CheckoutEntity checkout = checkoutRepository.findById(id).orElse(null);
        if (checkout!=null) {
            checkoutRepository.delete(checkout);
            return checkout;
        } else {
            return null;
        }
    }

}