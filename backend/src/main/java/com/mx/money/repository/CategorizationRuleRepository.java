package com.mx.money.repository;

import com.mx.money.entity.CategorizationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategorizationRuleRepository extends JpaRepository<CategorizationRule, Long> {

    List<CategorizationRule> findByEnabledTrueOrderByPriorityAscIdAsc();

    boolean existsByKeywordIgnoreCaseAndCategoryNameIgnoreCase(String keyword, String categoryName);
}
