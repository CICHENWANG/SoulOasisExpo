package com.equestria.sosd_blog.Service;

import com.equestria.sosd_blog.Domain.DTO.NoteCommentPostDTO;
import com.equestria.sosd_blog.Domain.DTO.NotePostDTO;
import com.equestria.sosd_blog.Domain.VO.NoteCommentVO;
import com.equestria.sosd_blog.Domain.VO.NoteDetailVO;
import com.equestria.sosd_blog.Domain.VO.NoteListVO;

import java.util.List;

public interface NoteService {
    String postNoteText(NotePostDTO notePostDTO);

    NoteListVO listNotes(Integer page, Integer pageSize, String keyword);

    NoteDetailVO getNoteDetail(String noteId);

    List<NoteCommentVO> listComments(String noteId, Integer page, Integer pageSize);

    String postComment(NoteCommentPostDTO noteCommentPostDTO);
}
