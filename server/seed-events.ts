import { db } from './db';

const sampleEvents = [
  {
    title: "Neon Dreams Electronic Festival",
    description: "Experience the ultimate electronic music festival in a futuristic neon-lit virtual stadium.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    duration: 180,
    type: "concert",
    genre: "electronic",
    artist: "Digital Pulse Collective",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    environment: "stadium",
    is_live: false,
    is_premium: false,
    tags: ["electronic", "dance", "festival", "night"],
    spatial_audio: true
  },
  {
    title: "Classical Symphony Under the Stars",
    description: "A breathtaking classical concert featuring the works of Mozart, Beethoven, and Bach under a starry night sky.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    duration: 120,
    type: "concert",
    genre: "classical",
    artist: "Virtual Symphony Orchestra",
    thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    environment: "outdoor_amphitheater",
    is_live: false,
    is_premium: true,
    tags: ["classical", "symphony", "orchestra"],
    spatial_audio: true
  },
  {
    title: "Virtual Art Gallery Opening: Future Visions",
    description: "Explore cutting-edge digital artworks in an immersive gallery space, featuring works from the world's most innovative digital artists.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 90,
    type: "exhibition",
    genre: "digital art",
    artist: "Various Digital Artists",
    thumbnail: "https://images.unsplash.com/photo-1531058020387-3be344556be6",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    environment: "gallery",
    is_live: false,
    is_premium: false,
    tags: ["art", "exhibition", "digital", "interactive"],
    spatial_audio: false
  },
  {
    title: "Rock Legends Reunion",
    description: "The biggest rock legends come together for a one-night-only virtual concert experience.",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    duration: 150,
    type: "concert",
    genre: "rock",
    artist: "The Rock Legends",
    thumbnail: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    environment: "arena",
    is_live: true,
    is_premium: true,
    tags: ["rock", "live", "concert", "legends", "streaming"],
    spatial_audio: true,
    streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-concert-stage-with-lights-1010-large.mp4"
  },
  {
    title: "Jazz in the Virtual Club",
    description: "An intimate jazz performance in a faithfully recreated 1920s jazz club environment.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration: 120,
    type: "concert",
    genre: "jazz",
    artist: "The Virtual Jazz Quartet",
    thumbnail: "https://images.unsplash.com/photo-1511192336575-5a79af67a629",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    environment: "club",
    is_live: false,
    is_premium: false,
    tags: ["jazz", "club", "intimate", "night"],
    spatial_audio: true
  }
];

async function seedEvents() {
  try {
    // Clear existing events
    await db.query('DELETE FROM events');
    
    // Insert sample events
    for (const event of sampleEvents) {
      await db.query(
        `INSERT INTO events (
          title, description, date, duration, type, genre, artist,
          thumbnail, video_url, environment, is_live, is_premium,
          tags, spatial_audio, stream_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          event.title,
          event.description,
          event.date,
          event.duration,
          event.type,
          event.genre,
          event.artist,
          event.thumbnail,
          event.video_url,
          event.environment,
          event.is_live,
          event.is_premium,
          event.tags,
          event.spatial_audio,
          event.streamUrl
        ]
      );
    }
    
    console.log('Successfully seeded events table');
  } catch (error) {
    console.error('Error seeding events:', error);
  }
}

seedEvents(); 