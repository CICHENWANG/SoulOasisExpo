package Model.mcp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolDef {
    private String name;
    private String description;
    private Map<String,Object> inputSchema;

    public static ToolDef of(String name, String desc, Map<String,Object> schema) {
        return ToolDef.builder().name(name).description(desc).inputSchema(schema).build();
    }
}
