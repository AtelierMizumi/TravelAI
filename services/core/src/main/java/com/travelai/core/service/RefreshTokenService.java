package com.travelai.core.service;

import com.travelai.core.model.entity.RefreshToken;
import com.travelai.core.model.entity.User;

import java.util.Optional;

public interface RefreshTokenService {

    Optional<RefreshToken> findByToken(String token);

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyExpiration(RefreshToken token);

    int deleteByUserId(Long userId);
}
