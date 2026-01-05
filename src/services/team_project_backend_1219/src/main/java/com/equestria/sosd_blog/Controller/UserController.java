package com.equestria.sosd_blog.Controller;

import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.ChangePasswordDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import com.equestria.sosd_blog.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@CrossOrigin
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<String> register(@RequestBody RegisterDTO registerDTO) {
        String userId = userService.register(registerDTO);
        return Result.success(200,"注册成功",userId);
    }

    @RequestMapping("/getMyInfo")
    public Result<MyInfoVO>  getMyInfo() {
        return Result.success(200,"用户信息如下: ",userService.getMyInfo());
    }

    @RequestMapping("/updateInfo")
    public Result update(@RequestBody UpdateInfoDTO updateInfoDTO) {
        userService.updateInfo(updateInfoDTO);
        return Result.success(200,"更新成功",null);
    }

    @RequestMapping("/changePassword")
    public Result changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        userService.changePassword(changePasswordDTO);
        return Result.success(200,"修改成功",null);
    }




}
