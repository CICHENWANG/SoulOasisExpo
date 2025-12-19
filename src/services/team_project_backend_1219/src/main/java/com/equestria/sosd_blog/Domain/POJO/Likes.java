package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Likes {
    private Long id;
    private Long userId;
    private Long articleId;
    private Long commentId;
    private LocalDateTime createdTime;
    private String status;
}
