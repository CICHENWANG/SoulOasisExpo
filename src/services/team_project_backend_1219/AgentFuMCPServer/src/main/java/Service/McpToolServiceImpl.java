package Service;

import fzu.mayyes.agentfu.pojo.mcp.McpCallRequest;
import fzu.mayyes.agentfu.pojo.mcp.McpCallResponse;
import fzu.mayyes.agentfu.pojo.mcp.ToolDef;
import fzu.mayyes.agentfu.services.ShowCardService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 将 MCP 调用映射到 ShowCardService 的实际业务逻辑
 */
@Service
public class McpToolServiceImpl {

    @Resource
    private ShowCardService showCardService;

    /** 工具列表 */
    public List<ToolDef> listTools() {
        return List.of(
                ToolDef.of("get_notice", "获取教务通知", Map.of(
                        "type","object",
                        "required", List.of("page_num","page_size"),
                        "properties", Map.of(
                                "page_num", Map.of("type","integer","description","页码"),
                                "page_size", Map.of("type","integer","description","每页数量")
                        )
                )),
                ToolDef.of("get_restaurant", "获取餐厅人流信息", Map.of("type","object","properties",Map.of())),
                ToolDef.of("get_schedule", "获取当前周课程表", Map.of("type","object","properties",Map.of())),
                ToolDef.of("get_pass", "获取通行码（type=0通行，1设备）", Map.of(
                        "type","object",
                        "required", List.of("username","type"),
                        "properties", Map.of(
                                "username", Map.of("type","string"),
                                "type", Map.of("type","integer")
                        )
                )),
                ToolDef.of("get_person", "获取学生个人信息", Map.of("type","object","properties",Map.of())),
                ToolDef.of("get_credit", "获取学分完成情况", Map.of("type","object","properties",Map.of()))
        );
    }

    /** 分发调用 */
    public McpCallResponse callTool(McpCallRequest req) {
        String name = req.getName();
        Map<String, Object> args = req.getArguments();

        try {
            return switch (name) {
                case "get_notice" -> {
                    int pageNum = ((Number) args.get("page_num")).intValue();
                    int pageSize = ((Number) args.get("page_size")).intValue();
                    yield McpCallResponse.ok(showCardService.getJwchNotice(pageNum, pageSize));
                }
                case "get_restaurant" -> McpCallResponse.ok(showCardService.getRestaurant());
                case "get_schedule" -> McpCallResponse.ok(showCardService.getSchedule());
                case "get_pass" -> {
                    String username = (String) args.get("username");
                    int type = ((Number) args.get("type")).intValue();
                    yield McpCallResponse.ok(showCardService.getPass(username, type));
                }
                case "get_person" -> McpCallResponse.ok(showCardService.getPerson());
                case "get_credit" -> McpCallResponse.ok(showCardService.getCredit());
                default -> McpCallResponse.error("Unknown tool: " + name);
            };
        } catch (Exception e) {
            e.printStackTrace();
            return McpCallResponse.error("调用失败：" + e.getMessage());
        }
    }
}
