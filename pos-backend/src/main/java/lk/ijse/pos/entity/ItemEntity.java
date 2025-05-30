package lk.ijse.pos.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "item")
public class ItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "itemId")
    private Long id;

    @Column(nullable = false)
    private String name;

    private Double price;

    @ManyToOne
    @JoinColumn(name = "categoryId")
    private CategoryEntity categoryEntity;

    @ManyToOne
    @JoinColumn(name = "stockId")
    private StockEntity stockEntity;

    @OneToMany(mappedBy = "item")
    @JsonIgnore  // Prevent infinite loop
    private List<CheckoutItemEntity> checkoutItems = new ArrayList<>();
}