package com.smartration.repository;

import com.smartration.entity.BookingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingSlotRepository extends JpaRepository<BookingSlot, Long> {
    List<BookingSlot> findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(Long shopId, LocalDate slotDate);
    List<BookingSlot> findByShopIdAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(Long shopId);
    Optional<BookingSlot> findByShopIdAndSlotDateAndStartTime(Long shopId, LocalDate slotDate, java.time.LocalTime startTime);
}

