package com.equestria.sosd_blog.Utils.GlobalExceptionHandler;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.util.SaResult;
import com.equestria.sosd_blog.Domain.Result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 全局异常拦截（拦截项目中的NotLoginException异常）
    @ExceptionHandler(NotLoginException.class)
    public SaResult handlerNotLoginException(NotLoginException nle)
            throws Exception {

        // 打印堆栈，以供调试
        nle.printStackTrace();

        // 判断场景值，定制化异常信息
        String message = "";
        if(nle.getType().equals(NotLoginException.NOT_TOKEN)) {
            message = "Missing token";
        }
        else if(nle.getType().equals(NotLoginException.INVALID_TOKEN)) {
            message = "Invalid token";
        }
        else if(nle.getType().equals(NotLoginException.TOKEN_TIMEOUT)) {
            message = "Token expired";
        }
        else if(nle.getType().equals(NotLoginException.BE_REPLACED)) {
            message = "Token replaced";
        }
        else if(nle.getType().equals(NotLoginException.KICK_OUT)) {
            message = "Token kicked out";
        }
        else if(nle.getType().equals(NotLoginException.TOKEN_FREEZE)) {
            message = "Token frozen";
        }
        else if(nle.getType().equals(NotLoginException.NO_PREFIX)) {
            message = "Token prefix missing";
        }
        else {
            message = "Not signed in";
        }

        // 返回给前端
        return SaResult.error(message);
    }

    @ExceptionHandler(RuntimeException.class)
    public Result<String> handlerRuntimeException(RuntimeException e) {
        log.error("RuntimeException", e);
        return Result.error(500, e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<String> handlerException(Exception e) {
        log.error("Exception", e);
        return Result.error(500, "Server error. Please try again later.");
    }
}