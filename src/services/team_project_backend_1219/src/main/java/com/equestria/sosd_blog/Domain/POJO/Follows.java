package com.equestria.sosd_blog.Domain.POJO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Follows {
    private Long id;
    private Long followerId;
    private Long followeeId;
    private LocalDateTime createdTime;
    private String status;
}
