package com.stellora.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stellora.mobile.R
import com.stellora.mobile.ui.theme.StelloraBackground
import com.stellora.mobile.viewmodel.MainViewModel
import com.stellora.mobile.ui.theme.*
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

@Composable
fun MainScreen(
    viewModel: MainViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    onProfileClick: () -> Unit,
    onNewTaskClick: () -> Unit,
    onNewGoalClick: () -> Unit,
    onNewHabitClick: () -> Unit,
    onPlannerClick: () -> Unit,
    onSpaceBannerClick: () -> Unit,
    onJournalClick: () -> Unit = {},
    onCheckClick: () -> Unit = {},
    onStatsClick: () -> Unit = {},
    onBackClick: () -> Unit = {}
) {
    val scrollState = rememberScrollState()

    var isPopupMenuVisible by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(StelloraBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .padding(bottom = 110.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .height(52.dp)
                    .background(StelloraHeaderBg, RoundedCornerShape(10.dp))
                    .border(1.dp, StelloraBorderPurple, RoundedCornerShape(10.dp))
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(contentAlignment = Alignment.CenterStart) {
                    Text(
                        text = "Stellora",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = StelloraSubtextPurple
                    )
                    Image(
                        painter = painterResource(id = R.drawable.star_icon),
                        contentDescription = null,
                        modifier = Modifier
                            .size(50.dp)
                            .offset(x = 35.dp, y = (-9).dp)
                    )
                }

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .border(1.dp, StelloraDeepPurple, CircleShape)
                        .background(StelloraDeepPurple, CircleShape)
                        .clickable { onProfileClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_profile_user),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(230.dp)
                    .border(1.dp, StelloraBorderPurple, RoundedCornerShape(10.dp))
                    .clip(RoundedCornerShape(10.dp))
            ) {
                Image(
                    painter = painterResource(id = R.drawable.back_greeting_card),
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                Box(modifier = Modifier.fillMaxSize().background(StelloraBackground.copy(alpha = 0.4f)))

                Image(
                    painter = painterResource(id = R.drawable.star_icon),
                    contentDescription = null,
                    modifier = Modifier.size(100.dp).align(Alignment.TopEnd).offset(x = -60.dp, y = 5.dp)
                )

                Column(
                    modifier = Modifier.fillMaxSize().padding(20.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Вітаємо,\n${viewModel.username}!",
                            fontSize = 30.sp,
                            fontWeight = FontWeight.Bold,
                            color = StelloraLightText,
                            lineHeight = 36.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Нехай сьогоднішній день\nнаблизить тебе до твоїх цілей.",
                            fontSize = 14.sp,
                            color = StelloraQuickActionText
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier.weight(1f).height(40.dp)
                                .background(StelloraCapsuleBg, RoundedCornerShape(8.dp))
                                .border(1.dp, StelloraCapsuleBorder, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = viewModel.currentDate, fontSize = 14.sp, color = StelloraQuickActionText)
                        }
                        Box(
                            modifier = Modifier.weight(1f).height(40.dp)
                                .background(StelloraCapsuleBg, RoundedCornerShape(8.dp))
                                .border(1.dp, StelloraCapsuleBorder, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = viewModel.currentTime, fontSize = 14.sp, color = StelloraQuickActionText)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(text = "Мій настрій", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = StelloraLightText)
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(StelloraCardDark, RoundedCornerShape(10.dp))
                    .border(1.dp, StelloraBorderPurple, RoundedCornerShape(10.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                MoodItem("Чудово", R.drawable.mood_happy, StelloraMoodHappy, viewModel.selectedMood == "Чудово") { viewModel.onMoodSelected("Чудово") }
                MoodItem("Добре", R.drawable.mood_smile, StelloraMoodSmile, viewModel.selectedMood == "Добре") { viewModel.onMoodSelected("Добре") }
                MoodItem("Нейтрально", R.drawable.mood_neutral, StelloraMoodNeutral, viewModel.selectedMood == "Нейтрально") { viewModel.onMoodSelected("Нейтрально") }
                MoodItem("Втомлено", R.drawable.mood_tired, StelloraMoodTired, viewModel.selectedMood == "Втомлено") { viewModel.onMoodSelected("Втомлено") }
                MoodItem("Сумно", R.drawable.mood_sad, StelloraMoodSad, viewModel.selectedMood == "Сумно") { viewModel.onMoodSelected("Сумно") }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(text = "Швидкі дії", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = StelloraQuickActionText)
            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    QuickActionCard(title = "Нове завдання", bgImageRes = R.drawable.ic_task, modifier = Modifier.weight(1f)) { onNewTaskClick() }
                    QuickActionCard(title = "Нова ціль", bgImageRes = R.drawable.ic_goal, modifier = Modifier.weight(1f)) { onNewGoalClick() }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    QuickActionCard(title = "Нова звичка", bgImageRes = R.drawable.ic_habit, modifier = Modifier.weight(1f)) { onNewHabitClick() }
                    QuickActionCard(title = "Планувальник", bgImageRes = R.drawable.ic_calendar, modifier = Modifier.weight(1f)) { onPlannerClick() }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .border(1.dp, StelloraSpaceBannerBorder, RoundedCornerShape(10.dp))
                    .clip(RoundedCornerShape(10.dp))
                    .clickable { onSpaceBannerClick() }
            ) {
                Image(painter = painterResource(id = R.drawable.back_space_banner), contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                Box(modifier = Modifier.fillMaxSize().background(StelloraSpaceOverlay.copy(alpha = 0.3f)))
                Row(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Мій космос", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = StelloraQuickActionText)
                    Text(text = "Перейти в космос →", fontSize = 14.sp, color = StelloraQuickActionText)
                }
            }
        }

        if (isPopupMenuVisible) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clickable(
                        indication = null,
                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
                    ) { isPopupMenuVisible = false }
            ) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(bottom = 85.dp, end = 16.dp)
                        .width(70.dp)
                        .background(StelloraCardDark, RoundedCornerShape(16.dp))
                        .border(1.dp, StelloraBorderPurple, RoundedCornerShape(16.dp))
                        .padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier.size(40.dp).clip(CircleShape).clickable { isPopupMenuVisible = false; onPlannerClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Image(painter = painterResource(id = R.drawable.ic_popup_planner), contentDescription = "Планувальник", modifier = Modifier.size(24.dp))
                        }

                        Box(
                            modifier = Modifier.size(40.dp).clip(CircleShape).clickable { isPopupMenuVisible = false; onNewGoalClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Image(painter = painterResource(id = R.drawable.ic_popup_goal), contentDescription = "Ціль", modifier = Modifier.size(24.dp))
                        }

                        Box(
                            modifier = Modifier.size(40.dp).clip(CircleShape).clickable { isPopupMenuVisible = false; onStatsClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Image(painter = painterResource(id = R.drawable.ic_popup_stats), contentDescription = "Статистика", modifier = Modifier.size(24.dp))
                        }

                        Box(
                            modifier = Modifier.size(40.dp).clip(CircleShape).clickable { isPopupMenuVisible = false; onProfileClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Image(painter = painterResource(id = R.drawable.ic_popup_profile), contentDescription = "Профіль", modifier = Modifier.size(24.dp))
                        }
                    }
                }
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 16.dp)
                .height(65.dp)
                .background(StelloraCardDark, RoundedCornerShape(32.dp))
                .border(1.4.dp, StelloraBorderPurple, RoundedCornerShape(32.dp))
                .padding(horizontal = 12.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                NavItem(
                    iconRes = R.drawable.ic_nav_home,
                    isSelected = !isPopupMenuVisible,
                    onClick = {
                        isPopupMenuVisible = false
                    }
                )

                NavItem(
                    iconRes = R.drawable.ic_nav_journal,
                    isSelected = false,
                    onClick = {
                        isPopupMenuVisible = false
                        onJournalClick()
                    }
                )

                NavItem(
                    iconRes = R.drawable.ic_nav_check,
                    isSelected = false,
                    onClick = {
                        isPopupMenuVisible = false
                        onCheckClick()
                    }
                )

                NavItem(
                    iconRes = R.drawable.ic_nav_star,
                    isSelected = false,
                    onClick = {
                        isPopupMenuVisible = false
                        onSpaceBannerClick()
                    }
                )

                Box(
                    modifier = Modifier
                        .size(width = if (isPopupMenuVisible) 54.dp else 40.dp, height = 44.dp)
                        .clip(RoundedCornerShape(22.dp))
                        .then(
                            if (isPopupMenuVisible) {
                                Modifier
                                    .background(StelloraPrimaryPurple.copy(alpha = 0.5f), RoundedCornerShape(22.dp))
                                    .border(1.dp, StelloraBorderPurple, RoundedCornerShape(22.dp))
                            } else {
                                Modifier
                            }
                        )
                        .clickable { isPopupMenuVisible = !isPopupMenuVisible },
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_nav_menu),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MoodItem(
    label: String,
    iconRes: Int,
    accentColor: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .background(accentColor.copy(alpha = if (isSelected) 0.3f else 0.12f), CircleShape)
                .border(1.4.dp, accentColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(28.dp)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = StelloraMoodText,
            maxLines = 1
        )
    }
}

@Composable
fun QuickActionCard(
    title: String,
    bgImageRes: Int,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(110.dp)
            .border(1.4.dp, StelloraBorderPurple, RoundedCornerShape(10.dp))
            .clip(RoundedCornerShape(10.dp))
            .clickable { onClick() }
    ) {
        Image(
            painter = painterResource(id = bgImageRes),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(StelloraBackground.copy(alpha = 0.3f))
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Text(
                text = title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = StelloraQuickActionText,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
fun NavItem(
    iconRes: Int,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(width = if (isSelected) 54.dp else 40.dp, height = 44.dp)
            .clip(RoundedCornerShape(22.dp))
            .then(
                if (isSelected) {
                    Modifier
                        .background(StelloraPrimaryPurple.copy(alpha = 0.5f), RoundedCornerShape(22.dp))
                        .border(1.dp, StelloraBorderPurple, RoundedCornerShape(22.dp))
                } else {
                    Modifier
                }
            )
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            if (isSelected) {
                Spacer(modifier = Modifier.height(2.dp))
                Box(
                    modifier = Modifier
                        .width(16.dp)
                        .height(2.dp)
                        .background(Color.White, RoundedCornerShape(1.dp))
                )
            }
        }
    }
}