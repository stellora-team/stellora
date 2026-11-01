package com.stellora.mobile.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stellora.mobile.data.model.UpdateUserRequest
import com.stellora.mobile.data.remote.RetrofitClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ProfileViewModel : ViewModel() {
    var username by mutableStateOf("username")
    var email by mutableStateOf("name@gmail.com")
    var timezone by mutableStateOf("UTC")

    var errorMessage by mutableStateOf<String?>(null)
    var successMessage by mutableStateOf<String?>(null)
    var isLoading by mutableStateOf(false)

    var isTimezoneExpanded by mutableStateOf(false)

    val timeZoneMapping = linkedMapOf(
        "UTC-12 — Захід лінії зміни дат" to "Etc/GMT+12",
        "UTC-11 — Мідвей (Самоа)" to "Pacific/Midway",
        "UTC-10 — Гонолулу (Гаваї)" to "Pacific/Honolulu",
        "UTC-9 — Анкоридж (Аляска)" to "America/Anchorage",
        "UTC-8 — Лос-Анджелес (Тихоокеанський час)" to "America/Los_Angeles",
        "UTC-7 — Денвер (Гірський час)" to "America/Denver",
        "UTC-6 — Чикаго (Центральний час)" to "America/Chicago",
        "UTC-5 — Нью-Йорк (Східний час)" to "America/New_York",
        "UTC-4 — Каракас (Венесуела)" to "America/Caracas",
        "UTC-3 — Буенос-Айрес (Аргентина)" to "America/Argentina/Buenos_Aires",
        "UTC-2 — Південна Джорджія" to "Atlantic/South_Georgia",
        "UTC-1 — Азорські острови" to "Atlantic/Azores",
        "UTC+0 — Лондон (Гринвіч)" to "Europe/London",
        "UTC+1 — Берлін / Париж (Центральноєвропейський час)" to "Europe/Paris",
        "UTC+2 — Київ (Східноєвропейський час)" to "Europe/Kyiv",
        "UTC+3 — Київ (літній) / Стамбул" to "Europe/Istanbul",
        "UTC+4 — Дубай (ОАЕ)" to "Asia/Dubai",
        "UTC+5 — Карачі (Пакистан)" to "Asia/Karachi",
        "UTC+6 — Дакка (Бангладеш)" to "Asia/Dhaka",
        "UTC+7 — Бангкок (Таїланд)" to "Asia/Bangkok",
        "UTC+8 — Сінгапур / Пекін" to "Asia/Singapore",
        "UTC+9 — Токіо (Японія)" to "Asia/Tokyo",
        "UTC+10 — Сідней (Австралія)" to "Australia/Sydney",
        "UTC+12 — Окленд (Нова Зеландія)" to "Pacific/Auckland"
    )

    val availableTimezones = timeZoneMapping.keys.toList()

    val completedTasksCount: Int = 12
    val successTasksCount: Int = 8
    val activeHabitsCount: Int = 5
    val focusHoursCount: Int = 24
    var registrationDate: String = ""
    private var originalEmail = ""

    fun saveChanges(context: android.content.Context) {
        errorMessage = null
        successMessage = null

        val emailPattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}".toRegex()
        if (!email.matches(emailPattern)) {
            errorMessage = "Введи коректну електронну пошту."
            return
        }

        isLoading = true
        viewModelScope.launch {
            try {
                val tokenManager = com.stellora.mobile.data.TokenManager(context)
                val token = tokenManager.getToken()

                if (!token.isNullOrBlank()) {
                    val serverIanaTz = timeZoneMapping[timezone] ?: "Europe/Kyiv"

                    val request = UpdateUserRequest(
                        displayName = username.trim(),
                        email = email.trim(),
                        timeZone = serverIanaTz
                    )

                    val response = RetrofitClient.apiService.updateUserProfile("Bearer $token", request)
                    isLoading = false

                    if (response.isSuccessful && response.body() != null) {
                        val updatedUser = response.body()!!
                        username = updatedUser.displayName
                        email = updatedUser.email
                        originalEmail = updatedUser.email

                        if (!updatedUser.timeZone.isNullOrBlank()) {
                            val serverTz = updatedUser.timeZone!!
                            val matchedEntry = timeZoneMapping.entries.find { it.value.equals(serverTz, ignoreCase = true) }
                            timezone = matchedEntry?.key ?: serverTz
                        }
                        successMessage = "Зміни успішно збережено!"
                    } else {
                        val errorBody = response.errorBody()?.string() ?: ""

                        if (email.trim().equals(originalEmail.trim(), ignoreCase = true)) {
                            errorMessage = "Не вдалося зберегти зміни. Спробуй пізніше."
                        } else if (errorBody.contains("email", ignoreCase = true) || response.code() == 400 || response.code() == 409) {
                            errorMessage = "Користувач із такою поштою вже існує або пошта зайнята."
                        } else {
                            errorMessage = "Не вдалося зберегти зміни. Спробуй пізніше."
                        }
                    }
                }
            } catch (e: Exception) {
                isLoading = false
                errorMessage = "Помилка мережі: ${e.localizedMessage}"
            }
        }
    }

    fun cancelChanges(context: android.content.Context) {
        errorMessage = null
        successMessage = null
        loadUserProfile(context)
    }
    fun setUserData(name: String, userEmail: String) {
        if (name.isNotBlank()) username = name
        if (userEmail.isNotBlank()) email = userEmail
    }

    fun logout(context: android.content.Context, onLogoutSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                val tokenManager = com.stellora.mobile.data.TokenManager(context)
                tokenManager.clearSession()
                onLogoutSuccess()
            } catch (e: Exception) {
                val tokenManager = com.stellora.mobile.data.TokenManager(context)
                tokenManager.clearSession()
                onLogoutSuccess()
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
                        email = profile.email
                        originalEmail = profile.email

                        if (!profile.timeZone.isNullOrBlank()) {
                            val serverTz = profile.timeZone!!
                            val matchedEntry = timeZoneMapping.entries.find { it.value.equals(serverTz, ignoreCase = true) }
                            timezone = matchedEntry?.key ?: serverTz
                        }

                        if (!profile.createdAtUtc.isNullOrBlank()) {
                            try {
                                val rawDate = profile.createdAtUtc!!
                                val cleaned = rawDate.replace("Z", "").substringBefore(".")
                                val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).apply {
                                    timeZone = TimeZone.getTimeZone("UTC")
                                }
                                val outputFormat = SimpleDateFormat("dd.MM.yyyy", Locale("uk", "UA"))
                                val date = inputFormat.parse(cleaned)

                                if (date != null) {
                                    registrationDate = outputFormat.format(date)
                                }
                            } catch (e: Exception) {

                            }
                        }
                    }
                }
            } catch (e: Exception) {

            }
        }
    }
}