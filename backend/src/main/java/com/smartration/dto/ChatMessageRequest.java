package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {

    @NotBlank(message = "Message text cannot be empty")
    private String message;

    private Long shopId;

    private String language; // "en" or "ta"
}

