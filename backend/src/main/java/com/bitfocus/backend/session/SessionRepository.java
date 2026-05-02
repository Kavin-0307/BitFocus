package com.bitfocus.backend.session;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByTask_TaskId(Long taskId);

}