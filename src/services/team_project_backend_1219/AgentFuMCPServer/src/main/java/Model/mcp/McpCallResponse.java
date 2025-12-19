package Model.mcp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class McpCallResponse {
    private Object content;
    private boolean isError;

    public static McpCallResponse ok(Object data) {
        return new McpCallResponse(data, false);
    }

    public static McpCallResponse error(String message) {
        return new McpCallResponse(message, true);
    }
}
