package Model.mcp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class McpCallRequest {
    @NotBlank
    private String name;                     // 工具名
    @NotNull
    private Map<String, Object> arguments;   // 参数
}
