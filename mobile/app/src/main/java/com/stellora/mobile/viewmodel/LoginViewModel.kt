package com.stellora.mobile.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stellora.mobile.data.model.LoginRequest
import com.stellora.mobile.data.remote.RetrofitClient
import kotlinx.coroutines.launch
import android.util.Log

class LoginViewModel : ViewModel() {
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var rememberMe by mutableStateOf(false)

    var emailError by mutableStateOf<String?>(null)
    var passwordError by mutableStateOf<String?>(null)

    var isLoading by mutableStateOf(false)
    var isSuccess by mutableStateOf(false)

    fun loginUser(context: android.content.Context, onLoginSuccess: (String) -> Unit) {
        var isValid = true

        val emailPattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}".toRegex()
        if (!email.matches(emailPattern)) {
            emailError = "Введи коректну адресу, наприклад name@gmail.com."
            isValid = false
        } else {
            emailError = null
        }

        if (password.length < 12) {
            passwordError = "Введи пароль, щоб увійти."
            isValid = false
        } else {
            passwordError = null
        }

        if (isValid && !isLoading) {
            isLoading = true
            viewModelScope.launch {
                try {
                    val request = LoginRequest(email = email.trim(), password = password)
                    val response = RetrofitClient.apiService.login(request)
                    isLoading = false

                    if (response.isSuccessful && response.body() != null) {
                        val loginResponse = response.body()!!
                        isSuccess = true

                        val tokenManager = com.stellora.mobile.data.TokenManager(context)
                        if (rememberMe) {
                            tokenManager.saveToken(loginResponse.accessToken)
                        } else {
                            tokenManager.clearSession()
                        }

                        onLoginSuccess(email)
                    } else {
                        passwordError = "Невірний логін або пароль"
                    }
                } catch (e: Exception) {
                    isLoading = false
                    passwordError = "Помилка мережі: ${e.localizedMessage}"
                }
            }
        }
    }
}