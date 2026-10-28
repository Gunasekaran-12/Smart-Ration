package com.smartration.service;

import com.smartration.dto.AuthRequest;
import com.smartration.dto.AuthResponse;
import com.smartration.entity.RationCard;
import com.smartration.entity.User;
import com.smartration.exception.ResourceNotFoundException;
import com.smartration.repository.RationCardRepository;
import com.smartration.repository.UserRepository;
import com.smartration.security.JwtTokenProvider;
import com.smartration.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RationCardRepository rationCardRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse login(AuthRequest request, String ipAddress) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String cardNumber = null;
        if (user.getRationCardId() != null) {
            cardNumber = rationCardRepository.findById(user.getRationCardId())
                    .map(RationCard::getCardNumber)
                    .orElse(null);
        }

        auditLogService.logAction(user, "USER_LOGIN", "USER", user.getId().toString(),
                user.getShop() != null ? user.getShop().getId() : null,
                "User successfully logged in via credentials", ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .shopId(user.getShop() != null ? user.getShop().getId() : null)
                .shopName(user.getShop() != null ? user.getShop().getShopName() : null)
                .rationCardId(user.getRationCardId())
                .cardNumber(cardNumber)
                .build();
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return userRepository.findById(principal.getId()).orElse(null);
    }
}
