package com.equestria.sosd_blog.Mapper;

import com.equestria.sosd_blog.Domain.DTO.NoteCommentCreateDTO;
import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Domain.VO.NoteCommentVO;
import com.equestria.sosd_blog.Domain.VO.NoteDetailVO;
import com.equestria.sosd_blog.Domain.VO.NoteListItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoteMapper {

    void postNote(NotePostDTO notePostDTO);

    List<NoteListItemVO> listNotes(
            @Param("keyword") String keyword,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit
    );

    NoteDetailVO getNoteDetail(@Param("noteId") String noteId);

    List<NoteCommentVO> listNoteComments(
            @Param("noteId") String noteId,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit
    );

    void addNoteComment(NoteCommentCreateDTO noteCommentCreateDTO);

    void incNoteCommentCount(@Param("noteId") String noteId);

    Integer countActiveNotes();

    int backfillMissingCoverUrls();
}
