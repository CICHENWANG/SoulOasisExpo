package com.equestria.sosd_blog.Domain.Exception;

public class LoginException extends Exception {


    public LoginException(String message, Throwable cause) {
        //构造器,用于接收异常描述信息和最原始的异常
        super(message, cause);
    }


    @Override
    public void printStackTrace() {
        //重写打印堆栈跟踪信息方法,调用父类的printStackTrace,从而保留原始的堆栈信息
        super.printStackTrace();
    }

}
