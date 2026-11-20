package com.ecommerce.apigateway.logging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Collections;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;

class CorrelationIdFilterTest {

    private final CorrelationIdFilter filter = new CorrelationIdFilter();

    /** Runs the filter and records what the downstream chain could see. */
    private record Seen(String header, String allHeaderNames, String mdc, MockHttpServletResponse response) {
    }

    private Seen run(String incomingHeader) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/orders");
        if (incomingHeader != null) {
            request.addHeader(CorrelationIdFilter.HEADER_NAME, incomingHeader);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> header = new AtomicReference<>();
        AtomicReference<String> names = new AtomicReference<>();
        AtomicReference<String> mdc = new AtomicReference<>();

        FilterChain chain = (req, res) -> {
            HttpServletRequest http = (HttpServletRequest) req;
            header.set(http.getHeader(CorrelationIdFilter.HEADER_NAME));
            names.set(String.join(",", Collections.list(http.getHeaderNames())));
            mdc.set(MDC.get(CorrelationIdFilter.MDC_KEY));
        };

        filter.doFilter(request, response, chain);

        return new Seen(header.get(), names.get(), mdc.get(), response);
    }

    @Test
    void generatesAnIdWhenTheClientSendsNone() throws Exception {
        Seen seen = run(null);

        assertThat(seen.header()).isNotBlank();
        assertThat(seen.response().getHeader(CorrelationIdFilter.HEADER_NAME)).isEqualTo(seen.header());
        assertThat(seen.mdc()).isEqualTo(seen.header());
        assertThat(seen.allHeaderNames()).contains(CorrelationIdFilter.HEADER_NAME);
    }

    @Test
    void reusesAWellFormedIncomingId() throws Exception {
        Seen seen = run("abc-12345.XYZ_678");

        assertThat(seen.header()).isEqualTo("abc-12345.XYZ_678");
        assertThat(seen.response().getHeader(CorrelationIdFilter.HEADER_NAME)).isEqualTo("abc-12345.XYZ_678");
    }

    @Test
    void replacesAMalformedIncomingId() throws Exception {
        for (String bad : new String[] { "short", "has spaces in it!!", "x".repeat(65), "line\r\nbreak-injection" }) {
            Seen seen = run(bad);

            assertThat(seen.header()).isNotEqualTo(bad);
            assertThat(seen.header()).matches("[0-9a-f-]{36}");
        }
    }

    @Test
    void doesNotDuplicateTheHeaderForDownstreamServices() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/orders");
        request.addHeader(CorrelationIdFilter.HEADER_NAME, "client-supplied-id-1");
        AtomicReference<Integer> count = new AtomicReference<>();

        filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> count.set(
                Collections.list(((HttpServletRequest) req).getHeaders(CorrelationIdFilter.HEADER_NAME)).size()));

        assertThat(count.get()).isEqualTo(1);
    }

    @Test
    void clearsTheLoggingContextAfterTheRequest() throws Exception {
        run(null);

        assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
    }

    @Test
    void clearsTheLoggingContextEvenWhenTheChainFails() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/orders");

        assertThatThrownBy(() -> filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> {
            throw new IllegalStateException("boom");
        })).isInstanceOf(IllegalStateException.class);

        assertThat(MDC.get(CorrelationIdFilter.MDC_KEY)).isNull();
    }
}
