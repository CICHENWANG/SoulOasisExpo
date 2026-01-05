package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.equestria.sosd_blog.Domain.DTO.LoginDTO;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.LoginService;
import com.equestria.sosd_blog.Utils.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final PasswordUtils passwordUtils;
    private final UserMapper userMapper;

    @Override
    public SaResult doLogin(LoginDTO loginDTO) {
        String password = loginDTO.getPassword();

        String email = loginDTO.getEmail();
        String hash_password = userMapper.getPwByEmail(email);

        if (hash_password == null) {
            return SaResult.error("用户不存在");
        }

        if (passwordUtils.check(password, hash_password)) {
            Long userId = userMapper.getUserIdByEmail(email);
            StpUtil.login(userId);
            String token = StpUtil.getTokenValue();
            Map<String, Object> data = new HashMap<>();
            data.put("userId", userId);
            data.put("token", token);
            return SaResult.ok("登录成功").setData(data);
        }

        return SaResult.error("登录失败");

    }


}
