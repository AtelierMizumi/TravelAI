package com.travelai.backend.community;

import com.travelai.backend.entity.Post;
import com.travelai.backend.security.SessionService;
import org.springframework.stereotype.Component;

/**
 * Single seam for community post visibility/interaction permission.
 * Status is stored uppercase in the entity ("APPROVED", "PENDING", "REJECTED").
 */
@Component
public class PostAccessPolicy {

    public boolean canReadFeed(Post post, SessionService.Actor actor) {
        return "APPROVED".equals(post.getStatus());
    }

    public boolean canViewMine(Post post, SessionService.Actor actor) {
        return actor != null && actor.id() == post.getAuthorId();
    }

    public boolean canLike(Post post, SessionService.Actor actor) {
        return canReadFeed(post, actor) || canViewMine(post, actor) || (actor != null && actor.admin());
    }

    public boolean canComment(Post post, SessionService.Actor actor) {
        return canLike(post, actor);
    }

    public boolean canShareFrom(Post post, SessionService.Actor actor) {
        return canLike(post, actor);
    }

    public boolean canModerate(Post post, SessionService.Actor actor) {
        return actor != null && actor.admin();
    }
}
