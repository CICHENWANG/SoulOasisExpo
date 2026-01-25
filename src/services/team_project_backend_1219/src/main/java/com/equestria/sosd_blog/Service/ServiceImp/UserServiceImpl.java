package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.ChangePasswordDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetConfirmDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetRequestDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.UserService;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.LambdaCheckerUtils;
import com.equestria.sosd_blog.Utils.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final IdGeneratorUtils idGeneratorUtils;
    private final PasswordUtils passwordUtils;
    private final LambdaCheckerUtils lambdaCheckerUtils;

    private static final long PASSWORD_RESET_EXPIRE_MILLIS = 10 * 60 * 1000L;

    private static final Pattern CJK = Pattern.compile("[\\u4e00-\\u9fff]");

    private static boolean containsCjk(String s) {
        return s != null && CJK.matcher(s).find();
    }

    private static String stripCjk(String s) {
        return s == null ? null : CJK.matcher(s).replaceAll("");
    }

    private static String ensureEnglishOrFallback(String s, String fallback) {
        String cleaned = stripCjk(s);
        if (cleaned == null) return fallback;
        String t = cleaned.trim();
        return t.isEmpty() ? fallback : t;
    }

    private final Map<String, PasswordResetEntry> passwordResetCodes = new ConcurrentHashMap<>();

    private static class PasswordResetEntry {
        private final String code;
        private final long expireAt;

        private PasswordResetEntry(String code, long expireAt) {
            this.code = code;
            this.expireAt = expireAt;
        }
    }

    @Override
    public String register(RegisterDTO registerDTO) {
        String password = registerDTO.getPassword();

        try {
            // 校验手机号
            if (registerDTO.getPhone() != null && !registerDTO.getPhone().isBlank()) {
                if (!lambdaCheckerUtils.isValidPhone(registerDTO.getPhone())) {
                    throw new IllegalArgumentException("Invalid phone number");
                }
            }

            // 校验邮箱
            if (!lambdaCheckerUtils.isValidEmail(registerDTO.getEmail())) {
                throw new IllegalArgumentException("Invalid email");
            }

            //校验用户名
            if (!lambdaCheckerUtils.isValidUsername(registerDTO.getUsername())) {
                throw new IllegalArgumentException("Invalid username");
            }

            //校验密码
            if (!lambdaCheckerUtils.isValidPw(password)) {
                throw new IllegalArgumentException("Invalid password");
            }

            String hashPw = passwordUtils.hash(password);
            registerDTO.setPassword(hashPw);

            String userId = idGeneratorUtils.generateId("user");
            registerDTO.setId(userId);

            userMapper.registor(registerDTO);
            return userId;

        } catch (IllegalArgumentException e) {
            // 业务校验失败
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        } catch (Exception e) {
            // 兜底异常
            throw new RuntimeException("Server error. Please try again later.", e);
        }


    }

    @Override
    public MyInfoVO getMyInfo() {
        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();
        MyInfoVO myInfoVO = userMapper.getUserInfoByUserId(userId);
        if (myInfoVO == null) {
            throw new RuntimeException("User not found");
        }
        myInfoVO.setUserId(userId);
        myInfoVO.setUsername(ensureEnglishOrFallback(myInfoVO.getUsername(), "User"));
        myInfoVO.setBio(ensureEnglishOrFallback(myInfoVO.getBio(), ""));
        return myInfoVO;

    }

    @Override
    public void updateInfo(UpdateInfoDTO updateInfoDTO) {
        StpUtil.checkLogin();
        Long userId = StpUtil.getLoginIdAsLong();

        try {


            if (!userId.equals(updateInfoDTO.getUserId())){
               throw new IllegalArgumentException("Invalid user");
            }

            // 校验手机号
            if (!lambdaCheckerUtils.isValidPhone(updateInfoDTO.getPhone())) {
                throw new IllegalArgumentException("Invalid phone number");
            }

            // 校验邮箱
            if (!lambdaCheckerUtils.isValidEmail(updateInfoDTO.getEmail())) {
                throw new IllegalArgumentException("Invalid email");
            }

            //校验用户名
            if (!lambdaCheckerUtils.isValidUsername(updateInfoDTO.getUsername())) {
                throw new IllegalArgumentException("Invalid username");
            }

            if (containsCjk(updateInfoDTO.getBio())) {
                throw new IllegalArgumentException("Only English content is allowed.");
            }


            userMapper.updateInfo(updateInfoDTO);

        } catch (IllegalArgumentException e) {
            // 业务校验失败
            throw new RuntimeException("Update failed: " + e.getMessage(), e);
        } catch (Exception e) {
            // 兜底异常
            throw new RuntimeException("Server error. Please try again later.", e);
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
            throw new IllegalArgumentException("Invalid user");
        }

        if (!lambdaCheckerUtils.isValidPw(newPassword)) {
            throw new IllegalArgumentException("Invalid password");
        }

        String oldHashPw = userMapper.getPwByUserId(userId1);

        if (passwordUtils.check(oldPassword, oldHashPw)) {
            String newHashPw = passwordUtils.hash(newPassword);
            userMapper.changePassword(userId1,newHashPw);
        } else {
            throw new IllegalArgumentException("Incorrect old password");
        }


    }

    @Override
    public Map<String, Object> requestPasswordReset(PasswordResetRequestDTO passwordResetRequestDTO) {
        String email = passwordResetRequestDTO == null ? null : passwordResetRequestDTO.getEmail();
        if (!lambdaCheckerUtils.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email");
        }

        String hashPassword = userMapper.getPwByEmail(email);
        if (hashPassword == null) {
            throw new IllegalArgumentException("User not found");
        }

        String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expireAt = System.currentTimeMillis() + PASSWORD_RESET_EXPIRE_MILLIS;
        passwordResetCodes.put(email, new PasswordResetEntry(code, expireAt));

        Map<String, Object> data = new HashMap<>();
        data.put("code", code);
        data.put("expireSeconds", PASSWORD_RESET_EXPIRE_MILLIS / 1000);
        return data;
    }

    @Override
    public void confirmPasswordReset(PasswordResetConfirmDTO passwordResetConfirmDTO) {
        String email = passwordResetConfirmDTO == null ? null : passwordResetConfirmDTO.getEmail();
        String code = passwordResetConfirmDTO == null ? null : passwordResetConfirmDTO.getCode();
        String newPassword = passwordResetConfirmDTO == null ? null : passwordResetConfirmDTO.getNewPassword();

        if (!lambdaCheckerUtils.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Code is required");
        }
        if (!lambdaCheckerUtils.isValidPw(newPassword)) {
            throw new IllegalArgumentException("Invalid password");
        }

        PasswordResetEntry entry = passwordResetCodes.get(email);
        if (entry == null) {
            throw new IllegalArgumentException("Please request a code first");
        }
        if (System.currentTimeMillis() > entry.expireAt) {
            passwordResetCodes.remove(email);
            throw new IllegalArgumentException("Code expired");
        }
        if (!entry.code.equals(code)) {
            throw new IllegalArgumentException("Invalid code");
        }

        Long userId = userMapper.getUserIdByEmail(email);
        if (userId == null) {
            throw new IllegalArgumentException("User not found");
        }

        String newHashPw = passwordUtils.hash(newPassword);
        userMapper.changePassword(userId, newHashPw);
        passwordResetCodes.remove(email);
    }


}




