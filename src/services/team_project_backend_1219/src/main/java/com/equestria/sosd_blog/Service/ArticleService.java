package com.equestria.sosd_blog.Service;

import com.equestria.sosd_blog.Domain.DTO.ArticlePostDTO;

import java.io.IOException;

public interface ArticleService {
    String postArticleText(ArticlePostDTO articlePostDTO);
    String postArticleFile(ArticlePostDTO articlePostDTO) throws IOException;
}
