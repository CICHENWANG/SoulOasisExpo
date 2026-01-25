package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class NotePostDTO {
    private String id;
    private String title;
    private String author;
    private String userId;
    private String contentText;
    private String contentHtml;
    private String coverUrl;
}
