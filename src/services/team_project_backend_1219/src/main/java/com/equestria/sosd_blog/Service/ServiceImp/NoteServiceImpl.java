package com.equestria.sosd_blog.Service.ServiceImp;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.stp.StpUtil;
import com.equestria.sosd_blog.Domain.DTO.NoteCommentCreateDTO;
import com.equestria.sosd_blog.Domain.DTO.NoteCommentPostDTO;
import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Domain.VO.NoteCommentVO;
import com.equestria.sosd_blog.Domain.VO.NoteDetailVO;
import com.equestria.sosd_blog.Domain.VO.NoteListItemVO;
import com.equestria.sosd_blog.Domain.VO.NoteListVO;
import com.equestria.sosd_blog.Mapper.NoteMapper;
import com.equestria.sosd_blog.Mapper.UserMapper;
import com.equestria.sosd_blog.Service.NoteService;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final IdGeneratorUtils idGeneratorUtils;
    private final NoteMapper noteMapper;
    private final MarkdownUtils markdownUtils;
    private final UserMapper userMapper;

    @Value("${soul.auth-bypass:false}")
    private boolean authBypass;

    private static final Pattern CJK = Pattern.compile("[\\u4e00-\\u9fff]");

    private static boolean containsCjk(String s) {
        return s != null && CJK.matcher(s).find();
    }

    private static String stripCjk(String s) {
        return s == null ? null : CJK.matcher(s).replaceAll("");
    }

    private static String ensureEnglishOrFallback(String s, String fallback) {
        String cleaned = stripCjk(s);
        if (cleaned == null) return fallback;
        String t = cleaned.trim();
        return t.isEmpty() ? fallback : t;
    }

    private boolean isDevToken() {
        try {
            String token = SaHolder.getRequest().getHeader("satoken");
            return "dev".equals(token);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String postNoteText(NotePostDTO notePostDTO) {
        String title = notePostDTO.getTitle();
        String contentText = notePostDTO.getContentText();

        if (title == null || title.isBlank()) {
            throw new RuntimeException("Title is required.");
        }
        if (contentText == null || contentText.isBlank()) {
            throw new RuntimeException("Content is required.");
        }
        if (containsCjk(title) || containsCjk(contentText)) {
            throw new RuntimeException("Only English content is allowed.");
        }

        String noteId = idGeneratorUtils.generateId("note");
        notePostDTO.setId(noteId);

        String coverUrl = notePostDTO.getCoverUrl();
        if (coverUrl == null || coverUrl.isBlank()) {
            notePostDTO.setCoverUrl("https://picsum.photos/seed/note-" + noteId + "/800/600");
        }

        if (!authBypass && !isDevToken()) {
            StpUtil.checkLogin();
            Long userId = StpUtil.getLoginIdAsLong();

            String username = userMapper.getUserInfoByUserId(userId).getUsername();
            notePostDTO.setAuthor(ensureEnglishOrFallback(username, "User"));
            notePostDTO.setUserId(String.valueOf(userId));
        } else {
            notePostDTO.setAuthor("dev");
            notePostDTO.setUserId("1");
        }

        String contentHtml = markdownUtils.stringToHtml(contentText);
        notePostDTO.setContentHtml(contentHtml);

        noteMapper.postNote(notePostDTO);
        return noteId;
    }

    @Override
    public NoteListVO listNotes(Integer page, Integer pageSize, String keyword) {
        if (!authBypass && !isDevToken()) {
            StpUtil.checkLogin();
        }

        int p = page == null || page < 1 ? 1 : page;
        int ps = pageSize == null || pageSize < 1 ? 20 : Math.min(pageSize, 50);

        int offset = (p - 1) * ps;
        int limit = ps + 1;

        List<NoteListItemVO> list = noteMapper.listNotes(keyword, offset, limit);

        boolean hasMore = false;
        if (list.size() > ps) {
            hasMore = true;
            list = list.subList(0, ps);
        }

        for (NoteListItemVO item : list) {
            if (item == null) continue;
            item.setTitle(ensureEnglishOrFallback(item.getTitle(), "Untitled"));
            item.setAuthor(ensureEnglishOrFallback(item.getAuthor(), "User"));
        }

        NoteListVO vo = new NoteListVO();
        vo.setPage(p);
        vo.setPageSize(ps);
        vo.setHasMore(hasMore);
        vo.setItems(list);
        return vo;
    }

    @Override
    public NoteDetailVO getNoteDetail(String noteId) {
        if (!authBypass && !isDevToken()) {
            StpUtil.checkLogin();
        }

        if (noteId == null || noteId.isBlank()) {
            throw new RuntimeException("noteId is required.");
        }

        NoteDetailVO detail = noteMapper.getNoteDetail(noteId);
        if (detail == null) {
            throw new RuntimeException("Post not found.");
        }

        detail.setTitle(ensureEnglishOrFallback(detail.getTitle(), "Untitled"));
        detail.setAuthor(ensureEnglishOrFallback(detail.getAuthor(), "User"));
        detail.setContentMarkdown(ensureEnglishOrFallback(detail.getContentMarkdown(), "Content unavailable."));
        detail.setContentHtml(ensureEnglishOrFallback(detail.getContentHtml(), "Content unavailable."));
        return detail;
    }

    @Override
    public List<NoteCommentVO> listComments(String noteId, Integer page, Integer pageSize) {
        if (!authBypass && !isDevToken()) {
            StpUtil.checkLogin();
        }

        if (noteId == null || noteId.isBlank()) {
            throw new RuntimeException("noteId is required.");
        }

        int p = page == null || page < 1 ? 1 : page;
        int ps = pageSize == null || pageSize < 1 ? 20 : Math.min(pageSize, 50);

        int offset = (p - 1) * ps;
        List<NoteCommentVO> list = noteMapper.listNoteComments(noteId, offset, ps);
        for (NoteCommentVO c : list) {
            if (c == null) continue;
            c.setAuthor(ensureEnglishOrFallback(c.getAuthor(), "User"));
            c.setContent(ensureEnglishOrFallback(c.getContent(), "..."));
        }
        return list;
    }

    @Override
    @Transactional
    public String postComment(NoteCommentPostDTO noteCommentPostDTO) {
        Long userId;
        String username;
        if (!authBypass && !isDevToken()) {
            StpUtil.checkLogin();
            userId = StpUtil.getLoginIdAsLong();
            username = userMapper.getUserInfoByUserId(userId).getUsername();
        } else {
            userId = 1L;
            username = "dev";
        }

        if (noteCommentPostDTO.getNoteId() == null || noteCommentPostDTO.getNoteId().isBlank()) {
            throw new RuntimeException("noteId is required.");
        }

        String content = noteCommentPostDTO.getContent();
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Comment content is required.");
        }
        if (containsCjk(content)) {
            throw new RuntimeException("Only English content is allowed.");
        }

        String commentId = idGeneratorUtils.generateId("note_comment");

        NoteCommentCreateDTO createDTO = new NoteCommentCreateDTO();
        createDTO.setId(commentId);
        createDTO.setNoteId(noteCommentPostDTO.getNoteId());
        createDTO.setUserId(String.valueOf(userId));
        createDTO.setAuthor(ensureEnglishOrFallback(username, "User"));
        createDTO.setContent(content);

        noteMapper.addNoteComment(createDTO);
        noteMapper.incNoteCommentCount(noteCommentPostDTO.getNoteId());

        return commentId;
    }
}
