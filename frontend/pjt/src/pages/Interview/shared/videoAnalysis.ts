import type { ExpressionData } from '../RealMode/RealMode.types';

const ensureTopThreeEmotions = (items: { emotion: string; percent: number }[]) => {
  const result = [...items];
  while (result.length < 3) {
    result.push({ emotion: 'neutral', percent: 0 });
  }
  return result;
};

export const summarizeEmotions = (entries: ExpressionData[]) => {
  if (entries.length === 0) {
    return { mainEmotion: 'neutral', emotionTop3: ensureTopThreeEmotions([]) };
  }

  const totalEntries = Math.max(1, entries.length);
  const emotionCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    const sorted = Object.entries(entry.expressions).sort((a, b) => b[1] - a[1]);
    const [topEmotion, topScore] = sorted[0];
    const neutralScore = entry.expressions.neutral || 0;
    const dominant = topEmotion === 'neutral' || topScore - neutralScore < 0.1 ? 'neutral' : topEmotion;
    acc[dominant] = (acc[dominant] || 0) + 1;
    return acc;
  }, {});

  const sortedEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({ emotion, count, percent: Math.round((count / totalEntries) * 100) }))
    .sort((a, b) => b.count - a.count);

  const prioritized = [...sortedEmotions.filter(item => item.emotion !== 'neutral'), ...sortedEmotions.filter(item => item.emotion === 'neutral')];

  const strongEmotion = prioritized.find(item => item.percent >= 15);
  const mainEmotion = strongEmotion?.emotion || prioritized[0]?.emotion || 'neutral';
  const emotionTop3 = ensureTopThreeEmotions(prioritized.slice(0, 3));

  return { mainEmotion, emotionTop3 };
};

export const buildVideoSummaryPayload = (turnId: number, interviewIdValue: number, duration: number, entries: ExpressionData[]) => {
  const totalEntries = entries.length;
  const safeDuration = Math.max(1, Math.round(duration));
  const avgScore = totalEntries > 0 ? entries.reduce((sum, entry) => sum + entry.score, 0) / totalEntries : 0;
  const normalizedScore = Math.min(100, Math.max(0, Math.round(avgScore)));
  const avgEyeContact = totalEntries > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.eyeContactScore, 0) / totalEntries) : normalizedScore;
  const avgPose = totalEntries > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.poseStabilityScore, 0) / totalEntries) : normalizedScore;
  const avgMovement = totalEntries > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.movementScore, 0) / totalEntries) : normalizedScore;
  const { mainEmotion, emotionTop3 } = summarizeEmotions(entries);

  return {
    interview_id: interviewIdValue,
    turn_id: turnId,
    summary: {
      duration: safeDuration,
      eyeContactScore: avgEyeContact,
      poseStabilityScore: avgPose,
      movementScore: avgMovement,
      mainEmotion,
      emotionTop3,
    }
  };
};