package com.equestria.sosd_blog.Domain.DTO;

import lombok.Data;

@Data
public class RegisterDTO {
    private String id;
    private String username;
    private String password;
    private String email;
    private String phone;
}
