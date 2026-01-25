package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteComments {
    private Long id;
    private Long noteId;
    private Long userId;
    private String author;
    private String content;
    private LocalDateTime createTime;
    private String status;
}
