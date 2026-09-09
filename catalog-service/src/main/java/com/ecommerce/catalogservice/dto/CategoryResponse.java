package com.ecommerce.catalogservice.dto;

import java.util.List;

import lombok.Data;

@Data
public class CategoryResponse {

    private Long id;

    private String name;

    private Long parentId;

    private List<CategoryResponse> children;
}

// {
// "id": 1,
// "name": "Electronics",
// "parentId": null,
// "children": [
// {
// "id": 2,
// "name": "Mobiles",
// "parentId": 1,
// "children": [
// {
// "id": 3,
// "name": "Smartphones",
// "parentId": 2,
// "children": []
// }
// ]
// }
// ]
// }