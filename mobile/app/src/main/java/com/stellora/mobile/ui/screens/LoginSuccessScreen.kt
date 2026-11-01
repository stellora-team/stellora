package com.stellora.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stellora.mobile.R
import com.stellora.mobile.ui.theme.*

@Composable
fun LoginSuccessScreen(
    userEmail: String,
    onContinueClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(StelloraBackground)
    ) {
        Image(
            painter = painterResource(id = R.drawable.back_log),
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
                    .height(70.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.star_icon),
                    contentDescription = null,
                    modifier = Modifier
                        .size(85.dp)
                        .offset(x = 32.dp, y = (-15).dp)
                )

                Text(
                    text = "Stellora",
                    fontSize = 28.sp,
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

            Spacer(modifier = Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .border(1.dp, StelloraProfileBorder, RoundedCornerShape(24.dp))
                    .clip(RoundedCornerShape(24.dp))
                    .background(StelloraCardDarkBg.copy(alpha = 0.85f))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .border(2.dp, StelloraProfileBorder, CircleShape)
                            .background(StelloraPrimaryPurple.copy(alpha = 0.4f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✓",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = StelloraQuickActionText
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "Ти серед своїх зірок!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = StelloraQuickActionText,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Вхід виконано успішно. Твоя подорож зі Stellora триває ✨",
                        fontSize = 13.sp,
                        color = StelloraTextSecondary,
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Box(
                        modifier = Modifier
                            .height(36.dp)
                            .border(1.dp, StelloraFieldBorder, RoundedCornerShape(18.dp))
                            .background(StelloraIconBoxBg, RoundedCornerShape(18.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = userEmail,
                            fontSize = 12.sp,
                            color = StelloraQuickActionText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { onContinueClick() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = StelloraPrimaryPurple)
            ) {
                Text(
                    text = "Продовжити →",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = StelloraQuickActionText
                )
            }
        }
    }
}