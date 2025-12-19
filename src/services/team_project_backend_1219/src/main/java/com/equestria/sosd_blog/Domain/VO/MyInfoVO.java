package com.equestria.sosd_blog.Domain.VO;

import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data
public class MyInfoVO {
    private Long userId;
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
    private String role;
    private String status;
}
