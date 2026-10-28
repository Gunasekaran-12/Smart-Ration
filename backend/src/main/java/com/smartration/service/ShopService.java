package com.smartration.service;

import com.smartration.entity.RationShop;
import com.smartration.exception.BadRequestException;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.RationShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final RationShopRepository shopRepository;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<RationShop> getAllShops() {
        return shopRepository.findAll();
    }

    @Transactional(readOnly = true)
    public RationShop getShopById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ration Shop not found with ID: " + id));
    }

    @Transactional
    public RationShop createShop(RationShop shop, String ipAddress) {
        if (shopRepository.existsByShopNumber(shop.getShopNumber())) {
            throw new BadRequestException("Shop number already exists: " + shop.getShopNumber());
        }

        RationShop saved = shopRepository.save(shop);
        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "CREATE_SHOP", "RATION_SHOP",
                saved.getId().toString(), saved.getId(), "Created shop: " + saved.getShopName(), ipAddress);

        return saved;
    }

    @Transactional
    public RationShop updateShop(Long id, RationShop details, String ipAddress) {
        RationShop existing = getShopById(id);
        existing.setShopName(details.getShopName());
        existing.setDistrict(details.getDistrict());
        existing.setTalukBlock(details.getTalukBlock());
        existing.setAddress(details.getAddress());
        existing.setContactPerson(details.getContactPerson());
        existing.setContactPhone(details.getContactPhone());
        if (details.getIsActive() != null) {
            existing.setIsActive(details.getIsActive());
        }

        RationShop updated = shopRepository.save(existing);
        auditLogService.logAction(authService.getCurrentAuthenticatedUser(), "UPDATE_SHOP", "RATION_SHOP",
                updated.getId().toString(), updated.getId(), "Updated shop details", ipAddress);

        return updated;
    }
}
