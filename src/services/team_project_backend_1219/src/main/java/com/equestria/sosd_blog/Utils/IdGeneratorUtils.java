package com.equestria.sosd_blog.Utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class IdGeneratorUtils {

    private final StringRedisTemplate stringRedisTemplate;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String generateId(String keyType) {

        String timestamp = LocalDateTime.now().format(formatter);
        //获取时间戳

        String redisKey = "idgenerator:" + keyType + ":" + timestamp;
        //定义redis数据库中的key

        Long generatedId = stringRedisTemplate.opsForValue().increment(redisKey);
        //设置注册key, 并使value自增

        stringRedisTemplate.expire(redisKey, java.time.Duration.ofSeconds(5));
        //设置value过期时间为2秒

        return timestamp + String.format("%04d", generatedId);
        //最终 ID = 时间戳 + 自增序号. 并将自增号补齐至四位, 即1->0001, 12->0012

    }
}
