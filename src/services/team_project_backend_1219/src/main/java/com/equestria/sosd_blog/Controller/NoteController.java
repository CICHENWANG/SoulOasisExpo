package com.equestria.sosd_blog.Controller;

import com.equestria.sosd_blog.Domain.DTO.NoteCommentPostDTO;
import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Domain.Result.Result;
import com.equestria.sosd_blog.Domain.VO.NoteCommentVO;
import com.equestria.sosd_blog.Domain.VO.NoteDetailVO;
import com.equestria.sosd_blog.Domain.VO.NoteListVO;
import com.equestria.sosd_blog.Service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/note")
@CrossOrigin
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping("/postNoteText")
    public Result<String> postNoteText(@RequestBody NotePostDTO notePostDTO) {
        String noteId = noteService.postNoteText(notePostDTO);
        return Result.success(200, "Post created", noteId);
    }

    @GetMapping("/listNotes")
    public Result<NoteListVO> listNotes(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        return Result.success(200, "OK", noteService.listNotes(page, pageSize, keyword));
    }

    @GetMapping("/getNoteDetail")
    public Result<NoteDetailVO> getNoteDetail(@RequestParam("noteId") String noteId) {
        return Result.success(200, "OK", noteService.getNoteDetail(noteId));
    }

    @GetMapping("/listComments")
    public Result<List<NoteCommentVO>> listComments(
            @RequestParam("noteId") String noteId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "pageSize", required = false) Integer pageSize
    ) {
        return Result.success(200, "OK", noteService.listComments(noteId, page, pageSize));
    }

    @PostMapping("/postComment")
    public Result<String> postComment(@RequestBody NoteCommentPostDTO noteCommentPostDTO) {
        String commentId = noteService.postComment(noteCommentPostDTO);
        return Result.success(200, "Comment created", commentId);
    }
}
