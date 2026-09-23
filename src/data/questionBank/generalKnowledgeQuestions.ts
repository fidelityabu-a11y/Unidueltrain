import { DifficultyLevel, Question } from '../../types/duel';

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface GKItem {
  topic: string;
  q: string;
  ans: string;
  dist: string[];
  exp: string;
  hint: string;
}

export const GENERAL_KNOWLEDGE_BANK: GKItem[] = [
  // 1. Music & Film
  {
    topic: 'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
    q: 'Who is globally recognized as the pioneer of the Afrobeat music genre and founder of the Kalakuta Republic in Lagos?',
    ans: 'Fela Anikulapo Kuti',
    dist: ['King Sunny Ade', 'Hugh Masekela', 'Miriam Makeba'],
    exp: 'Fela Kuti created Afrobeat in Nigeria in the late 1960s with master drummer Tony Allen, fusing Yoruba highlife rhythms, jazz, and radical socio-political activism.',
    hint: 'Legendary multi-instrumentalist and composer of "Zombie" and "Water No Get Enemy".'
  },
  {
    topic: 'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
    q: 'Which Nigerian percussion instrument is known as the "talking drum" due to its ability to modulate pitch and mimic tonal dialects?',
    ans: 'Gangan (Dundun)',
    dist: ['Shekere', 'Udu', 'Ogene'],
    exp: 'The Gangan is an hourglass-shaped drum whose leather tension chords are squeezed under the arm to vary pitch, directly reproducing Yoruba speech tones.',
    hint: 'Hourglass drum held under the armpit.'
  },
  {
    topic: 'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
    q: 'The Kora, a 21-string harp-lute played by hereditary griots (jali), originated in which cultural region of Africa?',
    ans: 'Mandinka (West Africa)',
    dist: ['Zulu (Southern Africa)', 'Swahili Coast (East Africa)', 'Berber (North Africa)'],
    exp: 'The Kora is a sacred 21-string harp-lute constructed from a calabash gourd, played for centuries by Mandinka griots across Gambia, Senegal, Mali, and Guinea.',
    hint: 'Gourd harp-lute of the historic Mali and Senegambia region.'
  },
  {
    topic: 'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
    q: 'Which 1992 Nigerian straight-to-video film directed by Chris Obi Rapu is widely credited with catalyzing the modern Nollywood film industry?',
    ans: 'Living in Bondage',
    dist: ['Osuofia in London', 'Saworoide', 'Thunderbolt (Magun)'],
    exp: 'Kenneth Nnebue\'s Igbo-language film "Living in Bondage" sold hundreds of thousands of VHS copies, sparking the grassroots commercial revolution of Nollywood.',
    hint: 'Classic video film starring Kenneth Okonkwo as Andy Okeke.'
  },
  {
    topic: 'Music & Film (Afrobeat, Fela Kuti, Nollywood, Instruments)',
    q: 'In 2021, which Nigerian music megastar won the Grammy Award for Best Global Music Album for "Twice as Tall"?',
    ans: 'Burna Boy',
    dist: ['Wizkid', 'Davido', 'Tiwa Savage'],
    exp: 'Burna Boy earned the Best Global Music Album Grammy in 2021 for his critically acclaimed 5th studio album "Twice as Tall".',
    hint: 'African Giant hailing from Port Harcourt.'
  },

  // 2. Traditional Games & Sports Icons
  {
    topic: 'Traditional Games & Sports Icons',
    q: 'Which classical Yoruba strategy board game, played with 48 seeds on a carved wooden board with 12 cups, is an indigenous African Mancala game?',
    ans: 'Ayo Olopon',
    dist: ['Morabaraba', 'Senet', 'Fanorona'],
    exp: 'Ayo Olopon ("game of the wooden board") is an ancient Yoruba game of calculation and seed capture requiring rapid arithmetic deduction.',
    hint: 'Two rows of 6 cups each with 4 seeds per pit.'
  },
  {
    topic: 'Traditional Games & Sports Icons',
    q: 'Who made history at the 1996 Atlanta Olympics as the first individual African woman to win an Olympic gold medal in track and field?',
    ans: 'Chioma Ajunwa',
    dist: ['Falilat Ogunkoya', 'Mary Onyali', 'Blessing Okagbare'],
    exp: 'Chioma Ajunwa leaped 7.12 meters in the women\'s long jump on her first attempt, winning Nigeria\'s first individual Olympic gold medal.',
    hint: 'Long jump Olympic champion and Nigerian police officer.'
  },
  {
    topic: 'Traditional Games & Sports Icons',
    q: 'Which Nigerian-born basketball center led the Houston Rockets to back-to-back NBA Championships in 1994 and 1995 with his patented "Dream Shake"?',
    ans: 'Hakeem Olajuwon',
    dist: ['Dikembe Mutombo', 'Giannis Antetokounmpo', 'Luol Deng'],
    exp: 'Hakeem "The Dream" Olajuwon from Lagos dominated the NBA with unmatched footwork, winning MVP, Defensive Player of the Year, and Finals MVP.',
    hint: 'The legendary #34 Houston Rockets center.'
  },

  // 3. Climate & Green Innovations
  {
    topic: 'Climate & Green Innovations',
    q: 'The Noor Ouarzazate Solar Complex, one of the world\'s largest concentrated solar power (CSP) facilities using molten salt storage, is located in which country?',
    ans: 'Morocco',
    dist: ['Egypt', 'Algeria', 'South Africa'],
    exp: 'Morocco built Noor Ouarzazate on the threshold of the Sahara Desert, generating over 500 MW using parabolic trough mirrors that store thermal energy for night generation.',
    hint: 'North African kingdom renowned for Marrakech and Casablanca.'
  },
  {
    topic: 'Climate & Green Innovations',
    q: 'What is the visionary African Union-led cross-continental initiative planting an 8,000 km ecological belt from Senegal to Djibouti to combat Sahel desertification?',
    ans: 'The Great Green Wall',
    dist: ['The Sahel Shield', 'The Sahara Oasis Initiative', 'The African Reforestation Pact'],
    exp: 'The Great Green Wall aims to restore 100 million hectares of degraded land, sequester 250 million tons of carbon, and create green jobs across 11 Sahelian nations.',
    hint: 'Trans-continental living barrier spanning the southern Sahara margin.'
  },
  {
    topic: 'Climate & Green Innovations',
    q: 'The Lake Turkana Wind Power Project, the largest single wind energy installation in Africa producing 310 MW, is situated in which nation?',
    ans: 'Kenya',
    dist: ['Tanzania', 'Ethiopia', 'Uganda'],
    exp: 'Located in Marsabit County in northern Kenya, Lake Turkana Wind Power utilizes reliable desert winds channeling between Mount Kulal and the Nyiru Range.',
    hint: 'East African nation pioneering green geothermal and wind power.'
  },

  // 4. Fashion & Cultural Identity
  {
    topic: 'Fashion & Cultural Identity',
    q: 'What is the celebrated Yoruba indigo resist-dyed textile, handcrafted in southwestern Nigeria using cassava starch paste or tied raffia patterns?',
    ans: 'Adire',
    dist: ['Kente', 'Bogolanfini', 'Shweshwe'],
    exp: 'Adire is crafted predominantly by Egba Yoruba women in Abeokuta, using techniques like Adire Eleko (cassava resist) and Adire Oniko (tie-dye).',
    hint: 'Famous indigo-patterned heritage cloth of Abeokuta.'
  },
  {
    topic: 'Fashion & Cultural Identity',
    q: 'The geometric, brightly woven silk and cotton textile known as Kente cloth originated among which African civilization?',
    ans: 'Ashanti (Ghana)',
    dist: ['Yoruba (Nigeria)', 'Mossi (Burkina Faso)', 'Songhai (Mali)'],
    exp: 'Kente cloth was developed in the Ashanti Kingdom in town of Bonwire, where each woven color and geometric strip conveys proverbs and royal heritage.',
    hint: 'Historic Akan kingdom centered in Kumasi.'
  },
  {
    topic: 'Fashion & Cultural Identity',
    q: 'Bogolanfini, an internationally recognized artisanal cotton textile dyed with fermented river mud and plant extracts, is an indigenous craft of which nation?',
    ans: 'Mali',
    dist: ['Senegal', 'Niger', 'Cameroon'],
    exp: 'Bogolanfini ("mud cloth" in Bambara) is produced by Bambara artisans in Mali, utilizing fermented mud from the Niger River to create symbolic motifs.',
    hint: 'Sahelian nation with historic cities Timbuktu and Djenné.'
  },
  {
    topic: 'Fashion & Cultural Identity',
    q: 'Which famous Akan visual symbol, translating to "Except God", is the most widely recognized Adinkra symbol representing the omnipotence of God?',
    ans: 'Gye Nyame',
    dist: ['Sankofa', 'Dwennimmen', 'Duafe'],
    exp: 'Gye Nyame ("Except God") is the quintessential Adinkra symbol of Akan cosmology, denoting that nothing happens without the supreme will of the Creator.',
    hint: 'Features symmetric spiral crescents flanking a central axis.'
  },

  // 5. Historical Empires & Civilizations
  {
    topic: 'Historical Empires (Benin, Oyo, Mali, Songhai, Kush)',
    q: 'Which pre-colonial Nigerian kingdom was world-renowned for its magnificent brass castings, carved ivory, and massive earthwork walls prior to 1897?',
    ans: 'Benin Kingdom',
    dist: ['Oyo Empire', 'Sokoto Caliphate', 'Bornu Empire'],
    exp: 'The Benin Kingdom under the Obas produced the world-renowned Benin Bronzes (lost-wax brass sculptures) and sophisticated moat fortifications described as engineering marvels.',
    hint: 'Historic kingdom in present-day Edo State.'
  },
  {
    topic: 'Historical Empires (Benin, Oyo, Mali, Songhai, Kush)',
    q: 'Which Mali Empire emperor became famous across Europe, the Middle East, and North Africa during his lavish 1324 pilgrimage to Mecca, spending gold so generously that he depressed regional bullion markets?',
    ans: 'Mansa Musa',
    dist: ['Sundiata Keita', 'Askia Muhammad', 'Sunni Ali'],
    exp: 'Mansa Musa I of Mali ruled one of the richest realms in human history, distributing tonnes of pure gold during his 1324 Hajj caravan across Cairo and Mecca.',
    hint: '14th-century ruler depicted holding a gold nugget on the Catalan Atlas.'
  },
  {
    topic: 'Historical Empires (Benin, Oyo, Mali, Songhai, Kush)',
    q: 'The ancient Kingdom of Kush, renowned for building more than 200 steep-sided royal pyramids, flourished along the Nile River in what modern nation?',
    ans: 'Sudan',
    dist: ['Egypt', 'Ethiopia', 'Chad'],
    exp: 'The Kushite civilizations of Kerma, Napata, and Meroë in modern-day Sudan built the Meroë pyramids and once conquered Egypt as the 25th "Black Pharaohs" Dynasty.',
    hint: 'Country at the confluence of the Blue and White Nile.'
  },
  {
    topic: 'Historical Empires (Benin, Oyo, Mali, Songhai, Kush)',
    q: 'What ancient Yoruba imperial council of seven hereditary noble kingmakers exercised constitutional checks and balances over the Alaafin of Oyo?',
    ans: 'Oyomesi',
    dist: ['Ogboni', 'Eso Ikoyi', 'Ooni Council'],
    exp: 'The Oyomesi, led by the Bashorun (Prime Minister), held supreme constitutional authority in the Oyo Empire, capable of rejecting a tyrannical Alaafin.',
    hint: 'Seven hereditary chiefs representing the quarters of Old Oyo.'
  },

  // 6. Pan-Africanism, African Union & Independence Leaders
  {
    topic: 'Pan-Africanism, African Union & Independence Leaders',
    q: 'Who served as the first indigenous Governor-General and first President of independent Nigeria, and was known as the "Zik of Africa"?',
    ans: 'Dr. Nnamdi Azikiwe',
    dist: ['Obafemi Awolowo', 'Ahmadu Bello', 'Tafawa Balewa'],
    exp: 'Dr. Nnamdi Azikiwe was a founding father of modern Nigerian nationalism and a visionary Pan-Africanist who established the University of Nigeria, Nsukka (UNN).',
    hint: 'Eminent Pan-African scholar and journalist of the West African Pilot.'
  },
  {
    topic: 'Pan-Africanism, African Union & Independence Leaders',
    q: 'In which African capital city is the permanent headquarters of the African Union (AU) located?',
    ans: 'Addis Ababa, Ethiopia',
    dist: ['Nairobi, Kenya', 'Abuja, Nigeria', 'Johannesburg, South Africa'],
    exp: 'Addis Ababa was chosen as the diplomatic capital of the continent when the Organisation of African Unity (OAU) was founded in 1963, continuing as the AU seat.',
    hint: 'Diplomatic capital of Africa situated in the Horn of Africa.'
  },
  {
    topic: 'Pan-Africanism, African Union & Independence Leaders',
    q: 'Which Ghanaian statesman led his country to become the first sub-Saharan colony to gain independence in 1957, declaring "Our independence is meaningless unless linked up with the total liberation of the African continent"?',
    ans: 'Kwame Nkrumah',
    dist: ['Jomo Kenyatta', 'Julius Nyerere', 'Sekou Touré'],
    exp: 'Osagyefo Dr. Kwame Nkrumah championed the liberation struggle, non-alignment, and continental political unification ("Africa Must Unite").',
    hint: 'Founder of modern Ghana and co-founder of the OAU.'
  },
  {
    topic: 'Pan-Africanism, African Union & Independence Leaders',
    q: 'The Secretariat of the African Continental Free Trade Area (AfCFTA), the world\'s largest free trade zone by number of member countries, is headquartered in which city?',
    ans: 'Accra, Ghana',
    dist: ['Lagos, Nigeria', 'Cairo, Egypt', 'Kigali, Rwanda'],
    exp: 'Ghana won the host bid for the AfCFTA Secretariat in Accra, coordinating the single market spanning 54 countries and over 1.3 billion people.',
    hint: 'Capital city of Ghana on the Gulf of Guinea.'
  },
  {
    topic: 'Pan-Africanism, African Union & Independence Leaders',
    q: 'Which revolutionary Pan-African leader renamed his nation from Upper Volta to Burkina Faso ("Land of Upright People") and spearheaded nationwide literacy and vaccination drives?',
    ans: 'Thomas Sankara',
    dist: ['Patrice Lumumba', 'Amílcar Cabral', 'Samora Machel'],
    exp: 'Thomas Sankara governed Burkina Faso from 1983 to 1987, planting 10 million trees to halt desertification, promoting local cotton, and championing women\'s rights.',
    hint: 'Charismatic leader often called the "Che Guevara of Africa".'
  },

  // 7. Literature, Language & Oral Traditions
  {
    topic: 'Literature & Language (Soyinka, Achebe, Adichie)',
    q: 'Who became the first African writer to be awarded the Nobel Prize in Literature in 1986?',
    ans: 'Wole Soyinka',
    dist: ['Chinua Achebe', 'Ngũgĩ wa Thiong\'o', 'Naguib Mahfouz'],
    exp: 'Nigerian playwright, poet, and essayist Wole Soyinka won the 1986 Nobel Prize for his wide cultural perspective and poetic overtones fashioning the drama of existence.',
    hint: 'Author of "Death and the King\'s Horseman" and "The Lion and the Jewel".'
  },
  {
    topic: 'Literature & Language (Soyinka, Achebe, Adichie)',
    q: 'Chinua Achebe\'s seminal 1958 masterpiece "Things Fall Apart", which chronicled the tragedy of Okonkwo and the Igbo encounter with colonialism, takes its title from a poem by which Irish poet?',
    ans: 'W.B. Yeats ("The Second Coming")',
    dist: ['T.S. Eliot', 'Seamus Heaney', 'Lord Byron'],
    exp: 'Achebe drew the title from W.B. Yeats\'s 1919 poem "The Second Coming": "Things fall apart; the centre cannot hold; Mere anarchy is loosed upon the world."',
    hint: 'Irish Nobel laureate who wrote "The Second Coming".'
  },
  {
    topic: 'Literature & Language (Soyinka, Achebe, Adichie)',
    q: 'Which celebrated Nigerian author wrote "Half of a Yellow Sun", "Americanah", and delivered the globally influential TED talk "The Danger of a Single Story"?',
    ans: 'Chimamanda Ngozi Adichie',
    dist: ['Buchi Emecheta', 'Flora Nwapa', 'Sefi Atta'],
    exp: 'Chimamanda Ngozi Adichie is one of the world\'s foremost contemporary literary voices, celebrated for her novels exploring identity, feminism, and historical memory.',
    hint: 'Renowned author of "Purple Hibiscus" and "Dear Ijeawele".'
  },

  // 8. Agriculture & Food Systems
  {
    topic: 'Agriculture & Food (Yam, Cassava, Cocoa, Jollof traditions)',
    q: 'Nigeria is the undisputed #1 producer in the world for which staple tuber crop, accounting for over 65% of total global production?',
    ans: 'Yam',
    dist: ['Irish Potato', 'Plantain', 'Sorghum'],
    exp: 'Nigeria harvests over 50 million metric tonnes of white and yellow yams (Dioscorea) annually, celebrating its centrality in cultural ceremonies like the Iri Ji festival.',
    hint: 'Root tuber celebrated in New Yam festivals across West Africa.'
  },
  {
    topic: 'Agriculture & Food (Yam, Cassava, Cocoa, Jollof traditions)',
    q: 'Which iron-rich ancient gluten-free cereal grain, the primary ingredient used to prepare the spongy sourdough flatbread "Injera", is indigenous to Ethiopia and Eritrea?',
    ans: 'Teff',
    dist: ['Millet', 'Fonio', 'Sorghum'],
    exp: 'Teff (Eragrostis tef) is a tiny seed-grain cultivated in the Ethiopian highlands for over 3,000 years, rich in iron, calcium, and protein.',
    hint: 'Tiny ancient grain essential for traditional Ethiopian Injera.'
  },
  {
    topic: 'Agriculture & Food (Yam, Cassava, Cocoa, Jollof traditions)',
    q: 'Which two neighboring West African countries together produce nearly 60% of the entire global supply of cocoa beans?',
    ans: 'Côte d\'Ivoire and Ghana',
    dist: ['Nigeria and Cameroon', 'Liberia and Sierra Leone', 'Togo and Benin'],
    exp: 'Côte d\'Ivoire (the world\'s #1 producer) and Ghana (#2) form the global cocoa belt, producing the bulk of cocoa for the world\'s chocolate industry.',
    hint: 'Leading West African francophone and anglophone cocoa powerhouses.'
  },

  // 9. Urbanization & Tech Ecosystems
  {
    topic: 'Urbanization & Tech Hubs (Yabacon Valley, Silicon Savannah)',
    q: 'Which vibrant technological and innovation district in Lagos, home to CcHUB and numerous unicorn fintech startups, is famously nicknamed "Yabacon Valley"?',
    ans: 'Yaba',
    dist: ['Ikeja', 'Victoria Island', 'Lekki'],
    exp: 'Yaba became the nucleus of Nigeria\'s startup revolution due to its proximity to the University of Lagos (UNILAG) and Yaba College of Technology (YABATECH).',
    hint: 'Lagos mainland neighborhood with high density of software developers.'
  },
  {
    topic: 'Urbanization & Tech Hubs (Yabacon Valley, Silicon Savannah)',
    q: 'Which revolutionary mobile money transfer and microfinancing service, launched by Safaricom in Kenya in 2007, transformed financial inclusion across Africa?',
    ans: 'M-Pesa',
    dist: ['Chipper Cash', 'Wave', 'OPay'],
    exp: 'M-Pesa ("Pesa" meaning money in Swahili) pioneered mobile phone SMS banking, allowing millions of unbanked citizens to deposit, withdraw, and transfer funds.',
    hint: 'Safaricom\'s world-famous mobile money service.'
  },
  {
    topic: 'Urbanization & Tech Hubs (Yabacon Valley, Silicon Savannah)',
    q: 'What is the popular technology corridor and tech hub nickname for Nairobi, Kenya, celebrating its position as an East African digital innovation epicenter?',
    ans: 'Silicon Savannah',
    dist: ['Silicon Valley East', 'Savannah Cyberbelt', 'Nairobi Tech Oasis'],
    exp: 'Nairobi is dubbed the "Silicon Savannah" due to its dense ecosystem of incubators (iHub), tech universities, and regional headquarters for global technology companies.',
    hint: 'Named after East Africa\'s iconic grassland ecosystem.'
  },
];

export function generateAfricanGeneralKnowledge(diff: DifficultyLevel, subtopic?: string): Question {
  let pool = GENERAL_KNOWLEDGE_BANK;

  if (subtopic && subtopic !== 'all') {
    const filtered = pool.filter(item =>
      item.topic.toLowerCase().includes(subtopic.toLowerCase()) ||
      subtopic.toLowerCase().includes(item.topic.toLowerCase())
    );
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  const item = choice(pool);
  const options = shuffle([item.ans, ...shuffle(item.dist).slice(0, 3)]);
  const correctIndex = options.indexOf(item.ans);

  return {
    id: `gk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    category: 'general_knowledge',
    topic: item.topic,
    difficulty: diff,
    question: item.q,
    options,
    correctIndex,
    explanation: item.exp,
    mentalShortcut: item.hint,
  };
}
