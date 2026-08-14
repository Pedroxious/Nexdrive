package br.com.unipaulistana.rentacar.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedMemberDto {
    private Long id;
    private String name;
    private String avatarUrl;
    private String roleTag;
    private int postCount;
    private int commentCount;
}
