package com.ecommerce.catalogservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class StockDeductionRequest {

    @NotEmpty(message = "At least one stock item is required")
    @Valid
    private List<StockDeductionItemRequest> items;
}