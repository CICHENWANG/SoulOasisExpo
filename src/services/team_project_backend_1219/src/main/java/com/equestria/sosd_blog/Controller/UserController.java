package com.equestria.sosd_blog.Controller;

import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.ChangePasswordDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetConfirmDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetRequestDTO;
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

import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<String> register(@RequestBody RegisterDTO registerDTO) {
        String userId = userService.register(registerDTO);
        return Result.success(200,"Registered",userId);
    }

    @RequestMapping("/getMyInfo")
    public Result<MyInfoVO>  getMyInfo() {
        return Result.success(200,"OK",userService.getMyInfo());
    }

    @RequestMapping("/updateInfo")
    public Result update(@RequestBody UpdateInfoDTO updateInfoDTO) {
        userService.updateInfo(updateInfoDTO);
        return Result.success(200,"Updated",null);
    }

    @RequestMapping("/changePassword")
    public Result changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        userService.changePassword(changePasswordDTO);
        return Result.success(200,"Password changed",null);
    }

    @PostMapping("/passwordReset/request")
    public Result<Map<String, Object>> requestPasswordReset(
            @RequestBody PasswordResetRequestDTO passwordResetRequestDTO
    ) {
        return Result.success(200, "Code generated", userService.requestPasswordReset(passwordResetRequestDTO));
    }

    @PostMapping("/passwordReset/confirm")
    public Result<String> confirmPasswordReset(
            @RequestBody PasswordResetConfirmDTO passwordResetConfirmDTO
    ) {
        userService.confirmPasswordReset(passwordResetConfirmDTO);
        return Result.success(200, "Password reset", "OK");
    }




}
