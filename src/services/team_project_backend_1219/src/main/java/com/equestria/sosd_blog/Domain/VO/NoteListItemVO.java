package com.equestria.sosd_blog.Domain.VO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteListItemVO {
    private String id;
    private String title;
    private String author;
    private String coverUrl;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createTime;
}
