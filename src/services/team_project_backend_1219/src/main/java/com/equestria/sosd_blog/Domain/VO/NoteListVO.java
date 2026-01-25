package com.equestria.sosd_blog.Domain.VO;

import lombok.Data;

import java.util.List;

@Data
public class NoteListVO {
    private Integer page;
    private Integer pageSize;
    private Boolean hasMore;
    private List<NoteListItemVO> items;
}
