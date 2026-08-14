package br.com.unipaulistana.rentacar.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPageResponseDto {
    private List<ForumTopicResponseDto> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int pageSize;
}
