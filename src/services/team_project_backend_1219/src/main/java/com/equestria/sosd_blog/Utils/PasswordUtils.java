package com.equestria.sosd_blog.Utils;

import org.springframework.stereotype.Component;
import org.mindrot.jbcrypt.BCrypt;

@Component
public class PasswordUtils {
    //密码加密
    public String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
    }

    //密码校验
    public boolean check(String plainPassword, String hashed) {
        return BCrypt.checkpw(plainPassword, hashed);
    }

}
