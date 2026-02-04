const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "ShopSphere API",
        version: "1.0.0",
        description: "API documentation for ShopSphere backend"
    },
    servers: [
        { url: "http://localhost:3000", description: "Local server" }
    ],
    tags: [
        { name: "Health" },
        { name: "Auth" },
        { name: "Users" },
        { name: "Products" },
        { name: "Categories" },
        { name: "Cart" },
        { name: "Orders" },
        { name: "Payments" },
        { name: "Reviews" },
        { name: "Admin" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    status: { type: "string" },
                    message: { type: "string" }
                }
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    first_name: { type: "string" },
                    last_name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                    avatar_url: { type: "string" },
                    is_active: { type: "boolean" }
                }
            },
            Product: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    title: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    stock: { type: "integer" },
                    image_url: { type: ["string", "null"] }
                }
            },
            Category: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    parent_id: { type: ["integer", "null"] },
                    quantity: { type: "integer" }
                }
            },
            CartItem: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    product_id: { type: "integer" },
                    quantity: { type: "integer" }
                }
            },
            Order: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    total_price: { type: "number" },
                    status: { type: "string" },
                    created_at: { type: "string" },
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                product_id: { type: "integer" },
                                quantity: { type: "integer" },
                                price: { type: "number" }
                            }
                        }
                    }
                }
            },
            Payment: {
                type: "object",
                properties: {
                    order_id: { type: "integer" },
                    status: { type: "string" },
                    method: { type: "string" },
                    amount: { type: "number" }
                }
            },
            Review: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    product_id: { type: "integer" },
                    rating: { type: "number" },
                    comment: { type: "string" }
                }
            }
        }
    },
    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Health check",
                responses: {
                    "200": {
                        description: "OK"
                    }
                }
            }
        },
        "/users/register": {
            post: {
                tags: ["Auth"],
                summary: "Register user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    first_name: { type: "string" },
                                    last_name: { type: "string" },
                                    email: { type: "string" },
                                    password_hash: { type: "string" },
                                    avatar_url: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "OTP sent" },
                    "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                }
            }
        },
        "/users/verify-otp": {
            post: {
                tags: ["Auth"],
                summary: "Verify OTP",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    otp: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Verified" }
                }
            }
        },
        "/users/login": {
            post: {
                tags: ["Auth"],
                summary: "Login",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Logged in" }
                }
            }
        },
        "/users/{id}": {
            patch: {
                tags: ["Users"],
                summary: "Update user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    first_name: { type: "string" },
                                    last_name: { type: "string" },
                                    password_hash: { type: "string" },
                                    avatar_url: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated" },
                    "401": { description: "Unauthorized" }
                }
            }
        },
        "/products": {
            get: {
                tags: ["Products"],
                summary: "Get all products",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "List products",
                        content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } }
                    }
                }
            }
        },
        "/products/{id}": {
            get: {
                tags: ["Products"],
                summary: "Get product by id",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Product", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "404": { description: "Not found" }
                }
            }
        },
        "/categories": {
            get: {
                tags: ["Categories"],
                summary: "Get all categories",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "List categories" }
                }
            }
        },
        "/categories/{id}": {
            get: {
                tags: ["Categories"],
                summary: "Get category by id",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Category" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/cart": {
            get: {
                tags: ["Cart"],
                summary: "Get cart items",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "Cart items", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CartItem" } } } } }
                }
            },
            post: {
                tags: ["Cart"],
                summary: "Add item to cart",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    productId: { type: "integer" },
                                    quantity: { type: "integer" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Created" }
                }
            }
        },
        "/cart/{cartId}": {
            put: {
                tags: ["Cart"],
                summary: "Update cart item",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "cartId", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", properties: { quantity: { type: "integer" } } }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated" }
                }
            },
            delete: {
                tags: ["Cart"],
                summary: "Remove cart item",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "cartId", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" }
                }
            }
        },
        "/orders": {
            post: {
                tags: ["Orders"],
                summary: "Create order",
                security: [{ bearerAuth: [] }],
                responses: {
                    "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } }
                }
            }
        },
        "/orders/{id}": {
            get: {
                tags: ["Orders"],
                summary: "Get order by id",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Order", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } }
                }
            },
            patch: {
                tags: ["Orders"],
                summary: "Update order status",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", properties: { status: { type: "string" } } }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated" }
                }
            },
            delete: {
                tags: ["Orders"],
                summary: "Delete order",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" }
                }
            }
        },
        "/payments/{orderId}": {
            post: {
                tags: ["Payments"],
                summary: "Pay for an order",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "orderId", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", properties: { method: { type: "string" } } }
                        }
                    }
                },
                responses: {
                    "200": { description: "Payment processed" }
                }
            }
        },
        "/reviews": {
            post: {
                tags: ["Reviews"],
                summary: "Create review",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    product_id: { type: "integer" },
                                    rating: { type: "number" },
                                    comment: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } }
                }
            }
        },
        "/reviews/product/{productId}": {
            get: {
                tags: ["Reviews"],
                summary: "Get reviews by product",
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Reviews list" }
                }
            }
        },
        "/reviews/product/{productId}/average": {
            get: {
                tags: ["Reviews"],
                summary: "Get average rating by product",
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Average rating" }
                }
            }
        },
        "/reviews/product/{productId}/stats": {
            get: {
                tags: ["Reviews"],
                summary: "Get review statistics",
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Statistics" }
                }
            }
        },
        "/reviews/{reviewId}": {
            patch: {
                tags: ["Reviews"],
                summary: "Update review",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "reviewId", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    rating: { type: "number" },
                                    comment: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated" }
                }
            },
            delete: {
                tags: ["Reviews"],
                summary: "Delete review",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "reviewId", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" }
                }
            }
        },
        "/admin/users": {
            get: {
                tags: ["Admin"],
                summary: "Get users (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "offset", in: "query", required: false, schema: { type: "integer" } },
                    { name: "limit", in: "query", required: false, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Users list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/users/{id}": {
            get: {
                tags: ["Admin"],
                summary: "Get user by id (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            },
            delete: {
                tags: ["Admin"],
                summary: "Delete user by id (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/products": {
            post: {
                tags: ["Admin"],
                summary: "Create product (admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Product" }
                        }
                    }
                },
                responses: {
                    "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/products/{id}": {
            put: {
                tags: ["Admin"],
                summary: "Update product (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Product" }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "403": { description: "Forbidden" }
                }
            },
            delete: {
                tags: ["Admin"],
                summary: "Delete product (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/products/{id}/image": {
            post: {
                tags: ["Admin"],
                summary: "Upload product image (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    image: { type: "string", format: "binary" }
                                },
                                required: ["image"]
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "400": { description: "Bad request" },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/categories": {
            post: {
                tags: ["Admin"],
                summary: "Create category (admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    parentId: { type: ["integer", "null"] },
                                    quantity: { type: "integer" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Created" },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/categories/{id}": {
            put: {
                tags: ["Admin"],
                summary: "Update category (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object", properties: { name: { type: "string" } } }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated" },
                    "403": { description: "Forbidden" }
                }
            },
            delete: {
                tags: ["Admin"],
                summary: "Delete category (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted" },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/users/{id}/active": {
            patch: {
                tags: ["Admin"],
                summary: "Activate/deactivate user (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { is_active: { type: "boolean" } },
                                required: ["is_active"]
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/products/low-stock": {
            get: {
                tags: ["Admin"],
                summary: "List low-stock products (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "threshold", in: "query", required: false, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Products", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/products/export": {
            get: {
                tags: ["Admin"],
                summary: "Export products as CSV (admin only)",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": { description: "CSV export", content: { "text/csv": { schema: { type: "string" } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/products/bulk": {
            patch: {
                tags: ["Admin"],
                summary: "Bulk update products (admin only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    updates: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer" },
                                                title: { type: "string" },
                                                description: { type: "string" },
                                                price: { type: "number" },
                                                stock: { type: "integer" },
                                                image_url: { type: ["string", "null"] }
                                            },
                                            required: ["id"]
                                        }
                                    }
                                },
                                required: ["updates"]
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/products/{id}/stock": {
            patch: {
                tags: ["Admin"],
                summary: "Update product stock (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    stock: { type: "integer" },
                                    delta: { type: "integer" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/products/{id}/price": {
            patch: {
                tags: ["Admin"],
                summary: "Update product price (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { price: { type: "number" } },
                                required: ["price"]
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/reviews": {
            get: {
                tags: ["Admin"],
                summary: "List reviews (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "offset", in: "query", required: false, schema: { type: "integer" } },
                    { name: "limit", in: "query", required: false, schema: { type: "integer" } },
                    { name: "productId", in: "query", required: false, schema: { type: "integer" } },
                    { name: "userId", in: "query", required: false, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Reviews list", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/reviews/{id}": {
            delete: {
                tags: ["Admin"],
                summary: "Delete review (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
                    "403": { description: "Forbidden" },
                    "404": { description: "Not found" }
                }
            }
        },
        "/admin/dashboard/overview": {
            get: {
                tags: ["Admin"],
                summary: "Dashboard overview (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "from", in: "query", required: false, schema: { type: "string" } },
                    { name: "to", in: "query", required: false, schema: { type: "string" } }
                ],
                responses: {
                    "200": {
                        description: "Overview",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        total_orders: { type: "integer" },
                                        total_sales: { type: "number" },
                                        avg_order_value: { type: "number" },
                                        pending_orders: { type: "integer" },
                                        paid_orders: { type: "integer" },
                                        shipped_orders: { type: "integer" },
                                        delivered_orders: { type: "integer" },
                                        new_users: { type: "integer" }
                                    }
                                }
                            }
                        }
                    },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/dashboard/best-sellers": {
            get: {
                tags: ["Admin"],
                summary: "Best sellers (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "from", in: "query", required: false, schema: { type: "string" } },
                    { name: "to", in: "query", required: false, schema: { type: "string" } },
                    { name: "limit", in: "query", required: false, schema: { type: "integer" } }
                ],
                responses: {
                    "200": {
                        description: "Best sellers",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer" },
                                            title: { type: "string" },
                                            sold_quantity: { type: "integer" },
                                            revenue: { type: "number" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "403": { description: "Forbidden" }
                }
            }
        },
        "/admin/dashboard/stale-products": {
            get: {
                tags: ["Admin"],
                summary: "Products with no sales in period (admin only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "days", in: "query", required: false, schema: { type: "integer" } },
                    { name: "limit", in: "query", required: false, schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "Products", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Product" } } } } },
                    "403": { description: "Forbidden" }
                }
            }
        }
    }
};

export default swaggerSpec;
