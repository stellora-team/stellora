package com.stellora.mobile.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stellora.mobile.data.model.RegisterRequest
import com.stellora.mobile.data.remote.RetrofitClient
import kotlinx.coroutines.launch
import android.util.Log

class RegisterViewModel : ViewModel() {
    var name by mutableStateOf("")
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var termsChecked by mutableStateOf(false)

    var nameError by mutableStateOf<String?>(null)
    var emailError by mutableStateOf<String?>(null)
    var passwordError by mutableStateOf<String?>(null)
    var termsError by mutableStateOf<String?>(null)

    var isLoading by mutableStateOf(false)
    var isSuccess by mutableStateOf(false)

    fun registerUser(onRegisterSuccess: (String, String, String) -> Unit) {
        var isValid = true

        if (name.isBlank()) {
            nameError = "Вкажи своє ім'я."
            isValid = false
        } else {
            nameError = null
        }

        val emailPattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}".toRegex()

        if (!email.matches(emailPattern)) {
            emailError = "Введи коректну адресу, наприклад name@gmail.com."
            isValid = false
        } else {
            emailError = null
        }

        val passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_\\-]).{12,}$".toRegex()

        if (!password.matches(passwordPattern)) {
            passwordError = "Пароль має містити 12+ символів, велику і малу літери, цифру та спецсимвол."
            isValid = false
        } else {
            passwordError = null
        }

        if (!termsChecked) {
            termsError = "Потрібно погодитися з умовами та політикою."
            isValid = false
        } else {
            termsError = null
        }

        if (isValid && !isLoading) {
            isLoading = true
            viewModelScope.launch {
                try {
                    val request = RegisterRequest(
                        email = email.trim(),
                        displayName = name.trim(),
                        password = password
                    )

                    val response = RetrofitClient.apiService.register(request)
                    isLoading = false

                    if (response.isSuccessful) {
                        isSuccess = true
                        onRegisterSuccess(name, email, password)
                    } else {
                        val errorBody = response.errorBody()?.string() ?: "Помилка сервера"
                        emailError = "Помилка реєстрації: $errorBody"
                        Log.e("RegisterTag", "Server error: $errorBody")
                    }

                } catch (e: Exception) {
                    isLoading = false
                    Log.e("RegisterTag", "Помилка мережі при реєстрації", e)
                    emailError = "Помилка мережі: ${e.localizedMessage ?: e.toString()}"
                }
            }
        }
    }
}