export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Underline
    .replace(/_(.*?)_/g, '$1')       // Italic
    .replace(/#(.*?)\n/g, '$1\n')    // Headers
    .replace(/`(.*?)`/g, '$1')       // Code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/^\s*[-*+]\s+/gm, '')   // Bullet points
    .trim();
}

export function chunkResponse(text: string): string[] {
  const clean = stripMarkdown(text);
  // Split by sentence endings (. ! ?) followed by a space or newline
  const chunks = clean.match(/[^.!?]+[.!?]+(?:\s|\n|$)|[^.!?]+$/g) || [clean];
  return chunks.map(c => c.trim()).filter(c => c.length > 0);
}

export function validateHealthInput(type: 'water' | 'steps' | 'sleep', value: number): string | null {
  if (isNaN(value) || value < 0) return 'Please enter a valid positive number';
  if (type === 'water' && value > 15000) return 'Water intake seems unusually high (max 15L)';
  if (type === 'steps' && value > 100000) return 'Step count seems unusually high (max 100k)';
  if (type === 'sleep' && value > 24) return 'Sleep cannot exceed 24 hours';
  return null;
}

export function getInstantTip(daily: { waterMl?: number; steps?: number; sleepHours?: number; mood?: number }): string {
  if ((daily.waterMl || 0) < 1000) return "You're running low on water today. Drink a glass right now to boost your energy and metabolism.";
  if ((daily.sleepHours || 0) > 0 && (daily.sleepHours || 0) < 6) return "With less than 6 hours of sleep, your body needs extra recovery. Keep your workout light today.";
  if ((daily.steps || 0) < 3000) return "You've been quite stationary today. A quick 10-minute walk can significantly improve your circulation and focus.";
  if ((daily.mood || 3) <= 2) return "Feeling low? Studies show a short stretching session or a walk outside can instantly release endorphins and improve mood.";
  return "You are hitting your marks today! Consistency is the secret to long-term health. Keep up the great work.";
}