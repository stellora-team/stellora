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
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Info
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stellora.mobile.R
import com.stellora.mobile.viewmodel.RegisterViewModel
import com.stellora.mobile.ui.theme.*

@Composable
fun RegisterScreen(
    viewModel: RegisterViewModel = viewModel(),
    onRegisterClick: (String, String, String) -> Unit = { _, _, _ -> },
    onGoogleClick: () -> Unit = {},
    onLoginClick: () -> Unit = {},
    onBackClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Image(
            painter = painterResource(id = R.drawable.back_reg),
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

            Text(
                text = "Створи свій акаунт",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(top = 8.dp)
            )

            Text(
                text = "Почни свою подорож серед зірок ✦",
                fontSize = 13.sp,
                color = StelloraTextSecondary,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            CustomTextField(
                value = viewModel.name,
                onValueChange = { viewModel.name = it; viewModel.nameError = null },
                placeholder = "Ім'я",
                icon = Icons.Default.Person,
                isError = viewModel.nameError != null,
                errorMessage = viewModel.nameError,
                enabled = !viewModel.isLoading
            )

            Spacer(modifier = Modifier.height(6.dp))

            CustomTextField(
                value = viewModel.email,
                onValueChange = { viewModel.email = it; viewModel.emailError = null },
                placeholder = "name@gmail.com",
                icon = Icons.Default.Email,
                isError = viewModel.emailError != null,
                errorMessage = viewModel.emailError,
                enabled = !viewModel.isLoading
            )

            Spacer(modifier = Modifier.height(6.dp))

            CustomTextField(
                value = viewModel.password,
                onValueChange = { viewModel.password = it; viewModel.passwordError = null },
                placeholder = "••••••••",
                icon = Icons.Default.Lock,
                isPassword = true,
                isError = viewModel.passwordError != null,
                errorMessage = viewModel.passwordError,
                enabled = !viewModel.isLoading
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = viewModel.termsChecked,
                    onCheckedChange = {
                        viewModel.termsChecked = it
                        if (it) viewModel.termsError = null
                    },
                    enabled = !viewModel.isLoading,
                    colors = CheckboxDefaults.colors(
                        checkedColor = StelloraCheckboxChecked,
                        uncheckedColor = StelloraCheckboxUnchecked,
                        checkmarkColor = Color.White
                    )
                )
                Column {
                    Text(
                        text = "Я погоджуюсь з Умовами користування",
                        fontSize = 11.sp,
                        color = if (viewModel.termsError != null) StelloraErrorColor else StelloraTextMuted
                    )
                    Text(
                        text = "та Політикою конфіденційності",
                        fontSize = 11.sp,
                        color = if (viewModel.termsError != null) StelloraErrorColor else StelloraTextMuted
                    )
                }
            }

            if (viewModel.termsError != null) {
                Text(
                    text = viewModel.termsError!!,
                    fontSize = 11.sp,
                    color = StelloraErrorText,
                    modifier = Modifier.padding(start = 12.dp, top = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

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
                        viewModel.registerUser { name, email, password ->
                            onRegisterClick(name, email, password)
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
                                    text = "Створюємо акаунт...",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = StelloraButtonText
                                )
                            }
                        } else {
                            Text(
                                text = "Зареєструватися",
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
                    .padding(vertical = 8.dp),
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
                    color = StelloraButtonText.copy(alpha = if (viewModel.isLoading) 0.5f else 1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Вже маєш акаунт? ", fontSize = 13.sp, color = StelloraLinkText)
                Text(
                    text = "Увійти",
                    fontSize = 13.sp,
                    color = StelloraTextMain,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onLoginClick() }
                )
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

@Composable
fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    icon: ImageVector,
    isPassword: Boolean = false,
    isError: Boolean = false,
    errorMessage: String? = null,
    enabled: Boolean = true
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            enabled = enabled,
            placeholder = { Text(placeholder, color = StelloraPlaceholder.copy(alpha = if (enabled) 1f else 0.5f)) },
            leadingIcon = {
                Icon(imageVector = icon, contentDescription = null, tint = StelloraPlaceholder.copy(alpha = if (enabled) 1f else 0.5f))
            },
            trailingIcon = {
                if (isError) {
                    Icon(imageVector = Icons.Outlined.Info, contentDescription = null, tint = StelloraErrorColor)
                }
            },
            singleLine = true,
            visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = if (isError) StelloraErrorColor else StelloraFieldBorder,
                unfocusedBorderColor = if (isError) StelloraErrorColor else StelloraFieldBorder,
                disabledBorderColor = StelloraFieldBorder.copy(alpha = 0.4f),
                focusedContainerColor = StelloraFieldBg,
                unfocusedContainerColor = StelloraFieldBg,
                disabledContainerColor = StelloraFieldBg.copy(alpha = 0.6f),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                disabledTextColor = Color.White.copy(alpha = 0.5f)
            )
        )

        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                fontSize = 11.sp,
                color = StelloraErrorText,
                modifier = Modifier.padding(start = 12.dp, top = 2.dp)
            )
        }
    }
}