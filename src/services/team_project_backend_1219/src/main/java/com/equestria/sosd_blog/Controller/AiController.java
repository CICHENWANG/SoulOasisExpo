package com.equestria.sosd_blog.Controller;

import com.equestria.sosd_blog.Domain.DTO.AiChatMessageDTO;
import com.equestria.sosd_blog.Domain.DTO.AiChatRequestDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin
@RequiredArgsConstructor
public class AiController {

    private final ObjectMapper objectMapper;

    @Value("${soul.ai.api-key:${SOUL_AI_API_KEY:${GROQ_API_KEY:}}}")
    private String aiApiKey;

    @Value("${soul.ai.base-url:https://api.agicto.cn/v1}")
    private String baseUrl;

    @Value("${soul.ai.model:ERNIE-Speed-128K}")
    private String model;

    @PostMapping("/chat")
    public Result<String> chat(@RequestBody AiChatRequestDTO req) {
        if (aiApiKey == null || aiApiKey.isBlank()) {
            return Result.error(500, "AI API key is not configured.");
        }

        Integer stressScore = req == null ? null : req.getStressScore();
        if (stressScore == null) stressScore = 0;
        if (stressScore < 0) stressScore = 0;
        if (stressScore > 10) stressScore = 10;

        String mode = req == null ? null : req.getMode();
        if (mode == null || mode.isBlank()) mode = "general";

        List<AiChatMessageDTO> in = req == null ? null : req.getMessages();
        if (in == null) in = new ArrayList<>();

        String system = "You are SoulOasis, a supportive mental wellness assistant. Reply in English." +
                "\nUser stress level (0-10): " + stressScore + "." +
                "\nChat mode: " + mode + "." +
                "\nPlease respond with: 1 empathetic sentence + 1-3 actionable suggestions + 1 follow-up question.";

        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> sys = new HashMap<>();
        sys.put("role", "system");
        sys.put("content", system);
        messages.add(sys);

        int start = Math.max(0, in.size() - 16);
        for (int i = start; i < in.size(); i += 1) {
            AiChatMessageDTO m = in.get(i);
            if (m == null) continue;
            String role = m.getRole();
            String content = m.getContent();
            if (role == null || role.isBlank() || content == null || content.isBlank()) continue;
            Map<String, Object> item = new HashMap<>();
            item.put("role", role);
            item.put("content", content);
            messages.add(item);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + aiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String url = baseUrl.replaceAll("/$", "") + "/chat/completions";
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                return Result.error(500, "AI request failed: status " + resp.getStatusCodeValue());
            }

            String raw = resp.getBody();
            if (raw == null || raw.isBlank()) {
                return Result.error(500, "AI response is empty");
            }

            JsonNode root = objectMapper.readTree(raw);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            String reply = content.isMissingNode() ? null : content.asText();
            if (reply == null || reply.isBlank()) {
                return Result.error(500, "AI response content is empty");
            }

            return Result.success(200, "OK", reply);
        } catch (Exception e) {
            return Result.error(500, "AI request error: " + e.getMessage());
        }
    }
}
