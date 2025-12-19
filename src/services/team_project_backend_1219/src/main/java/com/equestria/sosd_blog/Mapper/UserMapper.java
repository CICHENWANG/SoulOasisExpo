package com.equestria.sosd_blog.Mapper;


import com.equestria.sosd_blog.Domain.DTO.LoginDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {


    void registor(RegisterDTO registerDTO);

    String getPwByUsername(String username);

    String getPwByUserId(Long userId);

    Long getUserIdByUsername(String username);

    MyInfoVO getUserInfoByUserId(Long userId);

    void updateInfo(UpdateInfoDTO updateInfoDTO);

    void changePassword(Long userId, String newHashPw);
}
