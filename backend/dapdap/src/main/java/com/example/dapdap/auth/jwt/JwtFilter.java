package com.example.dapdap.auth.jwt;

import com.example.dapdap.auth.domain.CustomUserDetails;
import com.example.dapdap.auth.domain.UserStatus;
import com.example.dapdap.users.entity.User;
import com.example.dapdap.users.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = header.substring(7);

        // 1) 토큰 검증 (만료/서명/형식)
        try {
            jwtUtil.validateToken(accessToken);
        } catch (ExpiredJwtException e) {
            unauthorized(response, "access token expired");
            return;
        } catch (JwtException | IllegalArgumentException e) {
            unauthorized(response, "invalid token");
            return;
        }

        // 2) access 토큰인지 확인
        if (!"access".equals(jwtUtil.getCategory(accessToken))) {
            unauthorized(response, "invalid access token");
            return;
        }

        // 3) username/email, role 추출
        String email = jwtUtil.getUsername(accessToken);
        String role = jwtUtil.getRole(accessToken);

        // 4) email 기반으로 DB에서 User 조회
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            unauthorized(response, "user not found");
            return;
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            unauthorized(response, "user inactive");
            return;
        }

        // (선택) 토큰 role과 DB role 불일치 시 DB를 신뢰(보안상 권장)
        // 토큰의 role을 신뢰하면 권한 상승 공격에 취약해질 수 있어요.
        // 따라서 아래처럼 DB role 기반으로 authority를 구성하는 편이 안전합니다.
        // 현재 CustomUserDetails는 user.getRole()을 사용하므로 DB role이 적용됩니다.

        // 5) Authentication 세팅
        CustomUserDetails customUserDetails = new CustomUserDetails(user);

        Authentication authToken = new UsernamePasswordAuthenticationToken(
                customUserDetails,
                null,
                customUserDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write(message);
    }
}
