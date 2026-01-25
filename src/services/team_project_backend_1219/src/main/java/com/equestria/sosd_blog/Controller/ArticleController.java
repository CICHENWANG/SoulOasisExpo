package com.equestria.sosd_blog.Controller;


import com.equestria.sosd_blog.Domain.DTO.ArticlePostDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.equestria.sosd_blog.Service.ArticleService;
import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/article")
@RequiredArgsConstructor
public class ArticleController {

    private final MarkdownUtils markdownUtils;
    private final ArticleService articleService;

    @PostMapping("/postArticleText")
    public Result<String> register(@RequestBody ArticlePostDTO articlePostDTO) {
        String articleId = articleService.postArticleText(articlePostDTO);
        return Result.success(200,"Article published successfully",articleId);
    }

    @PostMapping(value = "/postArticleFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<String> postArticleFile(
            @RequestParam("userId") String userId,
            @RequestParam("author") String author,
            @RequestParam("contentFile") MultipartFile contentFile,
            @RequestParam("title") String title,
            @RequestParam("tags") List<String> tags) throws IOException {

        ArticlePostDTO articlePostDTO = new ArticlePostDTO();
        articlePostDTO.setArticleFile(contentFile);
        articlePostDTO.setTitle(title);
        articlePostDTO.setAuthor(author);
        articlePostDTO.setTags(tags);
        articlePostDTO.setUserId(userId);

        String articleId = articleService.postArticleFile(articlePostDTO);
        return Result.success(200,"Article published successfully", articleId);
    }




}
