package com.stellora.mobile.data.remote

import com.stellora.mobile.data.model.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Header

interface ApiService {

    @POST("/api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @POST("/api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("/api/users/me")
    suspend fun getUserProfile(
        @Header("Authorization") token: String
    ): Response<UserProfileResponse>

    @PUT("/api/users/me")
    suspend fun updateUserProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateUserRequest
    ): Response<UserProfileResponse>

    @POST("/api/auth/logout")
    suspend fun logout(): Response<Unit>
}