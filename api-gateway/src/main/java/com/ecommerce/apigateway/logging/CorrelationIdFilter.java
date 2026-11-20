package com.ecommerce.apigateway.logging;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Gives every request that enters through the gateway a correlation ID so one
 * user action can be followed across the gateway and the downstream services.
 *
 * <ul>
 * <li>A well-formed incoming {@code X-Correlation-Id} is reused; anything else
 * (missing, too long, or containing unexpected characters) is replaced with a
 * fresh UUID, which also prevents log injection through the header.</li>
 * <li>The ID is forwarded to the downstream service on the proxied request and
 * returned to the caller on the response.</li>
 * <li>The ID is stored in the logging context under {@code correlationId} and
 * one access-style line is logged per request.</li>
 * </ul>
 *
 * It runs before Spring Security so rejected requests (401/403) are traced too.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";

    private static final Pattern VALID_ID = Pattern.compile("^[A-Za-z0-9._-]{8,64}$");

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = resolveCorrelationId(request.getHeader(HEADER_NAME));

        MDC.put(MDC_KEY, correlationId);
        response.setHeader(HEADER_NAME, correlationId);

        long startedAt = System.nanoTime();

        try {
            filterChain.doFilter(new CorrelationIdRequestWrapper(request, correlationId), response);
        } finally {
            long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;

            // Path only: query strings can carry tokens or personal data.
            log.info("{} {} -> {} ({} ms)",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    elapsedMs);

            MDC.remove(MDC_KEY);
        }
    }

    static String resolveCorrelationId(String incoming) {
        if (incoming != null && VALID_ID.matcher(incoming).matches()) {
            return incoming;
        }
        return UUID.randomUUID().toString();
    }

    /** Presents the resolved ID (never the raw client value) to everything downstream. */
    private static class CorrelationIdRequestWrapper extends HttpServletRequestWrapper {

        private final String correlationId;

        CorrelationIdRequestWrapper(HttpServletRequest request, String correlationId) {
            super(request);
            this.correlationId = correlationId;
        }

        @Override
        public String getHeader(String name) {
            return HEADER_NAME.equalsIgnoreCase(name) ? correlationId : super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            return HEADER_NAME.equalsIgnoreCase(name)
                    ? Collections.enumeration(List.of(correlationId))
                    : super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            names.removeIf(HEADER_NAME::equalsIgnoreCase);
            names.add(HEADER_NAME);
            return Collections.enumeration(names);
        }
    }
}
