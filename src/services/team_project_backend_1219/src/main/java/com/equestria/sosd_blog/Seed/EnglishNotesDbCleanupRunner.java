package com.equestria.sosd_blog.Seed;

import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class EnglishNotesDbCleanupRunner implements ApplicationRunner {

    private static final Pattern CJK = Pattern.compile("[\\u4e00-\\u9fff]");

    private final JdbcTemplate jdbcTemplate;
    private final MarkdownUtils markdownUtils;

    @Value("${soul.migrate.english-notes-cleanup.enabled:false}")
    private boolean enabled;

    @Value("${soul.migrate.english-notes-cleanup.dry-run:true}")
    private boolean dryRun;

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

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        System.out.println("[EnglishNotesDbCleanupRunner] start. dryRun=" + dryRun);

        int notesUpdated = cleanupNotes();
        int commentsUpdated = cleanupNoteComments();

        System.out.println("[EnglishNotesDbCleanupRunner] done. notesUpdated=" + notesUpdated + ", commentsUpdated=" + commentsUpdated);

        System.out.println("[EnglishNotesDbCleanupRunner] exiting (one-time migration)");
        System.exit(0);
    }

    private int cleanupNotes() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select id, title, content_markdown, content_html, author " +
                        "from notes " +
                        "where status='active'"
        );

        int updated = 0;
        for (Map<String, Object> row : rows) {
            Long id = row.get("id") instanceof Number ? ((Number) row.get("id")).longValue() : null;
            if (id == null) continue;

            String title = row.get("title") == null ? null : String.valueOf(row.get("title"));
            String markdown = row.get("content_markdown") == null ? null : String.valueOf(row.get("content_markdown"));
            String html = row.get("content_html") == null ? null : String.valueOf(row.get("content_html"));
            String author = row.get("author") == null ? null : String.valueOf(row.get("author"));

            boolean needs = containsCjk(title) || containsCjk(markdown) || containsCjk(html) || containsCjk(author);
            if (!needs) continue;

            String cleanedTitle = ensureEnglishOrFallback(title, "Untitled");
            String cleanedAuthor = ensureEnglishOrFallback(author, "User");
            String cleanedMarkdown = ensureEnglishOrFallback(markdown, "Content unavailable.");

            String cleanedHtml;
            try {
                cleanedHtml = markdownUtils.stringToHtml(cleanedMarkdown);
            } catch (Exception e) {
                cleanedHtml = "";
            }

            if (!dryRun) {
                jdbcTemplate.update(
                        "update notes set title=?, author=?, content_markdown=?, content_html=?, update_time=NOW() where id=?",
                        cleanedTitle,
                        cleanedAuthor,
                        cleanedMarkdown,
                        cleanedHtml,
                        id
                );
            }
            updated += 1;
        }

        System.out.println("[EnglishNotesDbCleanupRunner] notes scanned=" + rows.size() + ", notes cleaned=" + updated);
        return updated;
    }

    private int cleanupNoteComments() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select id, author, content " +
                        "from note_comments " +
                        "where status='active'"
        );

        int updated = 0;
        for (Map<String, Object> row : rows) {
            Long id = row.get("id") instanceof Number ? ((Number) row.get("id")).longValue() : null;
            if (id == null) continue;

            String author = row.get("author") == null ? null : String.valueOf(row.get("author"));
            String content = row.get("content") == null ? null : String.valueOf(row.get("content"));

            boolean needs = containsCjk(author) || containsCjk(content);
            if (!needs) continue;

            String cleanedAuthor = ensureEnglishOrFallback(author, "User");
            String cleanedContent = ensureEnglishOrFallback(content, "...");

            if (!dryRun) {
                jdbcTemplate.update(
                        "update note_comments set author=?, content=? where id=?",
                        cleanedAuthor,
                        cleanedContent,
                        id
                );
            }
            updated += 1;
        }

        System.out.println("[EnglishNotesDbCleanupRunner] comments scanned=" + rows.size() + ", comments cleaned=" + updated);
        return updated;
    }
}
