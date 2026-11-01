package com.stellora.mobile.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stellora.mobile.R
import com.stellora.mobile.viewmodel.ProfileViewModel
import com.stellora.mobile.ui.theme.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier,
    viewModel: ProfileViewModel = viewModel(),
    onBackClick: () -> Unit = {},
    onNavigateToLogin: () -> Unit = {}
) {
    val scrollState = rememberScrollState()
    val context = androidx.compose.ui.platform.LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.loadUserProfile(context)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(StelloraBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .navigationBarsPadding()
                .statusBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
            ) {
                Image(
                    painter = painterResource(id = R.drawable.back_prof),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1120.dp),
                    contentScale = ContentScale.Crop
                )

                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .background(StelloraBackground.copy(alpha = 0.4f))
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .padding(top = 25.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Top
                ) {

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(70.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        IconButton(
                            onClick = { onBackClick() },
                            modifier = Modifier.align(Alignment.CenterStart)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Назад",
                                tint = Color.White
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Image(
                                    painter = painterResource(id = R.drawable.star_icon),
                                    contentDescription = null,
                                    modifier = Modifier
                                        .size(85.dp)
                                        .offset(x = 26.dp, y = (-15).dp)
                                )

                                Text(
                                    text = "Stellora",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = StelloraTitleLight,
                                    style = TextStyle(
                                        shadow = Shadow(
                                            color = StelloraShadowColor,
                                            offset = Offset(0f, 2f),
                                            blurRadius = 20f
                                        )
                                    )
                                )
                            }
                        }
                    }


                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(182.dp)
                            .border(1.dp, StelloraProfileBorder, RoundedCornerShape(20.dp))
                            .clip(RoundedCornerShape(20.dp))
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.back_prof_window),
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(StelloraBackground.copy(alpha = 0.5f))
                        )

                        Image(
                            painter = painterResource(id = R.drawable.star_icon),
                            contentDescription = null,
                            modifier = Modifier
                                .size(110.dp)
                                .align(Alignment.TopEnd)
                                .offset(x = -30.dp, y = -5.dp)
                        )

                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(85.dp)
                                    .border(3.dp, StelloraProfileBorder, RoundedCornerShape(42.5.dp))
                                    .background(StelloraFieldBg.copy(alpha = 0.6f), RoundedCornerShape(42.5.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_profile_user),
                                    contentDescription = null,
                                    modifier = Modifier.size(45.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(16.dp))

                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(top = 30.dp),
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = viewModel.username,
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = StelloraNameText
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = viewModel.email,
                                    fontSize = 12.sp,
                                    color = StelloraSubtextEmail
                                )

                                Text(
                                    text = "У Stellora з ${viewModel.registrationDate}",
                                    fontSize = 11.sp,
                                    color = StelloraSubtextEmail
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, StelloraActivityBoxBorder, RoundedCornerShape(16.dp))
                            .background(StelloraActivityBoxBg, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Моя активність",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(bottom = 14.dp)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            ActivityCard(
                                count = viewModel.completedTasksCount.toString(),
                                title = "Задач",
                                subtitle = "● ${viewModel.successTasksCount} виконано",
                                iconRes = R.drawable.ic_focus_task
                            )
                            ActivityCard(
                                count = viewModel.activeHabitsCount.toString(),
                                title = "Звички",
                                subtitle = "● 4 активні",
                                iconRes = R.drawable.ic_habit_check
                            )
                            ActivityCard(
                                count = viewModel.focusHoursCount.toString(),
                                title = "Годин фокусу",
                                subtitle = "● За місяць",
                                iconRes = R.drawable.ic_timer_gold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(34.dp)
                            .border(1.dp, StelloraProfileBorder, RoundedCornerShape(10.dp))
                            .background(StelloraCardDarkBg.copy(alpha = 0.7f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Особиста інформація",
                            fontSize = 14.sp,
                            color = StelloraNameText
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, StelloraProfileBorderDark, RoundedCornerShape(16.dp))
                            .background(StelloraCardDarkBg, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Особиста інформація",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Переглядай та редагуй особисті дані.",
                            fontSize = 12.sp,
                            color = StelloraSubtextLight
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        ProfileTextField(
                            label = "Ім’я користувача",
                            value = viewModel.username,
                            onValueChange = { viewModel.username = it },
                            iconRes = R.drawable.ic_profile_user
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        ProfileTextField(
                            label = "Електронна пошта",
                            value = viewModel.email,
                            onValueChange = { viewModel.email = it },
                            iconRes = R.drawable.ic_email_box
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Column {
                            Text(
                                text = "Часовий пояс",
                                fontSize = 12.sp,
                                color = StelloraTimezoneText,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )

                            ExposedDropdownMenuBox(
                                expanded = viewModel.isTimezoneExpanded,
                                onExpandedChange = { viewModel.isTimezoneExpanded = it }
                            ) {
                                OutlinedTextField(
                                    value = viewModel.timezone,
                                    onValueChange = {},
                                    readOnly = true,
                                    leadingIcon = {
                                        Box(
                                            modifier = Modifier
                                                .size(44.dp)
                                                .background(StelloraIconBoxBg, RoundedCornerShape(8.dp)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Image(
                                                painter = painterResource(id = R.drawable.ic_timer_box),
                                                contentDescription = null,
                                                modifier = Modifier.size(30.dp)
                                            )
                                        }
                                    },
                                    trailingIcon = {
                                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = viewModel.isTimezoneExpanded)
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp)
                                        .menuAnchor(),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = StelloraFieldBoxBorder,
                                        unfocusedBorderColor = StelloraFieldBoxBorder,
                                        focusedContainerColor = StelloraFieldBoxBg,
                                        unfocusedContainerColor = StelloraFieldBoxBg,
                                        focusedTextColor = Color.White,
                                        unfocusedTextColor = Color.White
                                    ),
                                    singleLine = true
                                )

                                ExposedDropdownMenu(
                                    expanded = viewModel.isTimezoneExpanded,
                                    onDismissRequest = { viewModel.isTimezoneExpanded = false },
                                    modifier = Modifier.background(StelloraCardBg)
                                ) {
                                    viewModel.availableTimezones.forEach { selectionOption ->
                                        DropdownMenuItem(
                                            text = { Text(selectionOption, color = Color.White) },
                                            onClick = {
                                                viewModel.timezone = selectionOption
                                                viewModel.isTimezoneExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        if (!viewModel.errorMessage.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = viewModel.errorMessage!!,
                                color = Color(0xFFFF5252),
                                fontSize = 12.sp
                            )
                        }

                        if (!viewModel.successMessage.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = viewModel.successMessage!!,
                                color = Color(0xFF4CAF50),
                                fontSize = 12.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            OutlinedButton(
                                onClick = { viewModel.cancelChanges(context) },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(43.dp),
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, StelloraCancelButtonBorder),
                                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.Transparent)
                            ) {
                                Text(text = "Скасувати", color = StelloraCancelButtonText, fontSize = 13.sp)
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Button(
                                onClick = { viewModel.saveChanges(context) },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(43.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = StelloraSaveButtonBg)
                            ) {
                                Text(text = "Зберегти зміни", color = StelloraSaveButtonText, fontSize = 13.sp)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = {
                            viewModel.logout(context) {
                                onNavigateToLogin()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFD32F2F).copy(alpha = 0.2f)
                        ),
                        border = BorderStroke(1.dp, Color(0xFFD32F2F).copy(alpha = 0.5f))
                    ) {
                        Text(
                            text = "Вийти з акаунта",
                            color = Color(0xFFFF5252),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }
    }
}

@Composable
fun ActivityCard(count: String, title: String, subtitle: String, iconRes: Int) {
    Box(
        modifier = Modifier
            .width(102.dp)
            .height(130.dp)
            .border(1.dp, StelloraActivityBorder, RoundedCornerShape(12.dp))
            .background(StelloraActivityBg, RoundedCornerShape(12.dp))
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = count, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text(text = title, fontSize = 12.sp, color = Color.White)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 10.sp, color = StelloraActivitySub)
        }
    }
}

@Composable
fun ProfileTextField(label: String, value: String, onValueChange: (String) -> Unit, iconRes: Int) {
    Column {
        Text(
            text = label,
            fontSize = 12.sp,
            color = StelloraTimezoneText,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            leadingIcon = {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(StelloraIconBoxBg, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = iconRes),
                        contentDescription = null,
                        modifier = Modifier.size(30.dp)
                    )
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = StelloraFieldBoxBorder,
                unfocusedBorderColor = StelloraFieldBoxBorder,
                focusedContainerColor = StelloraFieldBoxBg,
                unfocusedContainerColor = StelloraFieldBoxBg,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            singleLine = true
        )
    }
}