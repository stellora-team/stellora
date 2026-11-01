package com.stellora.mobile.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stellora.mobile.R
import com.stellora.mobile.viewmodel.LoginViewModel
import com.stellora.mobile.ui.theme.*

@Composable
fun LoginScreen(
    viewModel: LoginViewModel = viewModel(),
    onLoginSuccess: (String) -> Unit = {},
    onGoogleClick: () -> Unit = {},
    onForgotPasswordClick: () -> Unit = {},
    onRegisterClick: () -> Unit = {},
    onBackClick: () -> Unit = {}
) {
    val context = androidx.compose.ui.platform.LocalContext.current

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.back_log),
            contentDescription = null,
            modifier = Modifier
                .fillMaxSize()
                .blur(if (viewModel.isLoading) 8.dp else 0.dp),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(StelloraBackground.copy(alpha = 0.4f))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .navigationBarsPadding()
                .statusBarsPadding()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.star_icon),
                    contentDescription = null,
                    modifier = Modifier
                        .size(300.dp)
                        .offset(x = 55.dp, y = (-29).dp)
                )

                Text(
                    text = "Stellora",
                    fontSize = 50.sp,
                    fontWeight = FontWeight.Bold,
                    color = StelloraTextMain,
                    style = TextStyle(
                        shadow = Shadow(
                            color = StelloraShadowColor,
                            offset = Offset(0f, 4f),
                            blurRadius = 40f
                        )
                    )
                )
            }

            if (viewModel.isSuccess) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "З поверненням!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(top = 12.dp)
                    )
                    Text(
                        text = "Ти серед своїх зірок ✦",
                        fontSize = 13.sp,
                        color = StelloraTextSecondary,
                        modifier = Modifier.padding(top = 4.dp, bottom = 30.dp)
                    )

                    Box(
                        modifier = Modifier
                            .size(70.dp)
                            .border(1.5.dp, StelloraBorderColor, RoundedCornerShape(35.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "✓", fontSize = 28.sp, color = Color.White)
                    }

                    Spacer(modifier = Modifier.height(30.dp))

                    Text(
                        text = "Вітаємо у Stellora!",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = viewModel.email,
                        fontSize = 13.sp,
                        color = StelloraTextSecondary,
                        modifier = Modifier.padding(top = 4.dp, bottom = 30.dp)
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .clip(RoundedCornerShape(50.dp))
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(StelloraPrimaryPurple, StelloraAccentPurple)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Button(
                            onClick = { onLoginSuccess(viewModel.email) },
                            modifier = Modifier.fillMaxSize(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                        ) {
                            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                Text(text = "Продовжити", color = Color.White, fontWeight = FontWeight.Bold)
                                Text(text = "➔", color = Color.White, modifier = Modifier.align(Alignment.CenterEnd))
                            }
                        }
                    }
                }
            } else {
                Text(
                    text = "З поверненням!",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Text(
                    text = "Продовжи свою подорож серед зірок ✦",
                    fontSize = 13.sp,
                    color = StelloraTextSecondary,
                    modifier = Modifier.padding(top = 2.dp, bottom = 16.dp)
                )

                CustomTextField(
                    value = viewModel.email,
                    onValueChange = { viewModel.email = it; viewModel.emailError = null },
                    placeholder = "Email",
                    icon = Icons.Default.Email,
                    isError = viewModel.emailError != null,
                    errorMessage = viewModel.emailError,
                    enabled = !viewModel.isLoading
                )

                Spacer(modifier = Modifier.height(10.dp))

                CustomTextField(
                    value = viewModel.password,
                    onValueChange = { viewModel.password = it; viewModel.passwordError = null },
                    placeholder = "Пароль",
                    icon = Icons.Default.Lock,
                    isPassword = true,
                    isError = viewModel.passwordError != null,
                    errorMessage = viewModel.passwordError,
                    enabled = !viewModel.isLoading
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { viewModel.rememberMe = !viewModel.rememberMe }
                    ) {
                        Checkbox(
                            checked = viewModel.rememberMe,
                            onCheckedChange = { viewModel.rememberMe = it },
                            enabled = !viewModel.isLoading,
                            colors = CheckboxDefaults.colors(
                                checkedColor = StelloraCheckboxChecked,
                                uncheckedColor = StelloraCheckboxUnchecked,
                                checkmarkColor = Color.White
                            )
                        )
                        Text(
                            text = "Запам'ятати мене",
                            fontSize = 13.sp,
                            color = StelloraTextMuted
                        )
                    }

                    Text(
                        text = "Забули пароль?",
                        fontSize = 13.sp,
                        color = StelloraSoftPurple,
                        textDecoration = TextDecoration.Underline,
                        modifier = Modifier.clickable { onForgotPasswordClick() }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(50.dp))
                        .background(
                            Brush.linearGradient(
                                colors = listOf(StelloraPrimaryPurple, StelloraAccentPurple)
                            )
                        )
                        .border(1.2.dp, StelloraBorderColor, RoundedCornerShape(50.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Button(
                        onClick = {
                            viewModel.loginUser(context) { email ->
                                onLoginSuccess(email)
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        contentPadding = PaddingValues(horizontal = 20.dp)
                    ) {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            if (viewModel.isLoading) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        color = Color.White,
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Входимо...",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = StelloraButtonText
                                    )
                                }
                            } else {
                                Text(
                                    text = "Увійти",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = StelloraButtonText
                                )
                                Text(
                                    text = "➔",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = StelloraButtonText,
                                    modifier = Modifier.align(Alignment.CenterEnd)
                                )
                            }
                        }
                    }
                }

                if (viewModel.isLoading) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Зачекай, будь ласка. Не закривай цей екран.",
                        fontSize = 11.sp,
                        color = StelloraTextSecondary,
                        textAlign = TextAlign.Center
                    )
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = StelloraTextSecondary.copy(alpha = 0.4f),
                        thickness = 1.dp
                    )
                    Text(
                        text = "  або  ",
                        fontSize = 12.sp,
                        color = StelloraTextSecondary
                    )
                    HorizontalDivider(
                        modifier = Modifier.weight(1f),
                        color = StelloraTextSecondary.copy(alpha = 0.4f),
                        thickness = 1.dp
                    )
                }

                OutlinedButton(
                    onClick = onGoogleClick,
                    enabled = !viewModel.isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(50.dp),
                    border = BorderStroke(1.2.dp, StelloraBorderColor.copy(alpha = if (viewModel.isLoading) 0.4f else 1f)),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = StelloraCardBg
                    )
                ) {
                    Text(
                        text = "Продовжити з Google",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = StelloraSoftPurple.copy(alpha = if (viewModel.isLoading) 0.5f else 1f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Ще не маєш акаунта? ", fontSize = 13.sp, color = StelloraLinkText)
                    Text(
                        text = "Зареєструйся",
                        fontSize = 13.sp,
                        color = StelloraTextMain,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable { onRegisterClick() }
                    )
                }
            }
        }

        IconButton(
            onClick = onBackClick,
            enabled = !viewModel.isLoading,
            modifier = Modifier
                .statusBarsPadding()
                .padding(16.dp)
                .align(Alignment.TopStart)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Назад",
                tint = if (viewModel.isLoading) Color.White.copy(alpha = 0.5f) else Color.White
            )
        }
    }
}