package com.stellora.mobile.data.model

data class RegisterRequest(
    val email: String,
    val displayName: String,
    val password: String
)

data class RegisterResponse(
    val id: String,
    val email: String,
    val displayName: String,
    val createdAtUtc: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val accessToken: String,
    val tokenType: String,
    val expiresAtUtc: String
)

data class UserProfileResponse(
    val id: String,
    val email: String,
    val displayName: String,
    val createdAtUtc: String,
    val timeZone: String?
)