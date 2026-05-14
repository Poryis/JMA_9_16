// Sticker definitions for the Jellybones Sticker Book.
// All stickers are driven by in-app events; 100% local (localStorage).
// Each sticker has: id, name, icon (url to existing asset), color, hint text,
// and an optional `category` for grid grouping.

export const STICKER_CATEGORIES = [
  { id: 'characters', label: 'Meet the Band' },
  { id: 'outfits',    label: 'Outfit Collection' },
  { id: 'instruments', label: 'Instruments' },
  { id: 'bells', label: 'Jellybells' },
  { id: 'songs', label: 'Song Champion' },
  { id: 'achievements', label: 'Achievements' },
];

export const STICKERS = [
  // ---- Characters (earned first time you interact with each on home page) ----
  { id: 'char_finn',      name: 'Finn',            category: 'characters', icon: 'assets/characters/finn-danger.png',     color: '#FF3B30', hint: 'Meet Finn on the home page' },
  { id: 'char_charlie',   name: 'Charlie',         category: 'characters', icon: 'assets/characters/charlie-polliwog.png', color: '#34A853', hint: 'Meet Charlie on the home page' },
  { id: 'char_chunk',     name: 'Chunk',           category: 'characters', icon: 'assets/characters/chunk.png',           color: '#9B59B6', hint: 'Meet Chunk on the home page' },
  { id: 'char_jazzy',     name: 'Jazzy',           category: 'characters', icon: 'assets/characters/jazzy.png',            color: '#FF9500', hint: 'Meet Jazzy on the home page' },
  { id: 'char_doctor',    name: 'Dr. Jellybone',   category: 'characters', icon: 'assets/characters/dr-jellybone.png',     color: '#4285F4', hint: 'Meet Dr. Jellybone on the home page' },
  { id: 'char_loustew',   name: 'Lou & Stew',      category: 'characters', icon: 'assets/characters/llama-lou-stew.png',         color: '#AF52DE', hint: 'Meet Lou & Stew on the home page' },

  // ---- Outfits (alternate looks of the characters, unlocked via gameplay milestones) ----
  // CHARLIE looks
  { id: 'fit_charlie_zoot',       name: 'Zoot Charlie',        category: 'outfits', icon: 'assets/characters/charlie-zoot.png',        color: '#C0392B', hint: 'Play the Xylophone in Jam Hall' },
  { id: 'fit_charlie_punk',       name: 'Punk Charlie',        category: 'outfits', icon: 'assets/characters/charlie-punk.png',        color: '#E91E63', hint: 'Hit a streak of 15 in the Rhythm Arcade' },
  { id: 'fit_charlie_ragu',       name: 'Ragu Charlie',        category: 'outfits', icon: 'assets/characters/charlie-ragu.png',        color: '#E67E22', hint: 'Complete any song in Turbo speed' },
  { id: 'fit_charlie_surf',       name: 'Surf Charlie',        category: 'outfits', icon: 'assets/characters/charlie-surf.png',        color: '#3498DB', hint: 'Play 3 loops in the Beat Lab' },
  { id: 'fit_charlie_grad',       name: 'Grad Charlie',        category: 'outfits', icon: 'assets/characters/charlie-grad.png',        color: '#2C3E50', hint: 'Beat Stew Kazoo Says level 8' },
  { id: 'fit_charlie_rundmc',     name: 'DMC Charlie',         category: 'outfits', icon: 'assets/characters/charlie-rundmc.png',     color: '#F1C40F', hint: 'Make a Beat Lab loop with 3+ drum tracks' },
  { id: 'fit_charlie_disco',      name: 'Disco Charlie',       category: 'outfits', icon: 'assets/characters/charlie-disco.png',       color: '#FF6B9D', hint: 'Play a Beat Lab loop at 140+ BPM' },
  { id: 'fit_charlie_drum_major', name: 'Drum Major Charlie',  category: 'outfits', icon: 'assets/characters/charlie-drum-major.png',  color: '#4285F4', hint: 'Play the drum kit in Jam Hall' },
  { id: 'fit_charlie_steampunk',  name: 'Steampunk Charlie',   category: 'outfits', icon: 'assets/characters/charlie-steampunk.png',   color: '#8B4513', hint: 'Complete all 5 JMA Originals' },
  // CHUNK looks
  { id: 'fit_chunk_disco',        name: 'Disco Chunk',         category: 'outfits', icon: 'assets/characters/chunk-disco.png',         color: '#FF6B9D', hint: 'Play a Beat Lab loop for 30 seconds' },
  { id: 'fit_chunk_steampunk',    name: 'Steampunk Chunk',     category: 'outfits', icon: 'assets/characters/chunk-steampunk.png',     color: '#654321', hint: 'Record and play back 10 notes in Jam Hall' },
  // SHARKY looks
  { id: 'fit_sharky_hiphop',      name: 'Hip-Hop Sharky',      category: 'outfits', icon: 'assets/characters/sharky-hiphop.png',      color: '#F39C12', hint: 'Score 1000 points in the Rhythm Arcade' },
  { id: 'fit_sharky_snorkel',     name: 'Snorkel Sharky',      category: 'outfits', icon: 'assets/characters/sharky-snorkel.png',     color: '#1ABC9C', hint: 'Play Ear Quest 10 times' },
  { id: 'fit_sharky_zoot',        name: 'Zoot Sharky',         category: 'outfits', icon: 'assets/characters/sharky-zoot.png',        color: '#27AE60', hint: 'Play the Piano in Jam Hall' },
  // JAZZY looks
  { id: 'fit_jazzy_disco',        name: 'Disco Jazzy',         category: 'outfits', icon: 'assets/characters/jazzy-disco.png',        color: '#FF1493', hint: 'Complete 10 songs total' },
  // LOU & STEW looks
  { id: 'fit_lou_disco',          name: 'Disco Lou',           category: 'outfits', icon: 'assets/characters/lou-disco.png',          color: '#D35400', hint: 'Complete Goody Bag in the Rhythm Game' },
  { id: 'fit_stew_swing',         name: 'Swing Stew',          category: 'outfits', icon: 'assets/characters/stew-swing.png',         color: '#16A085', hint: 'Complete Faster As We Go in the Rhythm Game' },

  // ---- Instruments (earned by playing each one in Jam Hall) ----
  { id: 'inst_bells',     name: 'Jelly Bells',     category: 'instruments', icon: 'assets/bells/C 1.png',       color: '#FF3B30', hint: 'Play the Jelly Bells in Jam Hall' },
  { id: 'inst_xylo',      name: 'Xylophone',       category: 'instruments', icon: 'assets/bells/G 1.png',       color: '#34A853', hint: 'Play the Xylophone in Jam Hall' },
  { id: 'inst_piano',     name: 'Piano',           category: 'instruments', icon: 'assets/bells/A 1.png',       color: '#4285F4', hint: 'Play the Piano in Jam Hall' },
  { id: 'inst_drums',     name: 'Drum Kit',        category: 'instruments', icon: 'assets/drums/Snare 1.png',  color: '#E74C3C', hint: 'Play the Drums in Jam Hall' },

  // ---- Jellybells (earned first time you play each bell) ----
  { id: 'bell_C',         name: 'Do',              category: 'bells', icon: 'assets/bells/C 2.png', color: '#FF3B30', hint: 'Play Do (key 1)' },
  { id: 'bell_D',         name: 'Re',              category: 'bells', icon: 'assets/bells/D 2.png', color: '#FF9500', hint: 'Play Re (key 2)' },
  { id: 'bell_E',         name: 'Mi',              category: 'bells', icon: 'assets/bells/E 2.png', color: '#FFCC00', hint: 'Play Mi (key 3)' },
  { id: 'bell_F',         name: 'Fa',              category: 'bells', icon: 'assets/bells/F 2.png', color: '#4CD964', hint: 'Play Fa (key 4)' },
  { id: 'bell_G',         name: 'So',              category: 'bells', icon: 'assets/bells/G 2.png', color: '#34A853', hint: 'Play So (key 5)' },
  { id: 'bell_A',         name: 'La',              category: 'bells', icon: 'assets/bells/A 2.png', color: '#4285F4', hint: 'Play La (key 6)' },
  { id: 'bell_B',         name: 'Ti',              category: 'bells', icon: 'assets/bells/B 2.png', color: '#AF52DE', hint: 'Play Ti (key 7)' },
  { id: 'bell_HC',        name: 'High Do',         category: 'bells', icon: 'assets/bells/C 2.png', color: '#FF2D55', hint: 'Play High Do (key 8)' },

  // ---- Songs (earned by completing each song in Rhythm Game) ----
  // IDs correspond to the song ids in /app/frontend/src/data/songs.js
  { id: 'song_twinkle',        name: 'Twinkle Twinkle',   category: 'songs', icon: 'assets/bells/C 1.png',   color: '#FFCC00', hint: 'Complete Twinkle Twinkle' },
  { id: 'song_mary',           name: 'Mary Had a Lamb',   category: 'songs', icon: 'assets/bells/E 1.png',   color: '#4CD964', hint: 'Complete Mary Had a Lamb' },
  { id: 'song_hot_cross',      name: 'Hot Cross Buns',    category: 'songs', icon: 'assets/bells/E 1.png',   color: '#FF9500', hint: 'Complete Hot Cross Buns' },
  { id: 'song_row_boat',       name: 'Row Your Boat',     category: 'songs', icon: 'assets/bells/G 1.png',   color: '#34A853', hint: 'Complete Row Your Boat' },
  { id: 'song_old_macdonald',  name: 'Old MacDonald',     category: 'songs', icon: 'assets/bells/A 1.png',   color: '#4285F4', hint: 'Complete Old MacDonald' },
  { id: 'song_jingle_bells',   name: 'Jingle Bells',      category: 'songs', icon: 'assets/bells/B 1.png',   color: '#AF52DE', hint: 'Complete Jingle Bells' },
  { id: 'song_ode_joy',        name: 'Ode to Joy',        category: 'songs', icon: 'assets/bells/E 1.png',   color: '#FFCC00', hint: 'Complete Ode to Joy' },
  { id: 'song_happy_birthday', name: 'Happy Birthday',    category: 'songs', icon: 'assets/bells/G 1.png',   color: '#FF3B30', hint: 'Complete Happy Birthday' },
  { id: 'song_when_saints',    name: 'When the Saints',   category: 'songs', icon: 'assets/bells/C 1.png',   color: '#FF9500', hint: 'Complete When the Saints' },
  { id: 'song_amazing_grace',  name: 'Amazing Grace',     category: 'songs', icon: 'assets/bells/F 1.png',   color: '#4CD964', hint: 'Complete Amazing Grace' },
  { id: 'song_london_bridge',  name: 'London Bridge',     category: 'songs', icon: 'assets/bells/G 1.png',   color: '#4285F4', hint: 'Complete London Bridge' },
  { id: 'song_itsy_bitsy',     name: 'Itsy Bitsy Spider', category: 'songs', icon: 'assets/bells/D 1.png',   color: '#AF52DE', hint: 'Complete Itsy Bitsy Spider' },

  // ---- Achievements (milestones across modes) ----
  { id: 'ach_first_note',    name: 'First Note!',        category: 'achievements', icon: 'assets/characters/finn-danger.png',     color: '#FFCC00', hint: 'Play your very first note' },
  { id: 'ach_one_kid_band',  name: 'One-Kid Band',       category: 'achievements', icon: 'assets/characters/chunk.png',           color: '#9B59B6', hint: 'Play all 4 instruments in Jam Hall' },
  { id: 'ach_streak_10',     name: 'Streak of 10!',      category: 'achievements', icon: 'assets/characters/jazzy.png',            color: '#FF9500', hint: 'Hit 10 notes in a row' },
  { id: 'ach_streak_25',     name: 'Streak of 25!',      category: 'achievements', icon: 'assets/characters/jazzy.png',            color: '#FF3B30', hint: 'Hit 25 notes in a row' },
  { id: 'ach_simon_5',       name: 'Super Ear',          category: 'achievements', icon: 'assets/characters/dr-jellybone.png',     color: '#4285F4', hint: 'Beat level 5 in Stew Kazoo Says' },
  { id: 'ach_ear_trainer',   name: 'Golden Ears',        category: 'achievements', icon: 'assets/characters/dr-jellybone.png',     color: '#FFCC00', hint: 'Score 5 correct in Ear Quest' },
  { id: 'ach_beat_maker',    name: 'Beat Maker',         category: 'achievements', icon: 'assets/characters/chunk.png',           color: '#E74C3C', hint: 'Play a loop in the Beat Lab' },
  { id: 'ach_song_5',        name: 'Song Collector',     category: 'achievements', icon: 'assets/characters/charlie-polliwog.png', color: '#34A853', hint: 'Complete 5 songs in Rhythm Game' },
  { id: 'ach_fact_finder',   name: 'Fact Finder',        category: 'achievements', icon: 'assets/characters/dr-jellybone.png',     color: '#AF52DE', hint: 'Learn 10 music facts on the home page' },
];

// Build a quick lookup map.
export const STICKER_MAP = Object.fromEntries(STICKERS.map(s => [s.id, s]));
