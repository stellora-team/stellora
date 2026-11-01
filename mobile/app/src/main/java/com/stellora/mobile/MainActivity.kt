package com.stellora.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stellora.mobile.data.TokenManager
import com.stellora.mobile.ui.screens.LoginScreen
import com.stellora.mobile.ui.screens.LoginSuccessScreen
import com.stellora.mobile.ui.screens.MainScreen
import com.stellora.mobile.ui.screens.RegisterScreen
import com.stellora.mobile.ui.screens.ProfileScreen
import com.stellora.mobile.ui.screens.RegisterSuccessScreen
import com.stellora.mobile.ui.screens.SimpleSectionScreen
import com.stellora.mobile.ui.theme.StelloraMobileTheme
import com.stellora.mobile.viewmodel.MainViewModel
import com.stellora.mobile.viewmodel.ProfileViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StelloraMobileTheme {
                val mainViewModel: MainViewModel = viewModel()
                val profileViewModel: ProfileViewModel = viewModel()

                val tokenManager = remember { TokenManager(this) }

                var registeredName by remember { mutableStateOf("") }
                var registeredEmail by remember { mutableStateOf("") }
                var loggedInEmail by remember { mutableStateOf("") }

                var currentScreen by remember {
                    mutableStateOf(if (tokenManager.isLoggedIn()) "main" else "login")
                }

                if (tokenManager.isLoggedIn()) {
                    mainViewModel.loadUserProfile(this)
                    profileViewModel.loadUserProfile(this)
                }

                when (currentScreen) {
                    "login" -> {
                        LoginScreen(
                            onLoginSuccess = { email ->
                                loggedInEmail = email
                                currentScreen = "success"
                            },
                            onGoogleClick = {

                            },
                            onForgotPasswordClick = {

                            },
                            onRegisterClick = {
                                currentScreen = "register"
                            },
                            onBackClick = {
                                finish()
                            }
                        )
                    }

                    "success" -> {
                        LoginSuccessScreen(
                            userEmail = loggedInEmail,
                            onContinueClick = {
                                val extractedName = loggedInEmail.substringBefore("@")

                                mainViewModel.loadUserProfile(this)
                                profileViewModel.loadUserProfile(this)
                                profileViewModel.setUserData(extractedName, loggedInEmail)
                                mainViewModel.setUserName(extractedName)

                                currentScreen = "main"
                            }
                        )
                    }

                    "main" -> {
                        MainScreen(
                            viewModel = mainViewModel,
                            onProfileClick = {
                                currentScreen = "profile"
                            },
                            onNewTaskClick = {
                                currentScreen = "task_screen"
                            },
                            onNewGoalClick = {
                                currentScreen = "goal_screen"
                            },
                            onNewHabitClick = {
                                currentScreen = "habit_screen"
                            },
                            onPlannerClick = {
                                currentScreen = "planner_screen"
                            },
                            onSpaceBannerClick = {
                                currentScreen = "space_screen"
                            },
                            onJournalClick = {
                                currentScreen = "journal_screen"
                            },
                            onCheckClick = {
                                currentScreen = "check_screen"
                            },
                            onStatsClick = {
                                currentScreen = "stats_screen"
                            },
                            onBackClick = {
                                finish()
                            }
                        )
                    }

                    "profile" -> {
                        ProfileScreen(
                            viewModel = profileViewModel,
                            onBackClick = {
                                currentScreen = "main"
                            },
                            onNavigateToLogin = {
                                currentScreen = "login"
                            }
                        )
                    }

                    "register" -> {
                        RegisterScreen(
                            onRegisterClick = { name, email, password ->
                                registeredName = name
                                registeredEmail = email
                                currentScreen = "register_success"
                            },
                            onGoogleClick = {},
                            onLoginClick = { currentScreen = "login" },
                            onBackClick = { currentScreen = "login" }
                        )
                    }

                    "register_success" -> {
                        RegisterSuccessScreen(
                            userName = registeredName,
                            userEmail = registeredEmail,
                            onConfigureProfileClick = {
                                currentScreen = "login"
                            },
                            onSkipClick = {
                                currentScreen = "login"
                            }
                        )
                    }

                    "task_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Нове завдання", onBackClick = { currentScreen = "main" })
                    }
                    "goal_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Нова ціль", onBackClick = { currentScreen = "main" })
                    }
                    "habit_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Нова звичка", onBackClick = { currentScreen = "main" })
                    }
                    "planner_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Планувальник", onBackClick = { currentScreen = "main" })
                    }
                    "space_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Мій космос", onBackClick = { currentScreen = "main" })
                    }
                    "journal_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Щоденник", onBackClick = { currentScreen = "main" })
                    }
                    "check_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Задачі та звички", onBackClick = { currentScreen = "main" })
                    }
                    "stats_screen" -> {
                        SimpleSectionScreen(title = "Розділ: Статистика", onBackClick = { currentScreen = "main" })
                    }
                }
            }
        }
    }
}