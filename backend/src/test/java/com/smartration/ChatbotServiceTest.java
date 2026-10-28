package com.smartration;

import com.smartration.dto.ChatMessageRequest;
import com.smartration.dto.ChatMessageResponse;
import com.smartration.entity.BookingSlot;
import com.smartration.entity.Commodity;
import com.smartration.entity.RationShop;
import com.smartration.entity.StockBatch;
import com.smartration.repository.*;
import com.smartration.service.AuthService;
import com.smartration.service.ChatbotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatbotServiceTest {

    @Mock
    private CommodityRepository commodityRepository;

    @Mock
    private StockBatchRepository stockBatchRepository;

    @Mock
    private RationShopRepository shopRepository;

    @Mock
    private BookingSlotRepository bookingSlotRepository;

    @Mock
    private MonthlyEntitlementRepository monthlyEntitlementRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private EntitlementRuleRepository entitlementRuleRepository;

    @Mock
    private RationCardRepository rationCardRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ChatbotService chatbotService;

    private RationShop demoShop;
    private Commodity rice;
    private Commodity sugar;
    private Commodity wheat;
    private Commodity oil;

    @BeforeEach
    void setUp() {
        demoShop = RationShop.builder().id(1L).shopNumber("FPS-1001").shopName("Central Fair Price Shop").isOpen(true).operatingHours("09:00 AM - 05:30 PM").build();
        rice = Commodity.builder().id(1L).code("RICE").name("Boiled Rice (Grade A)").measurementUnit("KG").subsidizedPrice(new BigDecimal("3.00")).lowStockThreshold(new BigDecimal("200.00")).isActive(true).build();
        sugar = Commodity.builder().id(3L).code("SUGAR").name("Refined Cane Sugar").measurementUnit("KG").subsidizedPrice(new BigDecimal("13.50")).lowStockThreshold(new BigDecimal("50.00")).isActive(true).build();
        wheat = Commodity.builder().id(2L).code("WHEAT").name("Whole Milling Wheat").measurementUnit("KG").subsidizedPrice(new BigDecimal("2.00")).lowStockThreshold(new BigDecimal("150.00")).isActive(true).build();
        oil = Commodity.builder().id(6L).code("OIL").name("Cooking Oil").measurementUnit("LITRE").subsidizedPrice(new BigDecimal("25.00")).lowStockThreshold(new BigDecimal("50.00")).isActive(true).build();
    }

    @Test
    void testChatbotInventoryRiceStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("1200.00")).availableQuantity(new BigDecimal("950.00")).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("How much rice is available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_RICE", response.getIntentDetected());
        assertTrue(response.getReply().contains("950.00 KG"));
        assertTrue(response.getReply().contains("Physical Stock:"));
        assertTrue(response.getReply().contains("Reserved / Dispatched:"));
        assertTrue(response.isInformationalOnly());
        assertFalse(response.getSuggestions().isEmpty());
    }

    @Test
    void testChatbotSugarOutOfStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("150.00")).availableQuantity(BigDecimal.ZERO).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Is sugar available?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_SUGAR", response.getIntentDetected());
        assertTrue(response.getReply().contains("OUT OF STOCK"));
        assertTrue(response.getReply().contains("2026-11-02"));
    }

    @Test
    void testChatbotWheatStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByCode("WHEAT")).thenReturn(Optional.of(wheat));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 2L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("800.00")).availableQuantity(new BigDecimal("680.00")).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What is the current stock of wheat?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("COMMODITY_STOCK_WHEAT", response.getIntentDetected());
        assertTrue(response.getReply().contains("680.00 KG"));
        assertTrue(response.getReply().contains("Whole Milling Wheat"));
    }

    @Test
    void testChatbotLowStockQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(oil));
        when(commodityRepository.findByCode("OIL")).thenReturn(Optional.of(oil));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 6L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("100.00")).availableQuantity(new BigDecimal("25.00")).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Which commodities have low stock?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("LOW_STOCK_INVENTORY", response.getIntentDetected());
        assertTrue(response.getReply().contains("Cooking Oil"));
        assertTrue(response.getReply().contains("25.00 LITRE"));
    }

    @Test
    void testChatbotAllCommoditiesAvailableForDistributionQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(commodityRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(rice, sugar));
        when(commodityRepository.findByCode("RICE")).thenReturn(Optional.of(rice));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 1L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("1200.00")).availableQuantity(new BigDecimal("950.00")).build()
        ));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("150.00")).availableQuantity(BigDecimal.ZERO).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Which commodities are available for distribution?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("ALL_COMMODITIES_AVAILABLE", response.getIntentDetected());
        assertTrue(response.getReply().contains("Boiled Rice (Grade A)"));
        assertTrue(response.getReply().contains("Refined Cane Sugar"));
        assertTrue(response.getReply().contains("Out of stock"));
    }

    @Test
    void testChatbotDistributionScheduleQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What are this month's distribution dates?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("DISTRIBUTION_SCHEDULE", response.getIntentDetected());
        assertTrue(response.getReply().contains("Week 1 (1st - 7th)"));
        assertTrue(response.getReply().contains("Week 4"));
    }

    @Test
    void testChatbotBookingCapacityGuidance() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(bookingSlotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(eq(1L), any(LocalDate.class)))
                .thenReturn(List.of(
                        BookingSlot.builder().maxCapacity(20).bookedCount(8).build()
                ));
        when(commodityRepository.findByCode("SUGAR")).thenReturn(Optional.of(sugar));
        when(stockBatchRepository.findByShopIdAndCommodityId(1L, 3L)).thenReturn(List.of(
                StockBatch.builder().initialQuantity(new BigDecimal("150.00")).availableQuantity(BigDecimal.ZERO).build()
        ));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Can I book a ration slot now?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("SLOT_BOOKING_GUIDANCE", response.getIntentDetected());
        assertTrue(response.getReply().contains("30-minute") || response.getReply().contains("30 minutes"));
        assertTrue(response.getReply().contains("12 places remaining"));
        assertTrue(response.getReply().contains("Refined Sugar is currently **Out of Stock**"));
        assertTrue(response.isInformationalOnly());
    }

    @Test
    void testChatbotEmptyMessageHandledSafely() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("   ")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("EMPTY_INPUT", response.getIntentDetected());
        assertFalse(response.getSuggestions().isEmpty());
    }

    @Test
    void testChatbotFamilyMembersUnauthenticatedPrivacyProtected() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));
        when(authService.getCurrentAuthenticatedUser()).thenReturn(null);

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Who are my family members?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("FAMILY_MEMBERS_INQUIRY", response.getIntentDetected());
        assertTrue(response.getReply().contains("Confidentiality Notice") || response.getReply().contains("private"));
    }

    @Test
    void testChatbotAnnouncementsQuery() {
        when(shopRepository.findById(1L)).thenReturn(Optional.of(demoShop));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Are there any new announcements?")
                .shopId(1L)
                .build();

        ChatMessageResponse response = chatbotService.processMessage(request);

        assertNotNull(response);
        assertEquals("ANNOUNCEMENTS_AND_UPDATES", response.getIntentDetected());
        assertTrue(response.getReply().contains("PMGKAY"));
    }
}
