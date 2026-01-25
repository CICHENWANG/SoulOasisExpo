package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

import java.util.List;

@Data
public class AiChatRequestDTO {
    private Integer stressScore;
    private String mode;
    private List<AiChatMessageDTO> messages;
}
