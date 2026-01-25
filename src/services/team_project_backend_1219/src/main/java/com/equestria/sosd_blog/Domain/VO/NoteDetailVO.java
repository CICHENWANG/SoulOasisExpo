package com.equestria.sosd_blog.Domain.VO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteDetailVO {
    private String id;
    private String userId;
    private String title;
    private String contentMarkdown;
    private String contentHtml;
    private String author;
    private String coverUrl;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createTime;
}
