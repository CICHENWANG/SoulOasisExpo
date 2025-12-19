package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.equestria.sosd_blog.Domain.DTO.LoginDTO;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.LoginService;
import com.equestria.sosd_blog.Utils.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final PasswordUtils passwordUtils;
    private final UserMapper userMapper;

    @Override
    public SaResult doLogin(LoginDTO loginDTO) {
        String password = loginDTO.getPassword();
        String hash_password = userMapper.getPwByUsername(loginDTO.getUsername());

        if (passwordUtils.check(password, hash_password)) {
            Long userId = userMapper.getUserIdByUsername(loginDTO.getUsername());
            StpUtil.login(userId);
            return SaResult.ok("登录成功");
        }

        return SaResult.error("登录失败");

    }


}
