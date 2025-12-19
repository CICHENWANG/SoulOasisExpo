package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FavoriteFolders {
    private Long id;
    private Long userId;
    private String folderName;
    private String folderType;
    private Long favoriteCount;
    private LocalDateTime createTime;
}
