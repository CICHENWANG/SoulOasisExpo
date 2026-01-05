package com.equestria.sosd_blog.Utils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class IdGeneratorUtils {
    public String generateId(String keyType) {
        long ts = System.currentTimeMillis();
        int rand = ThreadLocalRandom.current().nextInt(0, 10000);

        long id = ts * 10000L + rand;

        return String.valueOf(id);
        //最终 ID = 时间戳 + 自增序号. 并将自增号补齐至四位, 即1->0001, 12->0012

    }
}
