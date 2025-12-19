package com.equestria.sosd_blog.Configure;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        // 注册 Sa-Token 拦截器，安全版本
        registry.addInterceptor(new SaInterceptor(handler -> {
                    // 先判断当前线程是否有上下文
                    if (SaHolder.getStorage() != null) {
                        StpUtil.checkLogin();
                    }
                }))
                .addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns("/user/doLogin", "/user/register"); // 登录与注册放行
    }
}



