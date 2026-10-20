
package com.ecommerce.apigateway.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class GatewayJwtAuthFilter extends OncePerRequestFilter {

    private final GatewayJwtUtil gatewayJwtUtil;

    public GatewayJwtAuthFilter(GatewayJwtUtil gatewayJwtUtil) {
        this.gatewayJwtUtil = gatewayJwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        SecurityContextHolder.clearContext();

        // Never trust identity headers supplied by the browser.
        Map<String, String> trustedHeaders = new LinkedHashMap<>();

        HttpServletRequest sanitizedRequest = new TrustedHeaderRequestWrapper(request, trustedHeaders);

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(sanitizedRequest, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = gatewayJwtUtil.validateAndExtractClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            Object userIdClaim = claims.get("userId");

            if (email == null || email.isBlank()
                    || role == null || role.isBlank()
                    || userIdClaim == null
                    || userIdClaim.toString().isBlank()) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid authentication token");
                return;
            }

            String userId = userIdClaim.toString();

            // These values come from the validated JWT, not the request.
            trustedHeaders.put("X-User-Id", userId);
            trustedHeaders.put("X-User-Role", role);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            authentication.setDetails(claims);

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            filterChain.doFilter(sanitizedRequest, response);

        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired authentication token");
        }
    }

    private static class TrustedHeaderRequestWrapper
            extends HttpServletRequestWrapper {

        private final Map<String, String> trustedHeaders;

        TrustedHeaderRequestWrapper(
                HttpServletRequest request,
                Map<String, String> trustedHeaders) {
            super(request);
            this.trustedHeaders = trustedHeaders;
        }

        @Override
        public String getHeader(String name) {
            if (isIdentityHeader(name)) {
                return trustedHeaders.get(name);
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (isIdentityHeader(name)) {
                String value = trustedHeaders.get(name);
                return value == null
                        ? Collections.emptyEnumeration()
                        : Collections.enumeration(List.of(value));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());

            names.removeIf(TrustedHeaderRequestWrapper::isIdentityHeader);

            names.addAll(trustedHeaders.keySet());

            return Collections.enumeration(names);
        }

        private static boolean isIdentityHeader(String name) {
            return "X-User-Id".equalsIgnoreCase(name)
                    || "X-User-Role".equalsIgnoreCase(name);
        }
    }
}
