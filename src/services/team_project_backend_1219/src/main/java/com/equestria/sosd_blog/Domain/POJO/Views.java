package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Views {
    private Long id;
    private Long userId;
    private Long articleId;
    private LocalDateTime viewTime;
    private String status;
}
