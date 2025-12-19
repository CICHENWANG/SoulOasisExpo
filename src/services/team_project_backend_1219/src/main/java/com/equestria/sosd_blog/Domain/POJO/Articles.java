package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Articles {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String author;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Long viewCount;
    private Long likeCount;
    private Long clickCount;
    private Long commentCount;
    private String status;
}
