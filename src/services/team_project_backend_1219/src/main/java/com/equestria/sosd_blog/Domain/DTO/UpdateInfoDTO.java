package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class UpdateInfoDTO {
    Long userId;
    String username;
    String email;
    String phone;
    String avatar;
    String bio;
}
