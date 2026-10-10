import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points, correctAnswers, totalCards, accuracy } = await req.json();

    if (!points) {
      return Response.json({ error: 'Points required' }, { status: 400 });
    }

    const currentPoints = user.points || 0;
    const newPoints = currentPoints + points;
    const newLevel = Math.floor(newPoints / 1000) + 1;

    const updateData = {
      points: newPoints,
      level: newLevel,
      total_cards_studied: (user.total_cards_studied || 0) + (totalCards || 0),
    };

    // Check for new badges
    const currentBadges = user.badges || [];
    const newBadges = [...currentBadges];

    // Study milestone badges
    if (!newBadges.includes('cards_100') && updateData.total_cards_studied >= 100) {
      newBadges.push('cards_100');
    }
    if (!newBadges.includes('cards_500') && updateData.total_cards_studied >= 500) {
      newBadges.push('cards_500');
    }
    if (!newBadges.includes('cards_1000') && updateData.total_cards_studied >= 1000) {
      newBadges.push('cards_1000');
    }

    // Level badges
    if (!newBadges.includes('level_5') && newLevel >= 5) {
      newBadges.push('level_5');
    }
    if (!newBadges.includes('level_10') && newLevel >= 10) {
      newBadges.push('level_10');
    }

    // Perfect score badge
    if (!newBadges.includes('perfect_test') && accuracy === 100) {
      newBadges.push('perfect_test');
    }

    // Streak badges
    const streak = user.study_streak || 0;
    if (!newBadges.includes('streak_3') && streak >= 3) {
      newBadges.push('streak_3');
    }
    if (!newBadges.includes('streak_7') && streak >= 7) {
      newBadges.push('streak_7');
    }
    if (!newBadges.includes('streak_30') && streak >= 30) {
      newBadges.push('streak_30');
    }

    if (newBadges.length > currentBadges.length) {
      updateData.badges = newBadges;
    }

    await base44.entities.User.update(user.id, updateData);

    return Response.json({
      success: true,
      newPoints,
      newLevel,
      earnedBadges: newBadges.filter(b => !currentBadges.includes(b)),
    });
  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});