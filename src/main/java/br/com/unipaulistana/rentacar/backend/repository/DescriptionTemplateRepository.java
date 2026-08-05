package br.com.unipaulistana.rentacar.backend.repository;

import br.com.unipaulistana.rentacar.backend.domain.DescriptionBlockType;
import br.com.unipaulistana.rentacar.backend.domain.DescriptionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescriptionTemplateRepository extends JpaRepository<DescriptionTemplate, Long> {
    List<DescriptionTemplate> findByBlockTypeOrderByPriorityDesc(DescriptionBlockType blockType);
}
