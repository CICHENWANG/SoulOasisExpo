package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class PasswordResetConfirmDTO {
    private String email;
    private String code;
    private String newPassword;
}
