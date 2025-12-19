package fzu.mayyes.agentfu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fzu.mayyes.agentfu.pojo.mcp.McpCallRequest;
import fzu.mayyes.agentfu.pojo.mcp.McpCallResponse;
import fzu.mayyes.agentfu.pojo.mcp.ToolDef;
import fzu.mayyes.agentfu.services.impl.McpToolServiceImpl;
import fzu.mayyes.agentfu.services.impl.McpToolServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * MCP协议层：用于对接阿里云百炼或 ChatGPT
 */
@RestController
@RequestMapping("/mcp")
@RequiredArgsConstructor
public class McpController {

    private final McpToolServiceImpl toolService;
    private final ObjectMapper objectMapper;

    @Value("${spring.application.name:agentfu-mcp}")
    private String serviceName;

    @Value("${spring.application.version:1.0.0}")
    private String serviceVersion;

    /** 列出 MCP 工具 */
    @GetMapping("/tools")
    public ResponseEntity<Map<String, Object>> listTools() {
        List<ToolDef> tools = toolService.listTools();
        return ResponseEntity.ok(Map.of(
                "server", Map.of("name", serviceName, "version", serviceVersion),
                "tools", tools
        ));
    }

    @PostMapping(value = "/call-tool", produces = "text/event-stream")
    public void callToolStream(@Valid @RequestBody McpCallRequest req, HttpServletResponse response) throws IOException {
        response.setContentType("text/event-stream;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        try (PrintWriter writer = response.getWriter()) {
            // 发送处理开始事件
            writer.write("event: message\n");
            writer.write("data: " + objectMapper.writeValueAsString(Map.of("status", "processing")) + "\n\n");
            writer.flush();

            // 调用业务逻辑
            McpCallResponse result = toolService.callTool(req);

            // 发送结果事件
            writer.write("event: result\n");
            writer.write("data: " + objectMapper.writeValueAsString(result) + "\n\n");
            writer.flush();

            // 通知结束
            writer.write("event: end\n\n");
            writer.flush();
        } catch (Exception e) {
            response.getWriter().write("event: error\ndata: " + e.getMessage() + "\n\n");
        }
    }


}
