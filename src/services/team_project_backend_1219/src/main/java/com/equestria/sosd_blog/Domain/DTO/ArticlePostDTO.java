package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ArticlePostDTO {
    private String id;
    private String title;
    private String author;
    private String userId;
    private String contentText;
    private String contentHtml;
    private MultipartFile articleFile;
    private List<String> tags;

}
