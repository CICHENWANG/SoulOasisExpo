package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Users {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String phone;
    private String avatar;
    private String bio;
    private Long followerCount;
    private Long followingCount;
    private Long articleCount;
    private Long favoriteCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String permission;
    private String role;
    private String status;
}
