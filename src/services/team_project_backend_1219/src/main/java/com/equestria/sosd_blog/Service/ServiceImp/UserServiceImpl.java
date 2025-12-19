package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.ChangePasswordDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.UserService;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.LambdaCheckerUtils;
import com.equestria.sosd_blog.Utils.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final IdGeneratorUtils idGeneratorUtils;
    private final StringRedisTemplate stringRedisTemplate;
    private final PasswordUtils passwordUtils;
    private final LambdaCheckerUtils lambdaCheckerUtils;

    @Override
    public String register(RegisterDTO registerDTO) {
        String password = registerDTO.getPassword();

        try {
            // 校验手机号
            if (!lambdaCheckerUtils.isValidPhone(registerDTO.getPhone())) {
                throw new IllegalArgumentException("手机号不合法");
            }

            // 校验邮箱
            if (!lambdaCheckerUtils.isValidEmail(registerDTO.getEmail())) {
                throw new IllegalArgumentException("邮箱不合法");
            }

            //校验用户名
            if (!lambdaCheckerUtils.isValidUsername(registerDTO.getUsername())) {
                throw new IllegalArgumentException("用户名不合法");
            }

            //校验密码
            if (!lambdaCheckerUtils.isValidPw(password)) {
                throw new IllegalArgumentException("密码不合法");
            }

            String hashPw = passwordUtils.hash(password);
            registerDTO.setPassword(hashPw);

            String userId = idGeneratorUtils.generateId("user");
            registerDTO.setId(userId);

            userMapper.registor(registerDTO);
            return userId;

        } catch (IllegalArgumentException e) {
            // 业务校验失败
            throw new RuntimeException("注册失败: " + e.getMessage(), e);
        } catch (Exception e) {
            // 兜底异常
            throw new RuntimeException("系统异常，请稍后重试", e);
        }


    }

    @Override
    public MyInfoVO getMyInfo() {
        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();
        MyInfoVO myInfoVO= userMapper.getUserInfoByUserId(userId);
        myInfoVO.setUserId(userId);
        return myInfoVO;

    }

    @Override
    public void updateInfo(UpdateInfoDTO updateInfoDTO) {
        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();

        try {


            if (!userId.equals(updateInfoDTO.getUserId())){
               throw new IllegalArgumentException("用户身份异常");
            }

            // 校验手机号
            if (!lambdaCheckerUtils.isValidPhone(updateInfoDTO.getPhone())) {
                throw new IllegalArgumentException("手机号不合法");
            }

            // 校验邮箱
            if (!lambdaCheckerUtils.isValidEmail(updateInfoDTO.getEmail())) {
                throw new IllegalArgumentException("邮箱不合法");
            }

            //校验用户名
            if (!lambdaCheckerUtils.isValidUsername(updateInfoDTO.getUsername())) {
                throw new IllegalArgumentException("用户名不合法");
            }


            userMapper.updateInfo(updateInfoDTO);

        } catch (IllegalArgumentException e) {
            // 业务校验失败
            throw new RuntimeException("注册失败: " + e.getMessage(), e);
        } catch (Exception e) {
            // 兜底异常
            throw new RuntimeException("系统异常，请稍后重试", e);
        }
    }

    @Override
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        String newPassword = changePasswordDTO.getNewPassword();
        String oldPassword = changePasswordDTO.getOldPassword();
        StpUtil.checkLogin();
        Long userId1 = StpUtil.getLoginIdAsLong();
        Long userId2 = changePasswordDTO.getUserId();

        if (!userId1.equals(userId2)) {
            throw new IllegalArgumentException("用户身份异常");
        }

        if (!lambdaCheckerUtils.isValidPw(newPassword)) {
            throw new IllegalArgumentException("密码不合法");
        }

        String oldHashPw = userMapper.getPwByUserId(userId1);

        if (passwordUtils.check(oldPassword, oldHashPw)) {
            String newHashPw = passwordUtils.hash(newPassword);
            userMapper.changePassword(userId1,newHashPw);
        } else {
            throw new IllegalArgumentException("原密码不正确");
        }


    }


}




