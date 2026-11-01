package com.stellora.mobile.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stellora.mobile.data.remote.RetrofitClient
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import java.util.Locale

class MainViewModel : ViewModel() {
    var username by mutableStateOf("username")
    var currentDate by mutableStateOf("")
    var currentTime by mutableStateOf("")

    var selectedMood by mutableStateOf<String?>(null)

    init {
        updateCurrentDateTime()
        startClockTimer()
    }

    private fun startClockTimer() {
        viewModelScope.launch {
            while (true) {
                updateCurrentDateTime()
                delay(1000)
            }
        }
    }

    fun updateCurrentDateTime() {
        val localeUa = Locale("uk", "UA")

        val dateFormatter = java.text.SimpleDateFormat("d MMMM yyyy", localeUa)
        currentDate = dateFormatter.format(java.util.Date())

        val timeFormatter = java.text.SimpleDateFormat("HH:mm", localeUa).apply {
            timeZone = java.util.TimeZone.getDefault()
        }
        currentTime = timeFormatter.format(java.util.Date())
    }

    fun setUserName(name: String) {
        if (name.isNotBlank()) {
            username = name
        }
    }

    fun onMoodSelected(mood: String) {
        selectedMood = mood
    }

    fun logoutUser(context: android.content.Context, onLogoutComplete: () -> Unit) {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.logout()
            } catch (e: Exception) {
            } finally {
                val tokenManager = com.stellora.mobile.data.TokenManager(context)
                tokenManager.clearSession()
                onLogoutComplete()
            }
        }
    }

    fun loadUserProfile(context: android.content.Context) {
        viewModelScope.launch {
            try {
                val tokenManager = com.stellora.mobile.data.TokenManager(context)
                val token = tokenManager.getToken()

                if (!token.isNullOrBlank()) {
                    val response = com.stellora.mobile.data.remote.RetrofitClient.apiService.getUserProfile("Bearer $token")

                    if (response.isSuccessful && response.body() != null) {
                        val profile = response.body()!!
                        username = profile.displayName
                    }
                }
            } catch (e: Exception) {
            }
        }
    }

    fun onNewTaskClick() {

    }

    fun onNewGoalClick() {

    }

    fun onNewHabitClick() {

    }

    fun onPlannerClick() {

    }

    fun onSpaceBannerClick() {

    }

    fun onProfileClick() {

    }
}