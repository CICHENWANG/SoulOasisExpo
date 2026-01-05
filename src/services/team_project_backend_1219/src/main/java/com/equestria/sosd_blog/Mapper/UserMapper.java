package com.equestria.sosd_blog.Mapper;


import com.equestria.sosd_blog.Domain.DTO.LoginDTO;
import com.equestria.sosd_blog.Domain.DTO.RegisterDTO;
import com.equestria.sosd_blog.Domain.DTO.UpdateInfoDTO;
import com.equestria.sosd_blog.Domain.VO.MyInfoVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {


    void registor(RegisterDTO registerDTO);

    String getPwByEmail(@Param("email") String email);

    Long getUserIdByEmail(@Param("email") String email);

    String getPwByUsername(@Param("username") String username);

    String getPwByUserId(@Param("userId") Long userId);

    Long getUserIdByUsername(@Param("username") String username);

    MyInfoVO getUserInfoByUserId(Long userId);

    void updateInfo(UpdateInfoDTO updateInfoDTO);

    void changePassword(@Param("userId") Long userId, @Param("newHashPw") String newHashPw);
}
