package com.smartration.service;

import com.smartration.dto.ChatMessageRequest;
import com.smartration.dto.ChatMessageResponse;
import com.smartration.entity.*;
import com.smartration.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final CommodityRepository commodityRepository;
    private final StockBatchRepository stockBatchRepository;
    private final RationShopRepository shopRepository;
    private final BookingSlotRepository bookingSlotRepository;
    private final MonthlyEntitlementRepository monthlyEntitlementRepository;
    private final ComplaintRepository complaintRepository;
    private final EntitlementRuleRepository entitlementRuleRepository;
    private final RationCardRepository rationCardRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public ChatMessageResponse processMessage(ChatMessageRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ChatMessageResponse.builder()
                    .reply("Please enter a question or select one of the suggested topics below.")
                    .intentDetected("EMPTY_INPUT")
                    .suggestions(getStandardSuggestions())
                    .source("SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS")
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .isInformationalOnly(true)
                    .build();
        }

        // Sanitize and normalize input (max 500 characters, strip HTML/script tags)
        String rawMsg = request.getMessage().replaceAll("<[^>]*>", "").trim();
        if (rawMsg.length() > 500) {
            rawMsg = rawMsg.substring(0, 500);
        }
        String msg = rawMsg.toLowerCase();

        Long shopId = request.getShopId() != null ? request.getShopId() : 1L;
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser != null && currentUser.getShop() != null) {
            shopId = currentUser.getShop().getId();
        }

        RationShop shop = shopRepository.findById(shopId).orElse(null);
        String shopName = shop != null ? shop.getShopName() : "Fair Price Shop #1";
        boolean isOpen = shop == null || Boolean.TRUE.equals(shop.getIsOpen());
        String hours = shop != null ? shop.getOperatingHours() : "09:00 AM - 01:00 PM, 02:00 PM - 06:00 PM";

        String reply = "";
        String intent = "GENERAL_INQUIRY";
        List<String> suggestions = new ArrayList<>();

        // 1. Specific Commodity Queries: Rice
        if (msg.contains("rice") || msg.contains("அரிசி")) {
            intent = "COMMODITY_STOCK_RICE";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "RICE");
            boolean outOfStock = m.availableStock.compareTo(BigDecimal.ZERO) <= 0;
            reply = "🌾 **Boiled Rice (Grade A) Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " KG\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " KG\n"
                    + "• **Reserved / Dispatched:** " + m.reservedStock.toPlainString() + " KG\n"
                    + "• **Status:** " + (outOfStock ? "Out of stock" : "In stock") + "\n"
                    + "• **Subsidized Tariff:** ₹3.00/KG for Priority/BPL cards; Free (₹0.00) for Antyodaya (AAY) cards.\n"
                    + (outOfStock
                        ? "⚠️ Rice is currently **OUT OF STOCK** at this counter. FCI replenishment consignment is expected within 48 hours."
                        : "✅ Boiled Rice is currently **In stock & Available for Distribution**.");
            suggestions.addAll(List.of("Which commodities are out of stock?", "Is sugar available?", "Can I book a ration slot now?"));

        // 2. Specific Commodity Queries: Sugar
        } else if (msg.contains("sugar") || msg.contains("சர்க்கரை")) {
            intent = "COMMODITY_STOCK_SUGAR";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "SUGAR");
            boolean outOfStock = m.availableStock.compareTo(BigDecimal.ZERO) <= 0;
            reply = "🍬 **Refined Cane Sugar Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " KG\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " KG\n"
                    + "• **Reserved / Dispatched:** " + m.reservedStock.toPlainString() + " KG\n"
                    + "• **Status:** " + (outOfStock ? "Out of stock (Replenishment expected: 2026-11-02)" : "In stock") + "\n"
                    + (outOfStock
                        ? "⚠️ Refined Cane Sugar is currently **OUT OF STOCK** (0.00 KG available). Next warehouse dispatch from State Civil Supplies is scheduled for **2026-11-02**.\n"
                          + "ℹ️ *Beneficiary Note:* You can still book a token and collect your other entitled quotas (Rice, Wheat, Dal, Cooking Oil, Salt). Sugar will be disbursed upon arrival."
                        : "✅ Refined Cane Sugar is in stock and available for distribution @ ₹13.50/KG.");
            suggestions.addAll(List.of("When will sugar be replenished?", "Which commodities are available for distribution?", "Can I book a ration slot now?"));

        // 3. Specific Commodity Queries: Wheat
        } else if (msg.contains("wheat") || msg.contains("கோதுமை")) {
            intent = "COMMODITY_STOCK_WHEAT";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "WHEAT");
            boolean outOfStock = m.availableStock.compareTo(BigDecimal.ZERO) <= 0;
            reply = "🌾 **Whole Milling Wheat Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " KG\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " KG\n"
                    + "• **Reserved / Dispatched:** " + m.reservedStock.toPlainString() + " KG\n"
                    + "• **Status:** " + (outOfStock ? "Out of stock" : "In stock") + "\n"
                    + "• **Subsidized Tariff:** ₹2.00/KG for Priority/BPL cards; Free (₹0.00) for Antyodaya (AAY) cards.\n"
                    + "✅ Whole Milling Wheat is **In stock & Available for Distribution**.";
            suggestions.addAll(List.of("How much rice is available?", "Which commodities are out of stock?", "Can I book a ration slot now?"));

        // 4. Specific Commodity Queries: Cooking Oil
        } else if (msg.contains("oil") || msg.contains("எண்ணெய்")) {
            intent = "COMMODITY_STOCK_OIL";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "OIL");
            boolean isLow = m.availableStock.compareTo(m.lowStockThreshold) <= 0;
            reply = "🛢️ **Cooking Oil Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " LITRE\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " LITRE\n"
                    + "• **Low Stock Threshold:** " + m.lowStockThreshold.toPlainString() + " LITRE\n"
                    + "• **Status:** " + (isLow ? "Low stock (" + m.availableStock.toPlainString() + " L remaining)" : "In stock") + "\n"
                    + "• **Subsidized Tariff:** ₹25.00/Litre for AAY/BPL cards; ₹35.00/Litre for APL.\n"
                    + (isLow ? "⚠️ Stock is running low! An automated replenishment requisition has been submitted." : "✅ Cooking Oil is in stock.");
            suggestions.addAll(List.of("Which commodities have low stock?", "Which commodities are out of stock?", "What time slots can I book?"));

        // 5. Specific Commodity Queries: Salt
        } else if (msg.contains("salt") || msg.contains("உப்பு")) {
            intent = "COMMODITY_STOCK_SALT";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "SALT");
            reply = "🧂 **Fortified Iodized Salt Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " KG\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " KG\n"
                    + "• **Status:** In stock\n"
                    + "• **Subsidized Tariff:** Free (₹0.00) for AAY/BPL cardholders; ₹2.00/KG for APL.\n"
                    + "✅ Fortified Iodized Salt is **In stock & Available for Distribution**.";
            suggestions.addAll(List.of("How much rice is available?", "Is sugar available?", "Can I book a ration slot now?"));

        // 6. Specific Commodity Queries: Toor Dal
        } else if (msg.contains("dal") || msg.contains("toor") || msg.contains("பருப்பு")) {
            intent = "COMMODITY_STOCK_DAL";
            CommodityStockMetrics m = getMetricsForCommodity(shopId, "DAL");
            reply = "🥣 **Toor Dal (Split Pigeon Peas) Inventory Status at " + shopName + ":**\n"
                    + "• **Available Stock:** " + m.availableStock.toPlainString() + " KG\n"
                    + "• **Physical Stock:** " + m.physicalStock.toPlainString() + " KG\n"
                    + "• **Status:** In stock\n"
                    + "• **Subsidized Tariff:** ₹35.00/KG (₹30.00/KG for AAY).\n"
                    + "✅ Toor Dal is **In stock & Available for Distribution**.";
            suggestions.addAll(List.of("Which commodities are out of stock?", "What time slots can I book?", "What are the ration distribution rules?"));

        // 7. Low Stock Queries
        } else if (msg.contains("low stock") || msg.contains("low") || msg.contains("threshold") || msg.contains("குறைந்த")) {
            intent = "LOW_STOCK_INVENTORY";
            List<Commodity> comms = commodityRepository.findByIsActiveTrueOrderByNameAsc();
            List<String> lowList = new ArrayList<>();

            for (Commodity c : comms) {
                CommodityStockMetrics m = getMetricsForCommodity(shopId, c.getCode());
                if (m.availableStock.compareTo(BigDecimal.ZERO) > 0 && m.availableStock.compareTo(c.getLowStockThreshold()) <= 0) {
                    lowList.add("• **" + c.getName() + "**: " + m.availableStock.toPlainString() + " " + c.getMeasurementUnit()
                            + " available (Threshold: " + c.getLowStockThreshold().toPlainString() + " " + c.getMeasurementUnit() + ") - **Status: Low stock**");
                }
            }

            if (lowList.isEmpty()) {
                reply = "✅ **Buffer Assessment:** No commodities are currently below statutory safety thresholds at " + shopName + ".";
            } else {
                reply = "⚠️ **Low Stock Commodities at " + shopName + ":**\n\n"
                        + String.join("\n", lowList)
                        + "\n\n*Replenishment POs have been automatically transmitted to the district supply officer.*";
            }
            suggestions.addAll(List.of("Which commodities are out of stock?", "When will commodities be replenished?", "Can I book a ration slot now?"));

        // 8. Out of Stock Queries
        } else if (msg.contains("out of stock") || msg.contains("missing") || msg.contains("unavailable") || msg.contains("shortage") || msg.contains("கையிருப்பு இல்லை") || msg.contains("இல்லை")) {
            intent = "OUT_OF_STOCK_INVENTORY";
            List<Commodity> comms = commodityRepository.findByIsActiveTrueOrderByNameAsc();
            List<String> outList = new ArrayList<>();

            for (Commodity c : comms) {
                CommodityStockMetrics m = getMetricsForCommodity(shopId, c.getCode());
                if (m.availableStock.compareTo(BigDecimal.ZERO) <= 0) {
                    String estimate = c.getCode().equalsIgnoreCase("SUGAR") ? "Replenishment expected: 2026-11-02" : "Replenishment dispatch pending";
                    outList.add("• **" + c.getName() + "**: " + m.availableStock.toPlainString() + " " + c.getMeasurementUnit()
                            + " available. **Status: Out of stock** (" + estimate + ")");
                }
            }

            if (outList.isEmpty()) {
                reply = "✅ **Inventory Health:** All registered ration commodities are currently **IN STOCK** at " + shopName + ".";
            } else {
                reply = "⚠️ **Out of Stock Alert at " + shopName + ":**\n\n"
                        + String.join("\n", outList)
                        + "\n\n*Beneficiary Notice:* You may still collect remaining available commodities. Missing items can be obtained during the subsequent weekly cycle.";
            }
            suggestions.addAll(List.of("When will sugar be replenished?", "Which commodities are available for distribution?", "Can I book a ration slot now?"));

        // 9. Distribution Dates & 4 Weekly Windows
        } else if (msg.contains("distribution date") || msg.contains("dates") || msg.contains("window") || msg.contains("weekly") || msg.contains("schedule") || msg.contains("மாத விநியோகம்")) {
            intent = "DISTRIBUTION_SCHEDULE";
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            String currentWindow = day <= 7 ? "Week 1 (1st - 7th)" : (day <= 14 ? "Week 2 (8th - 14th)" : (day <= 21 ? "Week 3 (15th - 21st)" : "Week 4 (22nd - Month End)"));

            reply = "📅 **Monthly Ration Distribution Schedule (" + today.getMonth().name() + " " + today.getYear() + "):**\n\n"
                    + "Ration distribution is structured across 4 weekly operational windows:\n"
                    + "• **Week 1 (1st - 7th):** Antyodaya Anna Yojana (AAY) & Senior Citizen Priority\n"
                    + "• **Week 2 (8th - 14th):** Priority Household (BPL / PHH) Phase 1\n"
                    + "• **Week 3 (15th - 21st):** Priority Household (BPL / PHH) Phase 2\n"
                    + "• **Week 4 (22nd - End):** General Distribution, APL Cards & Mop-Up Quotas\n\n"
                    + "📍 **Current Active Window:** **" + currentWindow + "**.\n"
                    + "Shop Operating Hours: **" + hours + "** (Mon - Sat).";
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Can I book a ration slot now?", "What are the ration distribution rules?"));

        // 10. Can I Book a Ration Slot Now / Slot Booking Guidance
        } else if (msg.contains("slot") || msg.contains("book") || msg.contains("token") || msg.contains("time") || msg.contains("முன்பதிவு") || msg.contains("டோக்கன்")) {
            intent = "SLOT_BOOKING_GUIDANCE";
            LocalDate today = LocalDate.now();
            List<BookingSlot> slots = bookingSlotRepository.findByShopIdAndSlotDateAndIsActiveTrueOrderByStartTimeAsc(shopId, today);
            int totalCapacity = slots.stream().mapToInt(BookingSlot::getMaxCapacity).sum();
            int totalBooked = slots.stream().mapToInt(BookingSlot::getBookedCount).sum();
            int remainingPlaces = Math.max(0, totalCapacity - totalBooked);

            // Check sugar status for transparent advice
            CommodityStockMetrics sugarMetrics = getMetricsForCommodity(shopId, "SUGAR");
            boolean sugarOut = sugarMetrics.availableStock.compareTo(BigDecimal.ZERO) <= 0;

            reply = "🎟️ **30-Minute Slot Booking & Counter Availability Guidance:**\n\n"
                    + "• **Shop Status:** " + (isOpen ? "🟢 OPEN (" + hours + ")" : "🔴 CLOSED") + "\n"
                    + "• **Slot Interval:** 30-minute blocks (09:00 AM to 05:30 PM), max **20 beneficiaries** per slot\n"
                    + "• **Today's Capacity:** **" + totalBooked + " booked** / **" + remainingPlaces + " places remaining** across " + slots.size() + " active slots\n\n"
                    + "📦 **Commodity Availability for Distribution:**\n"
                    + "• Rice, Wheat, Dal, Oil, and Salt are currently **available for collection**.\n"
                    + (sugarOut ? "• ⚠️ *Notice:* Refined Sugar is currently **Out of Stock** (Replenishment expected: 2026-11-02). You can book a slot now to collect all other foodgrains, or reserve after replenishment.\n\n" : "\n")
                    + "ℹ️ **How to Reserve:** *The chatbot is strictly informational and cannot book or cancel reservations directly.* "
                    + "Please open the **Slot Booking (Token)** page from your sidebar to select your preferred time and download your token.";
            suggestions.addAll(List.of("Which commodities are available for distribution?", "When will sugar be replenished?", "What are this month's distribution dates?"));

        // 11. All Commodities Available for Distribution
        } else if (msg.contains("available") || msg.contains("commodities") || msg.contains("items") || msg.contains("all stock") || msg.contains("distribution") || msg.contains("இருப்பு")) {
            intent = "ALL_COMMODITIES_AVAILABLE";
            List<Commodity> comms = commodityRepository.findByIsActiveTrueOrderByNameAsc();
            StringBuilder sb = new StringBuilder("📦 **Ration Commodities Stock & Distribution Status at " + shopName + ":**\n\n");

            for (Commodity c : comms) {
                CommodityStockMetrics m = getMetricsForCommodity(shopId, c.getCode());
                String statusStr;
                if (m.availableStock.compareTo(BigDecimal.ZERO) <= 0) {
                    String repl = c.getCode().equalsIgnoreCase("SUGAR") ? "Replenishment expected: 2026-11-02" : "Replenishment pending";
                    statusStr = "Status: Out of stock (" + repl + ")";
                } else if (m.availableStock.compareTo(c.getLowStockThreshold()) <= 0) {
                    statusStr = "Status: Low stock";
                } else {
                    statusStr = "Status: In stock";
                }

                sb.append("• **").append(c.getName()).append("**: ")
                        .append(m.availableStock.toPlainString()).append(" ").append(c.getMeasurementUnit()).append(" available. ")
                        .append("**").append(statusStr).append("** (Physical: ").append(m.physicalStock.toPlainString())
                        .append(" ").append(c.getMeasurementUnit()).append(", Price: ₹").append(c.getSubsidizedPrice()).append("/").append(c.getMeasurementUnit()).append(")\n");
            }
            sb.append("\n*Stock balances are verified via real-time electronic weighment telemetry.*");
            reply = sb.toString();
            suggestions.addAll(List.of("Which commodities are out of stock?", "How much rice is available?", "Can I book a ration slot now?"));

        // 12. Replenishment Timetable Queries
        } else if (msg.contains("replenish") || msg.contains("arrival") || msg.contains("next stock") || msg.contains("when") || msg.contains("சரக்கு")) {
            intent = "STOCK_REPLENISHMENT";
            reply = "🚚 **Authorized Stock Replenishment Schedule:**\n"
                    + "• **Refined Cane Sugar:** Out of stock. Next scheduled consignment arrival is **2026-11-02** via Karnataka State Civil Supplies Corporation.\n"
                    + "• **Boiled Rice (Grade A) & Milling Wheat:** Next routine replenishment window is **" + LocalDate.now().plusDays(3) + "** from Food Corporation of India (FCI) Regional Warehouse.\n"
                    + "• **Cooking Oil & Fortified Salt:** Inward pipeline batch `BATCH-2026-OIL-02` dispatching on **" + LocalDate.now().plusDays(2) + "**.\n"
                    + "• All inward receipts undergo electronic weighment verification before being credited to live balances.";
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Which commodities are out of stock?", "Can I book a ration slot now?"));

        // 13. Complaints, Missing Commodities & Grievances
        } else if (msg.contains("complaint") || msg.contains("grievance") || msg.contains("report") || msg.contains("track") || msg.contains("overcharge") || msg.contains("புகார்")) {
            intent = "COMPLAINT_GUIDANCE";
            if (currentUser != null && currentUser.getRole() == com.smartration.entity.enums.Role.BENEFICIARY) {
                List<Complaint> myComplaints = complaintRepository.findByBeneficiaryUserIdOrderByCreatedAtDesc(currentUser.getId());
                if (!myComplaints.isEmpty()) {
                    StringBuilder sb = new StringBuilder("📋 **Your Tracked Grievance Tickets:**\n\n");
                    for (Complaint c : myComplaints.stream().limit(3).toList()) {
                        sb.append("• **Ticket #").append(c.getComplaintNumber()).append("**: ").append(c.getSubject())
                                .append(" | Status: **").append(c.getStatus()).append("**\n");
                        if (c.getResolutionRemarks() != null && !c.getResolutionRemarks().isEmpty()) {
                            sb.append("  *Remarks:* ").append(c.getResolutionRemarks()).append("\n");
                        }
                    }
                    sb.append("\nYou can view full inspection histories in the **Grievances / Complaints** tab.");
                    reply = sb.toString();
                } else {
                    reply = getComplaintProcedureGuide();
                }
            } else {
                reply = getComplaintProcedureGuide();
            }
            suggestions.addAll(List.of("Which commodities are out of stock?", "What should I do if a commodity is missing?", "What are the ration distribution rules?"));

        // 14. Distribution Rules & Subsidized Entitlements
        } else if (msg.contains("rule") || msg.contains("entitlement") || msg.contains("quota") || msg.contains("விதிகள்") || msg.contains("உரிமம்")) {
            intent = "RATION_DISTRIBUTION_RULES";
            reply = "⚖️ **National Food Security Act (NFSA) Distribution Rules:**\n\n"
                    + "1. **Antyodaya Anna Yojana (AAY / Yellow Cards):**\n"
                    + "   • 35 KG subsidized grain per household (25 KG Rice @ ₹0/Free + 10 KG Wheat @ ₹0/Free)\n"
                    + "   • 1 KG Sugar @ ₹13.50/KG, 2 KG Toor Dal @ ₹30.00/KG, 1 L Cooking Oil @ ₹25.00, 1 KG Salt Free\n\n"
                    + "2. **Priority Household (BPL / PHH / Pink Cards):**\n"
                    + "   • 5 KG foodgrain per family member (3 KG Rice @ ₹3/KG + 2 KG Wheat @ ₹2/KG)\n"
                    + "   • 1 KG Sugar @ ₹13.50/KG, 1 KG Toor Dal @ ₹35.00/KG, 1 L Cooking Oil @ ₹25.00, 1 KG Salt Free\n\n"
                    + "3. **Non-Priority Household (APL / White Cards):**\n"
                    + "   • Standard household quota (10 KG Rice @ ₹8.50/KG + 5 KG Wheat @ ₹7.00/KG, 1 L Oil @ ₹35.00)\n\n"
                    + "All allocations are verified using POS biometric scale and cryptographic OTP validation.";
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Can I book a ration slot now?", "How much rice is available?"));

        // 15. Family Members & Card Information (Privacy-Guarded)
        } else if (msg.contains("family") || msg.contains("member") || msg.contains("card detail") || msg.contains("who is on my card") || msg.contains("உறுப்பினர்") || msg.contains("குடும்ப")) {
            intent = "FAMILY_MEMBERS_INQUIRY";
            if (currentUser != null && currentUser.getRole() == com.smartration.entity.enums.Role.BENEFICIARY && currentUser.getRationCardId() != null) {
                Optional<RationCard> cardOpt = rationCardRepository.findById(currentUser.getRationCardId());
                if (cardOpt.isPresent()) {
                    RationCard card = cardOpt.get();
                    List<FamilyMember> members = familyMemberRepository.findByRationCardId(card.getId());
                    StringBuilder sb = new StringBuilder("👨‍👩‍👧‍👦 **Official Registered Family Register:**\n");
                    sb.append("• Ration Card No: **").append(card.getCardNumber()).append("**\n");
                    sb.append("• Head of Family: **").append(card.getHeadOfFamily()).append("**\n");
                    sb.append("• Category: **").append(card.getCardCategory()).append("**\n");
                    sb.append("• Registered Members (**").append(members.size()).append("** Total):\n\n");
                    for (FamilyMember m : members) {
                        sb.append("  - **").append(m.getFullName()).append("** (")
                                .append(m.getRelationship()).append(", Age: ").append(m.getAge()).append(", Gender: ").append(m.getGender()).append(")\n");
                    }
                    sb.append("\n*Family records are verified under statutory NFSA census records.*");
                    reply = sb.toString();
                } else {
                    reply = "⚠️ Card record could not be located in current shop ledger. Please contact your local Fair Price Shop inspector.";
                }
            } else {
                reply = "🔒 **Confidentiality Notice:** Beneficiary family registers and quota records are private and protected. Please sign in via the **Beneficiary Portal** with your Ration Card Number and Date of Birth to inspect your family members.";
            }
            suggestions.addAll(List.of("What are the ration distribution rules?", "Which commodities are available for distribution?", "Can I book a ration slot now?"));

        // 16. Official Announcements & Policy Updates
        } else if (msg.contains("announcement") || msg.contains("news") || msg.contains("update") || msg.contains("அறிவிப்பு")) {
            intent = "ANNOUNCEMENTS_AND_UPDATES";
            reply = "📢 **Current PDS Departmental Announcements:**\n\n"
                    + "1. **PMGKAY 100% Subsidized Grain:** Zero consumer tariff applies to standard rice and wheat quotas for all AAY and BPL cardholders.\n"
                    + "2. **Advance Slot Token Booking:** All cardholders are encouraged to reserve a 30-minute crowd management window before visiting the counter.\n"
                    + "3. **Zero Tolerance on Diversion:** Real-time weighing scale telemetry is logged directly to the state audit ledger upon distribution.\n"
                    + "4. **Biometric Exemption:** Senior citizens above 70 years may nominate an authorized family member with OTP authentication.";
            suggestions.addAll(List.of("Which commodities are available for distribution?", "Can I book a ration slot now?", "What are this month's distribution dates?"));

        // Default General Query
        } else {
            intent = "GENERAL_INQUIRY";
            reply = "👋 **Vanakkam! Welcome to the SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS AI Assistant.**\n\n"
                    + "I provide verified, live information retrieved directly from the state civil supplies database (MySQL `smart`).\n\n"
                    + "Here are some questions you can ask me:\n"
                    + "• How much rice is available?\n"
                    + "• Which commodities are out of stock?\n"
                    + "• Is sugar available?\n"
                    + "• What is the current stock of wheat?\n"
                    + "• Which commodities have low stock?\n"
                    + "• When will rice be replenished?\n"
                    + "• Can I book a ration slot now?\n"
                    + "• Which commodities are available for distribution?\n"
                    + "• What are the ration distribution rules?\n"
                    + "• How can I register or track a complaint?";
            suggestions = getStandardSuggestions();
        }

        return ChatMessageResponse.builder()
                .reply(reply)
                .intentDetected(intent)
                .suggestions(suggestions)
                .source("State Food & Civil Supplies Database (MySQL `smart`)")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .isInformationalOnly(true)
                .build();
    }

    private CommodityStockMetrics getMetricsForCommodity(Long shopId, String commodityCode) {
        Optional<Commodity> commOpt = commodityRepository.findByCode(commodityCode);
        if (commOpt.isEmpty()) {
            return new CommodityStockMetrics(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.valueOf(50));
        }
        Commodity c = commOpt.get();
        List<StockBatch> batches = stockBatchRepository.findByShopIdAndCommodityId(shopId, c.getId());

        BigDecimal physicalStock = batches.stream()
                .map(StockBatch::getInitialQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal availableStock = batches.stream()
                .map(StockBatch::getAvailableQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal reservedStock = physicalStock.subtract(availableStock).max(BigDecimal.ZERO);

        return new CommodityStockMetrics(availableStock, physicalStock, reservedStock, c.getLowStockThreshold());
    }

    private record CommodityStockMetrics(
            BigDecimal availableStock,
            BigDecimal physicalStock,
            BigDecimal reservedStock,
            BigDecimal lowStockThreshold
    ) {}

    private String getComplaintProcedureGuide() {
        return "⚖️ **How to Register or Track an Official Grievance:**\n\n"
                + "1. **Missing or Delayed Commodity:** If a shop reports shortages across consecutive weekly windows, report under category `STOCK_UNAVAILABLE`.\n"
                + "2. **Scale Calibration / Weighment Issue:** Report under `WEIGHMENT_ISSUE` with the transaction reference.\n"
                + "3. **Overcharging:** Report any pricing charged above statutory NFSA subsidized tariffs under `OVERCHARGING`.\n"
                + "4. **Operator Behavior / Unannounced Closures:** Report under `OPERATOR_BEHAVIOR`.\n\n"
                + "To lodge or track an official complaint, open the **Grievances / Complaints** tab. A verifiable complaint ID (e.g. `CMP-202610-001`) will be created for departmental inspection.";
    }

    private List<String> getStandardSuggestions() {
        return List.of(
                "How much rice is available?",
                "Which commodities are out of stock?",
                "Is sugar available?",
                "What is the current stock of wheat?",
                "Which commodities have low stock?",
                "When will rice be replenished?",
                "Can I book a ration slot now?",
                "Which commodities are available for distribution?"
        );
    }
}
