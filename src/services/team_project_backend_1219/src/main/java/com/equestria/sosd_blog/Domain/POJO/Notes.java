package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notes {
    private Long id;
    private Long userId;
    private String title;
    private String contentMarkdown;
    private String contentHtml;
    private String author;
    private String coverUrl;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String status;
}
