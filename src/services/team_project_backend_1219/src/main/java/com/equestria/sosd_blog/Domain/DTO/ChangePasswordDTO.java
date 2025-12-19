package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    Long userId;
    String oldPassword;
    String newPassword;
}
