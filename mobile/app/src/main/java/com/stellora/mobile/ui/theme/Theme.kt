package com.stellora.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val StelloraColorScheme = darkColorScheme(
    primary = StelloraAccentPurple,
    secondary = StelloraPrimaryPurple,
    tertiary = StelloraTextMain,
    background = StelloraBackground,
    surface = StelloraCardBg,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = StelloraTextSecondary,
    onSurface = StelloraTextMain,
    error = StelloraErrorColor
)

@Composable
fun StelloraMobileTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = StelloraColorScheme,
        typography = Typography,
        content = content
    )
}