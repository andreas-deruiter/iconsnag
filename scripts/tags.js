/**
 * Unified tag taxonomy for all icon sources.
 *
 * Each icon is assigned one or more tags based on its name, keywords,
 * and original category/group. This ensures consistent filtering
 * across all sources.
 */

// The canonical list of tags (order = display order)
export const TAG_LIST = [
  'Smileys',
  'Emotions',
  'People',
  'Hands',
  'Animals',
  'Nature',
  'Food & Drink',
  'Sports & Fitness',
  'Travel & Places',
  'Transport',
  'Weather',
  'Home',
  'Work & Office',
  'Education',
  'Health & Medical',
  'Finance',
  'Shopping',
  'Technology',
  'Communication',
  'Media',
  'Files & Folders',
  'UI & Interface',
  'Arrows',
  'Navigation & Maps',
  'Security',
  'Social',
  'Creative & Design',
  'Symbols & Math',
  'Flags',
  'Miscellaneous',
]

// Keywords → tag mapping. Uses word-boundary regex matching to prevent
// false positives (e.g. "rat" matching "rating").
// Checked against icon name (lowercased) and keywords array.
const KEYWORD_RULES = [
  // Smileys
  { keywords: ['smile', 'grin', 'laugh', 'wink', 'face with', 'face in', 'smiling', 'frown', 'pout', 'grimace', 'grimacing', 'yawn', 'sleepy face', 'expressionless', 'neutral face', 'dotted line face', 'monocle', 'mouth', 'tongue', 'rolling eyes', 'thinking face', 'shushing', 'melting', 'saluting', 'lying face', 'disguise'], tag: 'Smileys' },

  // Emotions
  { keywords: ['heart', 'love', 'kiss', 'anger', 'angry', 'sad', 'cry', 'tear', 'happy', 'joy', 'fear', 'scream', 'surprise', 'shock', 'confused', 'disappointed', 'worry', 'anxious', 'triumph', 'rage', 'skull', 'ghost', 'alien', 'robot face', 'demon', 'imp', 'emotion', 'mood', 'sentiment', 'star-struck', 'pleading', 'party', 'hot face', 'cold face', 'swear', 'exploding head', 'mind blown'], tag: 'Emotions' },

  // People
  { keywords: ['person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'baby', 'adult', 'older', 'family', 'couple', 'pregnant', 'beard', 'bald', 'user', 'users', 'avatar', 'portrait', 'human', 'walk', 'stand', 'kneel', 'superhero', 'supervillain', 'ninja', 'mage', 'fairy', 'vampire', 'zombie', 'elf', 'genie', 'merperson', 'troll', 'prince', 'princess', 'guard', 'detective', 'construction worker', 'farmer', 'mechanic', 'scientist', 'astronaut', 'firefighter', 'pilot', 'judge'], tag: 'People' },

  // Hands
  { keywords: ['hand', 'finger', 'thumb', 'wave', 'clap', 'palm', 'fist', 'pinch', 'grip', 'handshake', 'pray', 'gesture'], tag: 'Hands' },

  // Animals
  { keywords: ['animal', 'dog', 'cat', 'bird', 'fish', 'horse', 'bear', 'monkey', 'rabbit', 'fox', 'wolf', 'lion', 'tiger', 'elephant', 'mouse', 'rat', 'hamster', 'pig', 'cow', 'chicken', 'frog', 'turtle', 'snake', 'dragon', 'whale', 'dolphin', 'octopus', 'butterfly', 'ant', 'bee', 'ladybug', 'spider', 'scorpion', 'crab', 'shrimp', 'squid', 'snail', 'deer', 'goat', 'sheep', 'camel', 'llama', 'giraffe', 'zebra', 'rhino', 'hippo', 'crocodile', 'lizard', 'dinosaur', 'penguin', 'owl', 'eagle', 'parrot', 'swan', 'flamingo', 'peacock', 'dove', 'paw', 'pet', 'koala', 'panda', 'sloth', 'otter', 'gorilla', 'orangutan', 'chipmunk', 'beaver', 'bison', 'mammoth', 'hedgehog', 'badger', 'skunk', 'raccoon', 'seal', 'polar bear', 'dodo', 'feather', 'worm', 'cockroach', 'mosquito', 'cricket', 'beetle', 'caterpillar', 'dragonfly', 'lobster'], tag: 'Animals' },

  // Nature
  { keywords: ['nature', 'tree', 'plant', 'flower', 'leaf', 'herb', 'grass', 'forest', 'garden', 'seed', 'blossom', 'rose', 'tulip', 'sunflower', 'mushroom', 'cactus', 'evergreen', 'palm tree', 'clover', 'fallen leaf', 'maple', 'wood', 'branch', 'sprout', 'bouquet', 'wilted', 'lotus', 'earth', 'mountain', 'volcano', 'ocean', 'river', 'lake', 'rock', 'gem', 'crystal', 'diamond', 'moon', 'comet', 'rainbow', 'fire', 'water', 'droplet', 'snowflake', 'landscape', 'island', 'desert', 'sunrise', 'sunset', 'aurora'], tag: 'Nature' },

  // Food & Drink
  { keywords: ['food', 'drink', 'eat', 'fruit', 'vegetable', 'meat', 'bread', 'rice', 'noodle', 'pasta', 'pizza', 'burger', 'sandwich', 'taco', 'burrito', 'sushi', 'dumpling', 'cookie', 'cake', 'candy', 'chocolate', 'ice cream', 'donut', 'cupcake', 'coffee', 'tea', 'beer', 'wine', 'cocktail', 'juice', 'milk', 'bottle', 'cup', 'glass', 'fork', 'knife', 'spoon', 'chopstick', 'plate', 'bowl', 'apple', 'banana', 'grape', 'cherry', 'strawberry', 'peach', 'mango', 'lemon', 'watermelon', 'tomato', 'corn', 'carrot', 'pepper', 'onion', 'garlic', 'potato', 'egg', 'cheese', 'bacon', 'steak', 'poultry', 'lobster', 'restaurant', 'chef', 'kitchen', 'grill', 'oven', 'popcorn', 'pretzel', 'waffle', 'pancake', 'honey', 'salt', 'butter', 'salad', 'soup', 'stew', 'hot dog', 'fries'], tag: 'Food & Drink' },

  // Sports & Fitness
  { keywords: ['sport', 'fitness', 'gym', 'exercise', 'soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf', 'swim', 'ski', 'skate', 'surf', 'bike', 'cycling', 'yoga', 'martial', 'boxing', 'wrestling', 'medal', 'trophy', 'champion', 'athlete', 'stadium', 'cricket', 'rugby', 'hockey', 'volleyball', 'badminton', 'ping pong', 'bowling', 'archery', 'fencing', 'climbing', 'dumbbell', 'barbell', 'snowboard', 'sled', 'lacrosse', 'kayak', 'canoe', 'diving', 'water polo', 'handball', 'martial art', 'karate', 'judo', 'chess', 'dice', 'puzzle', 'joystick', 'gamepad', 'controller', 'bullseye', 'dart', 'billiard', 'fishing', 'camping', 'tent', 'hiking'], tag: 'Sports & Fitness' },

  // Travel & Places
  { keywords: ['travel', 'hotel', 'hospital', 'church', 'mosque', 'synagogue', 'temple', 'castle', 'palace', 'tower', 'bridge', 'fountain', 'statue', 'monument', 'landmark', 'city', 'town', 'village', 'zoo', 'museum', 'theater', 'cinema', 'airport', 'station', 'pier', 'beach', 'national park', 'japan', 'tokyo', 'moai', 'pyramid', 'kaaba'], tag: 'Travel & Places' },

  // Transport
  { keywords: ['car', 'truck', 'bus', 'train', 'plane', 'airplane', 'helicopter', 'rocket', 'ship', 'boat', 'ferry', 'canoe', 'sailboat', 'bicycle', 'motorcycle', 'scooter', 'taxi', 'ambulance', 'fire engine', 'police car', 'tractor', 'vehicle', 'transport', 'traffic', 'railway', 'metro', 'subway', 'tram', 'monorail', 'fuel', 'parking', 'wheel', 'tire', 'steering', 'ufo', 'satellite', 'forklift', 'crane', 'anchor', 'propeller', 'speedboat', 'yacht'], tag: 'Transport' },

  // Weather
  { keywords: ['weather', 'cloud', 'rain', 'snow', 'storm', 'thunder', 'lightning', 'wind', 'fog', 'mist', 'haze', 'tornado', 'hurricane', 'cyclone', 'temperature', 'thermometer', 'sunny', 'cloudy', 'overcast', 'drizzle', 'hail', 'umbrella', 'humid'], tag: 'Weather' },

  // Home
  { keywords: ['home', 'house', 'apartment', 'room', 'door', 'window', 'roof', 'stairs', 'elevator', 'bed', 'sofa', 'couch', 'chair', 'table', 'desk', 'lamp', 'bulb', 'fan', 'air condition', 'kitchen', 'bath', 'shower', 'toilet', 'sink', 'faucet', 'lawn', 'fence', 'garage', 'closet', 'drawer', 'shelf', 'curtain', 'pillow', 'blanket', 'towel', 'iron', 'vacuum', 'broom', 'laundry', 'washing machine', 'dryer', 'carpet', 'candle', 'vase', 'clock', 'mirror', 'cozy', 'fireplace', 'chimney', 'furniture'], tag: 'Home' },

  // Work & Office
  { keywords: ['office', 'business', 'briefcase', 'suitcase', 'meeting', 'presentation', 'chart', 'graph', 'analytics', 'dashboard', 'spreadsheet', 'invoice', 'receipt', 'contract', 'agreement', 'signature', 'clipboard', 'calendar', 'schedule', 'checklist', 'project', 'kanban', 'deadline', 'milestone', 'strategy', 'brainstorm', 'whiteboard', 'corporate', 'enterprise', 'startup', 'employee', 'team', 'hierarchy', 'org chart'], tag: 'Work & Office' },

  // Education
  { keywords: ['education', 'school', 'university', 'college', 'student', 'teacher', 'professor', 'book', 'notebook', 'pencil', 'eraser', 'ruler', 'backpack', 'graduation', 'diploma', 'certificate', 'degree', 'exam', 'homework', 'study', 'learn', 'library', 'microscope', 'telescope', 'science', 'chemistry', 'biology', 'physics', 'alphabet', 'language', 'translate', 'dictionary', 'globe', 'history', 'geography', 'lecture', 'seminar', 'workshop', 'tutorial', 'lesson', 'blackboard', 'chalkboard'], tag: 'Education' },

  // Health & Medical
  { keywords: ['health', 'medical', 'hospital', 'doctor', 'nurse', 'medicine', 'pill', 'capsule', 'drug', 'pharmacy', 'prescription', 'stethoscope', 'syringe', 'injection', 'vaccine', 'bandage', 'band-aid', 'wheelchair', 'crutch', 'ambulance', 'emergency', 'first aid', 'pulse', 'heartbeat', 'blood', 'dna', 'virus', 'bacteria', 'germ', 'dental', 'tooth', 'vision', 'glasses', 'hearing', 'brain', 'lung', 'bone', 'x-ray', 'diagnosis', 'therapy', 'mental', 'wellness', 'nutrition', 'diet', 'meditation', 'accessibility', 'accessible', 'disability'], tag: 'Health & Medical' },

  // Finance
  { keywords: ['finance', 'money', 'dollar', 'euro', 'pound', 'yen', 'currency', 'coin', 'cash', 'credit card', 'debit card', 'wallet', 'payment', 'transaction', 'transfer', 'invoice', 'receipt', 'tax', 'budget', 'savings', 'invest', 'stock', 'trading', 'crypto', 'bitcoin', 'blockchain', 'exchange', 'atm', 'piggy bank', 'profit', 'revenue', 'expense', 'audit', 'accounting', 'calculator'], tag: 'Finance' },

  // Shopping
  { keywords: ['shop', 'store', 'cart', 'basket', 'purchase', 'buy', 'sell', 'price', 'discount', 'sale', 'coupon', 'barcode', 'product', 'package', 'delivery', 'shipping', 'order', 'checkout', 'ecommerce', 'e-commerce', 'marketplace', 'retail', 'gift', 'present', 'wrapped', 'ribbon'], tag: 'Shopping' },

  // Technology
  { keywords: ['computer', 'laptop', 'desktop', 'keyboard', 'printer', 'scanner', 'server', 'database', 'network', 'wifi', 'bluetooth', 'usb', 'cable', 'plug', 'socket', 'battery', 'chip', 'cpu', 'processor', 'ram', 'storage', 'hard drive', 'ssd', 'device', 'phone', 'mobile', 'tablet', 'smartwatch', 'wearable', 'headphone', 'webcam', 'robot', 'artificial', 'machine learning', 'coding', 'programming', 'developer', 'software', 'hardware', 'api', 'terminal', 'console', 'debug', 'deploy', 'git', 'algorithm', 'binary', 'circuit', 'antenna', 'router', 'modem', 'ethernet', 'vpn', 'proxy', 'dns', 'html', 'css', 'javascript', 'json', 'xml', 'regex', 'automation', 'iot', 'sensor', 'drone', '3d printer', 'virtual reality', 'augmented reality'], tag: 'Technology' },

  // Communication
  { keywords: ['communication', 'message', 'chat', 'conversation', 'email', 'mail', 'envelope', 'inbox', 'send', 'reply', 'voicemail', 'sms', 'notification', 'bell', 'alert', 'announce', 'broadcast', 'megaphone', 'loudspeaker', 'radio', 'contact', 'address book', 'newsletter', 'subscribe', 'rss'], tag: 'Communication' },

  // Media
  { keywords: ['media', 'video', 'movie', 'film', 'cinema', 'camera', 'photo', 'picture', 'image', 'gallery', 'album', 'music', 'audio', 'sound', 'volume', 'speaker', 'headphone', 'earphone', 'microphone', 'record', 'podcast', 'stream', 'broadcast', 'playlist', 'queue', 'subtitle', 'caption', 'projector', 'television', 'brightness', 'contrast', 'clapper', 'reel', 'tape', 'vinyl', 'disc', 'melody', 'guitar', 'piano', 'drum', 'violin', 'trumpet', 'saxophone', 'instrument'], tag: 'Media' },

  // Files & Folders
  { keywords: ['file', 'folder', 'directory', 'document', 'paper', 'notepad', 'article', 'report', 'pdf', 'spreadsheet', 'csv', 'archive', 'zip', 'compress', 'extract', 'upload', 'download', 'import', 'export', 'save', 'trash', 'recycle', 'rename', 'copy', 'paste', 'duplicate', 'template', 'draft', 'attachment', 'paperclip', 'bookmark', 'journal', 'diary'], tag: 'Files & Folders' },

  // UI & Interface
  { keywords: ['interface', 'button', 'menu', 'dropdown', 'checkbox', 'toggle', 'switch', 'slider', 'progress', 'loading', 'spinner', 'skeleton', 'modal', 'dialog', 'popup', 'tooltip', 'toast', 'badge', 'panel', 'layout', 'sidebar', 'breadcrumb', 'pagination', 'scroll', 'resize', 'fullscreen', 'widget', 'component', 'setting', 'config', 'preference', 'gear', 'wrench', 'cursor', 'pointer'], tag: 'UI & Interface' },

  // Arrows
  { keywords: ['arrow', 'chevron', 'caret', 'upward', 'downward', 'leftward', 'rightward', 'undo', 'redo', 'refresh', 'reload', 'rotate', 'flip', 'swap', 'exchange', 'redirect', 'arrow up', 'arrow down', 'arrow left', 'arrow right', 'arrow back', 'arrow forward'], tag: 'Arrows' },

  // Navigation & Maps
  { keywords: ['navigation', 'navigate', 'map', 'location', 'marker', 'gps', 'compass', 'route', 'waypoint', 'destination', 'distance', 'nearby', 'explore', 'discover', 'globe', 'world', 'latitude', 'longitude', 'coordinate', 'street', 'highway', 'intersection', 'crossroad', 'roundabout'], tag: 'Navigation & Maps' },

  // Security
  { keywords: ['security', 'secure', 'lock', 'unlock', 'key', 'password', 'auth', 'login', 'logout', 'shield', 'protect', 'firewall', 'encrypt', 'decrypt', 'ssl', 'tls', 'https', 'privacy', 'permission', 'restrict', 'verify', 'authenticate', 'authorize', 'biometric', 'fingerprint', 'face id', 'token', 'two-factor', '2fa', 'otp', 'alarm', 'siren', 'cctv', 'surveillance', 'incognito'], tag: 'Security' },

  // Social
  { keywords: ['social', 'share', 'like', 'follow', 'friend', 'group', 'community', 'profile', 'account', 'avatar', 'status', 'feed', 'timeline', 'story', 'blog', 'comment', 'reaction', 'emoji', 'hashtag', 'mention', 'invite', 'subscribe', 'unsubscribe', 'mute', 'vote', 'poll', 'survey', 'review', 'rating', 'recommend', 'endorse', 'collaborate', 'contribute'], tag: 'Social' },

  // Creative & Design
  { keywords: ['creative', 'design', 'draw', 'paint', 'brush', 'palette', 'color', 'gradient', 'pattern', 'texture', 'shape', 'vector', 'raster', 'pixel', 'canvas', 'crop', 'transform', 'align', 'distribute', 'spacing', 'opacity', 'blend', 'effect', 'layer', 'mask', 'clipping', 'pencil', 'marker', 'highlighter', 'eraser', 'typography', 'font', 'bold', 'italic', 'underline', 'strikethrough', 'heading', 'paragraph', 'indent', 'format', 'wireframe', 'prototype', 'mockup', 'sketch', 'figma', 'photoshop', 'illustrator', 'photography', 'aperture', 'exposure', 'lens', 'panorama', 'retouch', 'scissors', 'sticker'], tag: 'Creative & Design' },

  // Symbols & Math
  { keywords: ['symbol', 'math', 'plus', 'minus', 'multiply', 'divide', 'equal', 'percent', 'fraction', 'decimal', 'number', 'digit', 'infinity', 'pi', 'delta', 'sigma', 'omega', 'alpha', 'beta', 'lambda', 'copyright', 'trademark', 'registered', 'ampersand', 'asterisk', 'hash', 'exclamation', 'question', 'bracket', 'parenthesis', 'brace', 'tilde', 'degree', 'checkmark', 'cross', 'x mark', 'tick', 'warning', 'error', 'pentagon', 'hexagon', 'octagon', 'keycap', 'input latin', 'input symbol', 'input number', 'zodiac', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'ophiuchus'], tag: 'Symbols & Math' },

  // Flags
  { keywords: ['flag', 'banner', 'pennant', 'country', 'nation'], tag: 'Flags' },
]

// Map original group/category names to tags
const GROUP_TAG_MAP = {
  // Fluent Emoji groups
  'Smileys & Emotion': ['Smileys', 'Emotions'],
  'People & Body': ['People', 'Hands'],
  'Animals & Nature': ['Animals', 'Nature'],
  'Food & Drink': ['Food & Drink'],
  'Travel & Places': ['Travel & Places', 'Transport'],
  'Activities': ['Sports & Fitness'],
  'Objects': [],  // Too broad — let keyword matching handle it
  'Symbols': ['Symbols & Math'],
  'Flags': ['Flags'],

  // Noto Emoji groups (same as Unicode standard)
  'Smileys & Emotion': ['Smileys', 'Emotions'],
  'People & Body': ['People', 'Hands'],
  'Animals & Nature': ['Animals', 'Nature'],
  'Food & Drink': ['Food & Drink'],
  'Travel & Places': ['Travel & Places', 'Transport'],
  'Activities': ['Sports & Fitness'],
  'Objects': [],
  'Symbols': ['Symbols & Math'],
  'Flags': ['Flags'],
  'Component': [],

  // Tabler Icons categories
  'Arrows': ['Arrows'],
  'Animals': ['Animals'],
  'Brand': ['Social'],
  'Buildings': ['Travel & Places'],
  'Charts': ['Work & Office'],
  'Communication': ['Communication'],
  'Computers': ['Technology'],
  'Currencies': ['Finance'],
  'Database': ['Technology'],
  'Design': ['Creative & Design'],
  'Development': ['Technology'],
  'Devices': ['Technology'],
  'Document': ['Files & Folders'],
  'E-commerce': ['Shopping'],
  'Electrical': ['Technology'],
  'Extensions': ['UI & Interface'],
  'Food': ['Food & Drink'],
  'Games': ['Sports & Fitness'],
  'Gender': ['People'],
  'Gestures': ['Hands'],
  'Health': ['Health & Medical'],
  'Laundry': ['Home'],
  'Letters': ['Education'],
  'Logic': ['Technology'],
  'Map': ['Navigation & Maps'],
  'Math': ['Symbols & Math'],
  'Media': ['Media'],
  'Mood': ['Emotions'],
  'Nature': ['Nature'],
  'Numbers': ['Symbols & Math'],
  'Photography': ['Creative & Design', 'Media'],
  'Shapes': ['Creative & Design'],
  'Sport': ['Sports & Fitness'],
  'Symbols': ['Symbols & Math'],
  'System': ['UI & Interface'],
  'Text': ['Creative & Design'],
  'Vehicles': ['Transport'],
  'Version control': ['Technology'],
  'Weather': ['Weather'],
  'Zodiac': ['Symbols & Math'],
}

// Escape special regex characters in a string
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Pre-compile regex patterns for each rule (word-boundary matching)
const COMPILED_RULES = KEYWORD_RULES.map(rule => ({
  tag: rule.tag,
  patterns: rule.keywords.map(kw =>
    new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i')
  ),
}))

/**
 * Assign tags to an icon based on its name, keywords, and original group/category.
 *
 * @param {object} icon - { name, keywords, group }
 * @returns {string[]} - array of tag names
 */
export function assignTags(icon) {
  const tags = new Set()

  // 1. Map from original group/category
  if (icon.group && GROUP_TAG_MAP[icon.group]) {
    for (const tag of GROUP_TAG_MAP[icon.group]) {
      tags.add(tag)
    }
  }

  // 2. Match keywords against the icon name and keywords using word boundaries
  const searchText = [
    icon.name?.toLowerCase() || '',
    ...(icon.keywords || []).map(k => String(k).toLowerCase()),
    icon.tts?.toLowerCase() || '',
  ].join(' ')

  for (const rule of COMPILED_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(searchText)) {
        tags.add(rule.tag)
        break
      }
    }
  }

  // 3. Ensure at least one tag
  if (tags.size === 0) {
    tags.add('Miscellaneous')
  }

  return Array.from(tags)
}
