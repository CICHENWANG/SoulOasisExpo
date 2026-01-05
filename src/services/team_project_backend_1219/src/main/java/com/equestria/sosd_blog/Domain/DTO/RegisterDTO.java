package com.equestria.sosd_blog.Domain.DTO;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RegisterDTO {
    private String id;
    @JsonAlias({"displayName"})
    private String username;
    private String password;
    private String email;
    private String phone;
}
