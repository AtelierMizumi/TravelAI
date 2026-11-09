package com.travelai.backend.security;

interface ResetEmail {
    boolean configured();
    void checkConnection();
    void send(String recipient, String code);
}
