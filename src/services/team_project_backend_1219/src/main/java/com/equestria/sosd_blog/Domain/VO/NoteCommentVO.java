package com.equestria.sosd_blog.Domain.VO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteCommentVO {
    private String id;
    private String noteId;
    private String userId;
    private String author;
    private String content;
    private LocalDateTime createTime;
}
