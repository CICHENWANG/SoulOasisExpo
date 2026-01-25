package com.equestria.sosd_blog.Configure;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    @Value("${soul.auth-bypass:false}")
    private boolean authBypass;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        if (authBypass) {
            return;
        }

        registry.addInterceptor(new SaInterceptor(handler -> {
                    String token = SaHolder.getRequest().getHeader("satoken");
                    if ("dev".equals(token)) {
                        return;
                    }
                    StpUtil.checkLogin();
                }))
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/ai/chat",
                        "/ai/chat/**",
                        "/user/doLogin",
                        "/user/doLogin/**",
                        "/user/register",
                        "/user/register/**",
                        "/user/passwordReset/request",
                        "/user/passwordReset/request/**",
                        "/user/passwordReset/confirm",
                        "/user/passwordReset/confirm/**",
                        "/error",
                        "/error/**"
                );
    }
}



