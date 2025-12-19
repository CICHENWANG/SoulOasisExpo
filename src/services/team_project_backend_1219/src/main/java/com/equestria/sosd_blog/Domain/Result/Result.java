package com.equestria.sosd_blog.Domain.Result;

import lombok.Data;

@Data
public class Result<T>{
    public Integer code;
    public String message;
    public T data;
    //分别为响应状态码,描述信息, 返回数据
    //这里返回数据使用了泛型T,支持了返回数据类型的多样性

    public static<T> Result<T> success(Integer code,String message,T data) {
        Result<T> result=new Result<T>();
        result.setCode(code);
        result.setMessage(message);
        result.setData(data);
        return result;
    }
    //请求成功时,通过Result.success()构造方法,构造并返回一个result给前端(一般还会被转成json格式)

    public static<T> Result<T> error(Integer code,String message) {
        Result<T> result=new Result<T>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
    //与success类似,但是既然是error,就不允许将可能有误或不完整的data给前端

}