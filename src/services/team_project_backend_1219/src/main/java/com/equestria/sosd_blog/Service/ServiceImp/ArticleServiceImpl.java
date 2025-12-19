package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.ArticlePostDTO;
import com.equestria.sosd_blog.Mapper.ArticleMapper;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.ArticleService;
import com.equestria.sosd_blog.Service.UserService;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final IdGeneratorUtils idGeneratorUtils;
    private final ArticleMapper articleMapper;
    private final MarkdownUtils markdownUtils;
    private final UserMapper userMapper;

    @Override
    public String postArticleText(ArticlePostDTO articlePostDTO) {
        String articleId= idGeneratorUtils.generateId("article");
        articlePostDTO.setId(articleId);

        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();

        String username= userMapper.getUserInfoByUserId(userId).getUsername();
        articlePostDTO.setAuthor(username);
        articlePostDTO.setUserId(String.valueOf(userId));

        String contentHtml=markdownUtils.stringToHtml(articlePostDTO.getContentText());
        articlePostDTO.setContentHtml(contentHtml);

        articleMapper.postArticle(articlePostDTO);
        return articleId;
    }


    @Override
    public String postArticleFile(ArticlePostDTO articlePostDTO) throws IOException {

        String contentText=markdownUtils.fileToString(articlePostDTO.getArticleFile());
        articlePostDTO.setContentText(contentText);

        String articleId= idGeneratorUtils.generateId("article");
        articlePostDTO.setId(articleId);

        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();

        String username= userMapper.getUserInfoByUserId(userId).getUsername();
        articlePostDTO.setAuthor(username);
        articlePostDTO.setUserId(String.valueOf(userId));

        String contentHtml=markdownUtils.stringToHtml(articlePostDTO.getContentText());
        articlePostDTO.setContentHtml(contentHtml);

        articleMapper.postArticle(articlePostDTO);
        return articleId;
    }


}
