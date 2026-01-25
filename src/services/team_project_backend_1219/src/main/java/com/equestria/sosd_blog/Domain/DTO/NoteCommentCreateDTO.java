package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class NoteCommentCreateDTO {
    private String id;
    private String noteId;
    private String userId;
    private String author;
    private String content;
}
