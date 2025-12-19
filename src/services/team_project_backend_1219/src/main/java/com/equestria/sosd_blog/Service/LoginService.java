package com.equestria.sosd_blog.Service;

import cn.dev33.satoken.util.SaResult;
import com.equestria.sosd_blog.Domain.DTO.LoginDTO;

public interface LoginService {
    SaResult doLogin(LoginDTO loginDTO);
}
