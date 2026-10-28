package com.smartration.repository;

import com.smartration.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByShopIdOrderByCreatedAtDesc(Long shopId);

    Page<StockMovement> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);

    @Query("SELECT sm FROM StockMovement sm WHERE " +
           "(:shopId IS NULL OR sm.shop.id = :shopId) AND " +
           "(:commodityId IS NULL OR sm.commodity.id = :commodityId) AND " +
           "(:startDate IS NULL OR sm.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR sm.createdAt <= :endDate) " +
           "ORDER BY sm.createdAt DESC")
    List<StockMovement> filterMovements(@Param("shopId") Long shopId,
                                        @Param("commodityId") Long commodityId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);
}
