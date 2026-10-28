package com.smartration.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private String reply;
    private String intentDetected;
    private List<String> suggestions;
    private String source;
    private String timestamp;
    private boolean isInformationalOnly;

    @JsonProperty("quickReplies")
    public List<String> getQuickReplies() {
        return suggestions;
    }
}
