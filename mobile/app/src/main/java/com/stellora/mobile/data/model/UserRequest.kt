package com.stellora.mobile.data.model

import kotlinx.serialization.Serializable

@Serializable
data class UserRequest(
    val username: String,
    val email: String,
    val passwordHash: String
)

@Serializable
data class ApiResponse(
    val success: Boolean,
    val message: String
)

data class UpdateUserRequest(
    val displayName: String,
    val email: String,
    val timeZone: String?
)