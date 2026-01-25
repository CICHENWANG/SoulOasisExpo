package com.equestria.sosd_blog.Seed;

import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Mapper.NoteMapper;
import com.equestria.sosd_blog.Utils.IdGeneratorUtils;
import com.equestria.sosd_blog.Utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class HealingNotesSeeder implements ApplicationRunner {

    private final NoteMapper noteMapper;
    private final MarkdownUtils markdownUtils;
    private final IdGeneratorUtils idGeneratorUtils;

    @Value("${soul.seed.healing-notes.enabled:true}")
    private boolean enabled;

    @Value("${soul.seed.healing-notes.target:200}")
    private int target;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        try {
            int updated = noteMapper.backfillMissingCoverUrls();
            if (updated > 0) {
                System.out.println("[HealingNotesSeeder] backfilled cover_url=" + updated);
            }
        } catch (Exception e) {
            System.out.println("[HealingNotesSeeder] cover backfill failed: " + e.getMessage());
        }

        Integer existing;
        try {
            existing = noteMapper.countActiveNotes();
        } catch (Exception e) {
            System.out.println("[HealingNotesSeeder] skip: cannot query notes count: " + e.getMessage());
            return;
        }

        int current = existing == null ? 0 : existing;
        int tgt = Math.max(0, target);
        if (current >= tgt) {
            System.out.println("[HealingNotesSeeder] notes already seeded: current=" + current + ", target=" + tgt);
            return;
        }

        int toInsert = tgt - current;

        String[] themes = new String[]{
                "Breathing & Relaxation",
                "Sleep Recovery",
                "Mindfulness Practice",
                "Self-Acceptance",
                "Emotional First Aid",
                "Relationship Boundaries",
                "Self-Compassion",
                "Stress Management",
                "Cognitive Reframing",
                "Daily Micro-Habits"
        };

        String[] hooks = new String[]{
                "When it feels like you can't hold on, bring your attention back to your breath.",
                "You don't need to feel better immediately - you just need to feel safe first.",
                "Emotions are not the enemy; they are information.",
                "If you can be 1% gentler with yourself today, that's already enough.",
                "You are not the problem - you are going through a problem."
        };

        for (int i = 0; i < toInsert; i += 1) {
            String theme = themes[(current + i) % themes.length];
            int n = current + i + 1;

            String title = String.format("%s - Tip #%d: A small practice for you", theme, n);
            String tip = hooks[ThreadLocalRandom.current().nextInt(0, hooks.length)];

            String markdown = "# " + title + "\n\n"
                    + "> " + tip + "\n\n"
                    + "## 30-second self-soothing\n\n"
                    + "- Place a hand gently on your chest or belly and feel it rise and fall.\n"
                    + "- Breathe in a **4-2-6** rhythm: inhale 4 seconds, hold 2, exhale 6. Repeat 3 rounds.\n"
                    + "- Say to yourself: **I allow this feeling to be here.**\n\n"
                    + "## Three gentle questions\n\n"
                    + "1. What is the strongest feeling in me right now? (No explanation - just name it.)\n"
                    + "2. What is this feeling trying to protect me from?\n"
                    + "3. What is the smallest kind thing I can do for myself right now?\n\n"
                    + "## One alternative thought (cognitive reframing)\n\n"
                    + "- Original thought: \"I'm not doing well enough.\"\n"
                    + "- Alternative thought: \"I'm learning, and I can give myself a little time.\"\n\n"
                    + "## Today's micro-action\n\n"
                    + "- Drink a cup of warm water\n"
                    + "- Stand by a window and look into the distance for 20 seconds\n"
                    + "- Put your phone down for 5 minutes and do a gentle stretch\n\n"
                    + "---\n\n"
                    + "If you want, you can write in the comments:\n\n"
                    + "- My emotion right now (one word)\n"
                    + "- One promise to myself (one sentence)\n";

            NotePostDTO dto = new NotePostDTO();
            dto.setId(idGeneratorUtils.generateId("note"));
            dto.setTitle(title);
            dto.setAuthor("dev");
            dto.setUserId("1");
            dto.setContentText(markdown);
            dto.setContentHtml(markdownUtils.stringToHtml(markdown));
            dto.setCoverUrl("https://picsum.photos/seed/healing-" + dto.getId() + "/800/600");

            try {
                noteMapper.postNote(dto);
            } catch (Exception e) {
                System.out.println("[HealingNotesSeeder] insert failed: " + e.getMessage());
            }
        }

        System.out.println("[HealingNotesSeeder] inserted=" + toInsert + ", total target=" + tgt);
    }
}
