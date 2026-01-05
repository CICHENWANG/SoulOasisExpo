package com.equestria.sosd_blog.Configure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${REDIS_HOST:localhost}")
    private String host;

    @Value("${REDIS_PORT:6379}")
    private int port;

    @Value("${REDIS_PASSWORD:}")
    private String password;


    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        //配置redis的连接工厂,当然也可以不用写在这里而直接在yml中配置,然后由spring自动创建并注册到spring容器中
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration();
        configuration.setHostName(host);
        configuration.setPort(port);
        if (password != null && !password.isBlank()) {
            configuration.setPassword(password);
        }
        return new JedisConnectionFactory(configuration);
    }



    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        //指定redis储存的数据为: 键为string类型,值为object类型然后由自定义序列化器进行序列化和反序列化
        template.setConnectionFactory(connectionFactory);
        //设置redis的连接工厂,从而使RedisTemplate通过RedisConnectionFactory的配置信息连接上redis服务
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = new GenericJackson2JsonRedisSerializer();
        //指定jackson序列化器,允许把java对象转换为json格式
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        //设置value使用GenericJackson2JsonRedisSerializer,将Java对象序列化为JSON格式
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        //设置key使用utf-8储存
        return template;
    }


}