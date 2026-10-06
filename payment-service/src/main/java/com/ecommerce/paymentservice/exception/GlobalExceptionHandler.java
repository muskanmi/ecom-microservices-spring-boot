package com.ecommerce.paymentservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotPayableException.class)
    public ResponseEntity<Map<String, String>> handleOrderNotPayable(
            OrderNotPayableException ex) {

        Map<String, String> response = new HashMap<>();

        response.put(
                "error",
                "ORDER_NOT_PAYABLE");

        response.put(
                "message",
                ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }
}