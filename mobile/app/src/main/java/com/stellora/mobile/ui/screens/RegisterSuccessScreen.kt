package com.stellora.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stellora.mobile.R
import com.stellora.mobile.ui.theme.*

@Composable
fun RegisterSuccessScreen(
    userName: String,
    userEmail: String,
    onConfigureProfileClick: () -> Unit,
    onSkipClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(StelloraBackground)
    ) {
        Image(
            painter = painterResource(id = R.drawable.back_prof),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(StelloraBackground.copy(alpha = 0.5f))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight()
                    .border(1.dp, StelloraProfileBorder, RoundedCornerShape(24.dp))
                    .clip(RoundedCornerShape(24.dp))
                    .background(StelloraCardDarkBg.copy(alpha = 0.85f))
                    .padding(vertical = 28.dp, horizontal = 20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(60.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.star_icon),
                            contentDescription = null,
                            modifier = Modifier
                                .size(70.dp)
                                .offset(x = 28.dp, y = (-12).dp)
                        )

                        Text(
                            text = "Stellora",
                            fontSize = 26.sp,
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

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Акаунт створено!",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )

                    Text(
                        text = "Твоя подорож серед зірок починається ✦",
                        fontSize = 12.sp,
                        color = StelloraTextSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                    )

                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .border(1.5.dp, StelloraProfileBorder, CircleShape)
                            .background(StelloraPrimaryPurple.copy(alpha = 0.3f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✓",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = StelloraQuickActionText
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Вітаємо у Stellora, $userName!",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = StelloraQuickActionText,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Розкажи трохи про себе, щоб ми зробили твою подорож особливою.",
                        fontSize = 12.sp,
                        color = StelloraTextSecondary,
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

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
                    onClick = { onConfigureProfileClick() },
                    modifier = Modifier.fillMaxSize(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                ) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "Увійти в акаунт",
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

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Пізніше, перейти до Stellora",
                fontSize = 12.sp,
                color = StelloraSoftPurple,
                textDecoration = TextDecoration.Underline,
                modifier = Modifier.clickable { onSkipClick() }
            )
        }
    }
}