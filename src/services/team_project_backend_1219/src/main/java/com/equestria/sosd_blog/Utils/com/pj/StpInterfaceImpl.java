package com.equestria.sosd_blog.Utils.com.pj;

import cn.dev33.satoken.model.wrapperInfo.SaDisableWrapperInfo;
import cn.dev33.satoken.stp.StpInterface;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StpInterfaceImpl implements StpInterface {

    //自定义方法, 获取指定用户的权限列表
    @Override
    public List<String> getPermissionList(Object o, String s) {
        return List.of();
    }


    //自定义方法, 获取指定用户的角色列表
    @Override
    public List<String> getRoleList(Object o, String s) {
        return List.of();
    }


}
