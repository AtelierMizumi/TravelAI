package com.travelai.backend.security;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import java.util.Map;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",ex.getReason()==null?"Request rejected":ex.getReason(),"code",ex.getStatusCode().value()));
    }
    @ExceptionHandler({IllegalArgumentException.class,ArithmeticException.class})
    public ResponseEntity<?> invalid(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("message",ex instanceof ArithmeticException?"Amount or duration exceeds supported arithmetic":ex.getMessage(),"code",400));
    }
}
