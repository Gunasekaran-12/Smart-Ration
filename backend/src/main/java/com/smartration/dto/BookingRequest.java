package com.smartration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Ration card ID is required")
    private Long rationCardId;

    @NotNull(message = "Shop ID is required")
    private Long shopId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    private List<DistributionItemRequest> requestedItems;
}

