package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Comments {
    private Long id;
    private Long userId;
    private Long articleId;
    private Long parentId;
    private String content;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createdTime;
    private String status;
}
