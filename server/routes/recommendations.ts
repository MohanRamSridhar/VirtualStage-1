import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Helper function to calculate similarity score between events
function calculateSimilarityScore(event1: any, event2: any): number {
  let score = 0;
  
  // Genre similarity (highest weight)
  if (event1.genre === event2.genre) score += 3;
  
  // Type similarity
  if (event1.type === event2.type) score += 2;
  
  // Environment similarity
  if (event1.environment === event2.environment) score += 1;
  
  // Tags similarity with weighted scoring
  const commonTags = event1.tags.filter((tag: string) => event2.tags.includes(tag));
  score += commonTags.length * 0.5;
  
  // Time of day similarity (for live events)
  if (event1.isLive && event2.isLive) {
    const time1 = new Date(event1.date).getHours();
    const time2 = new Date(event2.date).getHours();
    const timeDiff = Math.abs(time1 - time2);
    if (timeDiff <= 2) score += 1; // Events within 2 hours of each other
  }
  
  // Duration similarity
  const durationDiff = Math.abs(event1.duration - event2.duration);
  if (durationDiff <= 30) score += 0.5; // Events within 30 minutes of each other
  
  return score;
}

// Helper function to analyze user preferences
function analyzeUserPreferences(history: any[]): {
  favoriteGenres: string[];
  favoriteTypes: string[];
  favoriteArtists: string[];
  preferredEnvironments: string[];
  preferredDuration: number;
  preferredTimeOfDay: number;
} {
  const preferences = {
    genres: new Map<string, number>(),
    types: new Map<string, number>(),
    artists: new Map<string, number>(),
    environments: new Map<string, number>(),
    durations: [] as number[],
    timesOfDay: [] as number[]
  };
  
  history.forEach(event => {
    // Weight recent events more heavily
    const daysAgo = (Date.now() - new Date(event.interaction_date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.exp(-daysAgo / 30); // Exponential decay over 30 days
    
    // Weight positive reactions more heavily
    const reactionWeight = event.reaction_type === 'like' ? 1.5 : 
                          event.reaction_type === 'love' ? 2 : 1;
    
    const weight = recencyWeight * reactionWeight;
    
    // Update preference maps
    preferences.genres.set(
      event.genre,
      (preferences.genres.get(event.genre) || 0) + weight
    );
    
    preferences.types.set(
      event.type,
      (preferences.types.get(event.type) || 0) + weight
    );
    
    preferences.artists.set(
      event.artist,
      (preferences.artists.get(event.artist) || 0) + weight
    );
    
    preferences.environments.set(
      event.environment,
      (preferences.environments.get(event.environment) || 0) + weight
    );
    
    preferences.durations.push(event.duration);
    preferences.timesOfDay.push(new Date(event.date).getHours());
  });
  
  // Get top preferences
  const getTopItems = (map: Map<string, number>, count: number) => 
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  
  // Calculate average duration and preferred time of day
  const avgDuration = preferences.durations.reduce((a, b) => a + b, 0) / preferences.durations.length;
  const avgTimeOfDay = preferences.timesOfDay.reduce((a, b) => a + b, 0) / preferences.timesOfDay.length;
  
  return {
    favoriteGenres: getTopItems(preferences.genres, 3),
    favoriteTypes: getTopItems(preferences.types, 2),
    favoriteArtists: getTopItems(preferences.artists, 3),
    preferredEnvironments: getTopItems(preferences.environments, 2),
    preferredDuration: Math.round(avgDuration),
    preferredTimeOfDay: Math.round(avgTimeOfDay)
  };
}

// Get personalized recommendations for a user
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user's event history with reactions
    const userHistory = await db.query(`
      SELECT e.*, r.reaction_type, r.created_at as interaction_date
      FROM events e
      JOIN reactions r ON e.id = r.event_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    
    if (userHistory.rows.length === 0) {
      // If no history, return popular events
      const popularEvents = await db.query(`
        SELECT e.*, COUNT(r.id) as reaction_count
        FROM events e
        LEFT JOIN reactions r ON e.id = r.event_id
        WHERE e.date > NOW()
        GROUP BY e.id
        ORDER BY reaction_count DESC
        LIMIT 6
      `);
      return res.json(popularEvents.rows);
    }
    
    // Analyze user preferences
    const preferences = analyzeUserPreferences(userHistory.rows);
    
    // Get all upcoming events
    const upcomingEvents = await db.query(`
      SELECT * FROM events 
      WHERE date > NOW() 
      AND id NOT IN (
        SELECT event_id FROM reactions WHERE user_id = $1
      )
    `, [userId]);
    
    // Calculate recommendation scores for each event
    const scoredEvents = upcomingEvents.rows.map(event => {
      let totalScore = 0;
      
      // Calculate similarity with each event in user's history
      userHistory.rows.forEach(historyEvent => {
        const similarityScore = calculateSimilarityScore(event, historyEvent);
        
        // Weight recent interactions more heavily
        const daysAgo = (Date.now() - new Date(historyEvent.interaction_date).getTime()) / (1000 * 60 * 60 * 24);
        const recencyWeight = Math.exp(-daysAgo / 30); // Exponential decay over 30 days
        
        // Weight positive reactions more heavily
        const reactionWeight = historyEvent.reaction_type === 'like' ? 1.5 : 
                             historyEvent.reaction_type === 'love' ? 2 : 1;
        
        totalScore += similarityScore * recencyWeight * reactionWeight;
      });
      
      // Add preference-based scoring
      if (preferences.favoriteGenres.includes(event.genre)) totalScore += 2;
      if (preferences.favoriteTypes.includes(event.type)) totalScore += 1.5;
      if (preferences.favoriteArtists.includes(event.artist)) totalScore += 2;
      if (preferences.preferredEnvironments.includes(event.environment)) totalScore += 1;
      
      // Consider duration preference
      const durationDiff = Math.abs(event.duration - preferences.preferredDuration);
      if (durationDiff <= 30) totalScore += 0.5;
      
      // Consider time of day preference
      const eventHour = new Date(event.date).getHours();
      const timeDiff = Math.abs(eventHour - preferences.preferredTimeOfDay);
      if (timeDiff <= 2) totalScore += 0.5;
      
      // Boost score for live events if user prefers them
      const liveEventRatio = userHistory.rows.filter(e => e.isLive).length / userHistory.rows.length;
      if (event.isLive && liveEventRatio > 0.5) totalScore += 1;
      
      return { 
        ...event, 
        recommendationScore: totalScore,
        matchReasons: {
          genre: preferences.favoriteGenres.includes(event.genre),
          type: preferences.favoriteTypes.includes(event.type),
          artist: preferences.favoriteArtists.includes(event.artist),
          environment: preferences.preferredEnvironments.includes(event.environment),
          duration: Math.abs(event.duration - preferences.preferredDuration) <= 30,
          timeOfDay: Math.abs(new Date(event.date).getHours() - preferences.preferredTimeOfDay) <= 2,
          live: event.isLive && liveEventRatio > 0.5
        }
      };
    });
    
    // Sort by recommendation score and return top 6
    const recommendations = scoredEvents
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
});

export default router; 