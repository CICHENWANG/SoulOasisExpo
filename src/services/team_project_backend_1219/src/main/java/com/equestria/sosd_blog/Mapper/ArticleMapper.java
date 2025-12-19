package com.equestria.sosd_blog.Mapper;

import com.equestria.sosd_blog.Domain.DTO.ArticlePostDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArticleMapper {

    void postArticle(ArticlePostDTO articlePostDTO);
}
