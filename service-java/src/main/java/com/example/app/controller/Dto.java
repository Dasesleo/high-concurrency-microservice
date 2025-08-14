package com.example.app.controller;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class Dto {
    public static class ResetRequest {
        @Min(1)
        public int accounts = 200;
        @Min(0)
        public long initialBalance = 1000;
    }

    public static class TransferRequest {
        @NotBlank
        public String from;
        @NotBlank
        public String to;
        @NotNull
        @Min(1)
        public Long amount;
        @NotBlank
        public String key;
    }
}
