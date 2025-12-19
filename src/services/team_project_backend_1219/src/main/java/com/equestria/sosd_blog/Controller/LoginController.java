package com.equestria.sosd_blog.Controller;


import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.equestria.sosd_blog.Domain.DTO.LoginDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import com.equestria.sosd_blog.Service.LoginService;
import com.equestria.sosd_blog.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    //用户登录
    @RequestMapping("/doLogin")
    public SaResult login(@RequestBody LoginDTO loginDTO) {

        return loginService.doLogin(loginDTO);
    }

    @RequestMapping("/logout")
    public SaResult logout() {
        if (StpUtil.isLogin()) {
            StpUtil.logout();
            return SaResult.ok("用户退出登录成功");
        }
        return SaResult.error("用户未登录，无需登出");

    }




}
