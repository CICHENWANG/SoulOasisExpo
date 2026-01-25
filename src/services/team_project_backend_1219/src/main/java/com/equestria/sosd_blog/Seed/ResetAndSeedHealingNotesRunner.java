package com.equestria.sosd_blog.Seed;

import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Mapper.NoteMapper;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class ResetAndSeedHealingNotesRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final NoteMapper noteMapper;
    private final MarkdownUtils markdownUtils;
    private final IdGeneratorUtils idGeneratorUtils;

    @Value("${soul.migrate.reset-and-seed-healing-notes.enabled:false}")
    private boolean enabled;

    @Value("${soul.migrate.reset-and-seed-healing-notes.target:200}")
    private int target;

    @Value("${soul.migrate.reset-and-seed-healing-notes.author:Soul Oasis}" )
    private String author;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        int tgt = Math.max(1, target);
        String seededAuthor = author == null || author.isBlank() ? "Soul Oasis" : author.trim();

        System.out.println("[ResetAndSeedHealingNotesRunner] start. target=" + tgt);

        int deletedComments = jdbcTemplate.update("delete from note_comments");
        int deletedNotes = jdbcTemplate.update("delete from notes");
        System.out.println("[ResetAndSeedHealingNotesRunner] deleted notes=" + deletedNotes + ", comments=" + deletedComments);

        String[] themes = new String[]{
                "Breathing & Relaxation",
                "Grounding for Anxiety",
                "Sleep Recovery",
                "Self-Compassion",
                "Emotional Regulation",
                "Cognitive Reframing",
                "Stress Reset",
                "Boundaries & Relationships",
                "Mindfulness Practice",
                "Daily Micro-Habits"
        };

        String[] openings = new String[]{
                "If today feels heavy, let’s make it 10% lighter.",
                "You don’t need to fix everything right now.",
                "This is a small practice to help you feel safe again.",
                "Let’s slow down and come back to the present moment.",
                "You are allowed to take up space, even when you are struggling."
        };

        String[] practices = new String[]{
                "4-7-8 breathing (inhale 4, hold 7, exhale 8)",
                "Box breathing (4-4-4-4)",
                "5-4-3-2-1 grounding through the senses",
                "Self-compassion break (acknowledge, normalize, be kind)",
                "Cognitive reframing (one alternative thought)"
        };

        for (int i = 0; i < tgt; i += 1) {
            String noteId = idGeneratorUtils.generateId("note");
            String theme = themes[i % themes.length];
            String opening = openings[ThreadLocalRandom.current().nextInt(openings.length)];
            String practice = practices[ThreadLocalRandom.current().nextInt(practices.length)];

            String coverUrl = "https://picsum.photos/seed/healing-cover-" + noteId + "/800/600";
            String img1 = "https://picsum.photos/seed/healing-detail-" + noteId + "-1/1200/800";
            String img2 = "https://picsum.photos/seed/healing-detail-" + noteId + "-2/1200/800";

            String title = theme + " • " + "Practice #" + (i + 1);

            String markdown = "# " + title + "\n\n"
                    + "> " + opening + "\n\n"
                    + "![Cover](" + img1 + ")\n\n"
                    + "## One-minute reset\n\n"
                    + "Try: **" + practice + "**.\n\n"
                    + "- Put one hand on your chest and notice your breath.\n"
                    + "- Relax your jaw and soften your shoulders.\n"
                    + "- Exhale a little longer than you inhale (3 rounds).\n\n"
                    + "![A quiet moment](" + img2 + ")\n\n"
                    + "## Gentle journaling prompts\n\n"
                    + "1. What am I feeling right now (one word)?\n"
                    + "2. What do I need most right now (rest, support, clarity, kindness)?\n"
                    + "3. What is one small action I can take in the next 10 minutes?\n\n"
                    + "## One alternative thought\n\n"
                    + "- Original thought: \"This will never get better.\"\n"
                    + "- Alternative thought: \"This is hard, but I can take one small step today.\"\n\n"
                    + "---\n\n"
                    + "If you want, leave a comment with:\n\n"
                    + "- One feeling\n"
                    + "- One promise to yourself\n";

            NotePostDTO dto = new NotePostDTO();
            dto.setId(noteId);
            dto.setTitle(title);
            dto.setAuthor(seededAuthor);
            dto.setUserId("1");
            dto.setContentText(markdown);
            dto.setContentHtml(markdownUtils.stringToHtml(markdown));
            dto.setCoverUrl(coverUrl);

            noteMapper.postNote(dto);
        }

        System.out.println("[ResetAndSeedHealingNotesRunner] inserted=" + tgt);
        System.out.println("[ResetAndSeedHealingNotesRunner] exiting (one-time reset + seed)");
        System.exit(0);
    }
}
