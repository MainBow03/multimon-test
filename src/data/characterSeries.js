// Origini per ogni Multimon: lista esplicita, comprese evocazioni e varianti.
// Le fusioni sono associate a tutti gli universi dei personaggi combinati.
const SERIES_GROUPS = {
  "Adventure Time": "finn jake marceline marceline_corrotta reghiaccio flameprincess jakeildemone",
  "Avatar (Aang e Korra)": "aang zuko katara tophbeifong korra theboulder",
  "Ben 10": "diamante kevin charmcaster",
  "Brawl Stars": "berry",
  "Coraline": "coraline altramadre",
  "Crash Bandicoot": "crash",
  "Dark Souls": "nito",
  "Death Note": "ryuk",
  "Devil May Cry": "dante",
  "Disney - Atlantis": "kida",
  "Disney - Coco": "miguelrivera",
  "Disney - Frozen": "elsa",
  "Disney - Gli Incredibili": "frozone",
  "Disney - La bella addormentata nel bosco": "malefica",
  "Disney - La bella e la bestia": "gaston",
  "Disney - La sirenetta": "ursula ariel",
  "Disney - Le follie dell’imperatore": "yzma",
  "Disney - Mulan": "mushu",
  "Disney - Oceania": "vaiana",
  "Disney - Topolino": "topolino",
  "Doraemon": "doraemon",
  "Dragon Ball": "goku cell zeno bulma shenron celljr_1 celljr_2 celljr_3 celljr_4",
  "Dragon Trainer": "sdentato",
  "Elden Ring": "malenia",
  "Fairy Tail": "natsu juvia laxus lucy zodiac_aries zodiac_taurus zodiac_gemini zodiac_cancer zodiac_leo zodiac_virgo zodiac_aquarius zodiac_scorpio",
  "Five Nights at Freddy’s": "roxy",
  "Folclore giapponese": "yukionna",
  "Fragolina Dolcecuore": "fragolina blueberrymuffin",
  "Fullmetal Alchemist": "alphonse",
  "Gargoyles": "goliath",
  "Genshin Impact": "flins ganyu",
  "God of War": "kratos",
  "Godzilla": "godzilla",
  "Gravity Falls": "billcipher",
  "Hannibal": "hannibal",
  "Hatsune Miku / Vocaloid": "miku",
  "High School DxD": "rias",
  "Hollow Knight": "ilcavaliere hornet",
  "Houseki no Kuni": "phosphophyllite",
  "Hunter × Hunter": "zazan",
  "I due fantagenitori": "cosmo",
  "Jujutsu Kaisen": "mahito",
  "Kamen Rider Kabuto": "kamenriderkabuto",
  "Kim Possible": "shego",
  "Kirby": "kirby",
  "Kung Fu Panda": "po shifu maestrospietato mantide",
  "L’Ape Maya": "mayalape",
  "La storia infinita": "mangiarocce",
  "Le 5 Leggende": "jackfrost",
  "Le avventure di Asterix": "obelix",
  "Life is Strange": "maxcaulfield chloeprice maxcaulfield_corrotta",
  "LoliRock": "iris",
  "Lo straordinario mondo di Gumball": "darwin nicole leslie",
  "Looney Tunes": "bugsbunny daffyduck",
  "Marvel": "groot korg",
  "Megamind": "megamind",
  "Miraculous": "ladybug chatnoir renarouge viperion monarch summon_chatnoir summon_renarouge summon_carapace summon_ryuko summon_kingmonkey",
  "My Little Pony": "rainbowdash discord spike rarity terrordash",
  "Naruto": "naruto sasuke zabuza gaara",
  "Ninjago": "kai",
  "One Piece": "luffy zoro nami chopper",
  "Overlord": "ainz entoma",
  "Pokémon": "snorlax roserade gardevoir charizard frillish flygon leafeon shaymin",
  "Resident Evil": "carlos leon",
  "RWBY": "weiss",
  "I Griffin": "stewie",
  "Shrek": "shrek",
  "Sonic the Hedgehog": "metalsonic blaze shadow sonic tails",
  "SpongeBob": "spongebob patrick plankton",
  "Spyro the Dragon": "spyro",
  "Star vs. le forze del male": "starbutterfly",
  "StarCraft": "zergling",
  "Steven Universe": "garnet lapis peridot perla ametista diamantebianco bismuth hessonite",
  "Street Fighter": "juri",
  "Studio Ghibli - La città incantata": "hakudrago senzavolto",
  "Studio Ghibli - Ponyo": "ponyo",
  "Super Mario": "mario luigi wario yoshi bowser reboo polterpup boo cuoreinfranto",
  "Teen Titans": "cyborg corvina robin stellarubia bumblebee terra trigon clone_corvina",
  "DC Comics": "superboy superman nightwing poisonivy blackcanary bluebeetle",
  "Teenage Mutant Ninja Turtles": "baxterstockman",
  "The Seven Deadly Sins": "meliodas ban",
  "Totally Spies!": "samtotallyspies clover",
  "Transformers": "soundwave",
  "Undertale": "sans gaster",
  "VALORANT": "sage neon",
  "Wakfu": "yugo",
  "We Bare Bears": "orsobianco",
  "Winx Club": "bloom flora",
  "Xenoblade Chronicles 2": "pyra",
  "Yo-kai Watch": "whisper",
  "Yu-Gi-Oh! 5D’s": "yusei",
  "Yu-Gi-Oh! ZEXAL": "astral utopia",
  "Zatch Bell!": "barry zatchbell brago ponygon penny zatch_akuma ponygon_akuma",
  "Assassination Classroom": "sugino",
  "Demon Slayer": "sanemi shinobu",
  "Danny Phantom": "embermclain kitty dannyphantom",
  "Johnny Test": "mechajohnny",
  "Personaggi originali di Multimon": "sovranoaurelion echomax regista caposcena primadonna riflettore nina_teatro dolli cuoredipietra strega scheletro mostro_scheletrico golem_pietra golem_pietra_supremo carta_guardia clone_rosso clone_verde albero_demone robo_aiutante_1 robo_aiutante_2 slime blob worm melma piantacarnivora cespugliomaledetto alberto fioretenebroso fatacosmica gommarosa staticshocker staticshocker_invincible remedusa medusaservitore lavender sheldon sumo elly arievicente jakedc",
  "Musica - Ariana Grande": "ariana"
};

export const SERIES_BY_ID = Object.freeze(Object.fromEntries(
  Object.entries(SERIES_GROUPS).flatMap(([series,ids]) =>
    ids.split(' ').filter(Boolean).map(id => [id,series]))
));

export function characterSeriesList(character) {
  if (!character) return [];
  if (Array.isArray(character.fusionOf) && character.fusionOf.length) {
    return [...new Set(character.fusionOf.map(id => SERIES_BY_ID[id] || 'Origine da verificare'))];
  }
  return [SERIES_BY_ID[character.id] || 'Origine da verificare'];
}

export const characterSeries = character => characterSeriesList(character)[0] || 'Origine da verificare';

export function seriesOptions(characters) {
  return [...new Set((characters || []).flatMap(characterSeriesList))]
    .sort((a,b) => a.localeCompare(b,'it'));
}

export const seriesMatches = (character,series) =>
  series === 'Tutti' || characterSeriesList(character).includes(series);
