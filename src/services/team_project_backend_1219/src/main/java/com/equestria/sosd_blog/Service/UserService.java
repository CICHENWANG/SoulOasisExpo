package com.equestria.sosd_blog.Service;


import com.equestria.sosd_blog.Domain.DTO.ChangePasswordDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetConfirmDTO;
import com.equestria.sosd_blog.Domain.DTO.PasswordResetRequestDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;

import java.util.Map;

public interface UserService {

    String register(RegisterDTO registerDTO);

    MyInfoVO getMyInfo();

    void updateInfo(UpdateInfoDTO updateInfoDTO);

    void changePassword(ChangePasswordDTO changePasswordDTO);

    Map<String, Object> requestPasswordReset(PasswordResetRequestDTO passwordResetRequestDTO);

    void confirmPasswordReset(PasswordResetConfirmDTO passwordResetConfirmDTO);
}
