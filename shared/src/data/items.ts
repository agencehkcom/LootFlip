import { ItemType, ItemTrait, Rarity } from '../types/item';

export interface ItemTemplate {
  name: string;
  description: string;
  trait: string;
  type: string;
  rarity: string;
}

// ═══════════════════════════════════════════
// COMMON (90 items — 5 per trait/type combo)
// ═══════════════════════════════════════════

const COMMON_ITEMS: ItemTemplate[] = [
  // BURN WEAPON (5)
  { trait: 'BURN', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Braise', description: 'Une dague rouillée qui garde la chaleur des forges oubliées.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'COMMON', name: 'Couteau du Forgeron', description: 'Un outil de forge reconverti en arme. Encore chaud.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'COMMON', name: 'Épée Noircie', description: 'La lame est noire de suie. Elle sent le charbon.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Cendrée', description: 'Trouvée dans les cendres d\'un campement brûlé.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Rougeoyante', description: 'Une lueur orange parcourt la lame quand tu frappes.' },
  // BURN ARMOR (5)
  { trait: 'BURN', type: 'ARMOR', rarity: 'COMMON', name: 'Plastron Fumant', description: 'Un plastron noirci par la suie, encore tiède.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'COMMON', name: 'Gilet de Braises', description: 'Des braises sont cousues dans le tissu. Ça pique.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'COMMON', name: 'Cotte Chauffée', description: 'Les mailles ont été chauffées à blanc. Elles gardent la chaleur.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'COMMON', name: 'Bouclier Calciné', description: 'Un bouclier en bois qui a survécu à un incendie. À peine.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'COMMON', name: 'Harnais du Charbonnier', description: 'Porté par les travailleurs des mines de charbon.' },
  // BURN SPELL (5)
  { trait: 'BURN', type: 'SPELL', rarity: 'COMMON', name: 'Étincelle', description: 'Un petit sort de feu. Ça fait le travail.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'COMMON', name: 'Flammèche', description: 'Une petite flamme qui danse au bout des doigts.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'COMMON', name: 'Allumage', description: 'Le premier sort qu\'on apprend à l\'école de magie.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'COMMON', name: 'Brûlure Mineure', description: 'Comme un coup de soleil, mais magique.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'COMMON', name: 'Souffle Chaud', description: 'Un vent brûlant sort de tes mains.' },
  // FREEZE WEAPON (5)
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Givrée', description: 'Une lame recouverte d\'une fine couche de givre permanent.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'COMMON', name: 'Couteau de Glace', description: 'Taillé dans un bloc de glace qui ne fond jamais.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Froide', description: 'La poignée est glaciale. Gants recommandés.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'COMMON', name: 'Épée du Gel', description: 'Du givre se forme sur tout ce qu\'elle touche.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'COMMON', name: 'Pic à Glace', description: 'Normalement c\'est pour l\'escalade. Mais ça marche aussi.' },
  // FREEZE ARMOR (5)
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'COMMON', name: 'Tunique Glacée', description: 'Froide au toucher mais étrangement confortable.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'COMMON', name: 'Cape Hivernale', description: 'Elle sent la neige fraîche.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'COMMON', name: 'Plastron Givré', description: 'Une couche de givre recouvre les plaques.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'COMMON', name: 'Bouclier de Neige', description: 'Étonnamment solide pour de la neige compactée.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'COMMON', name: 'Gants du Nord', description: 'Fabriqués par les peuples du Grand Nord.' },
  // FREEZE SPELL (5)
  { trait: 'FREEZE', type: 'SPELL', rarity: 'COMMON', name: 'Souffle Glacé', description: 'Un courant d\'air froid. Basique mais efficace.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'COMMON', name: 'Flocon', description: 'Un unique flocon magique. Joli mais pas très puissant.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'COMMON', name: 'Frisson', description: 'L\'ennemi tremble de froid pendant un instant.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'COMMON', name: 'Brise Polaire', description: 'Un vent froid venu du pôle.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'COMMON', name: 'Verglas', description: 'Le sol devient glissant. Attention à la chute.' },
  // LIGHTNING WEAPON (5)
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'COMMON', name: 'Couteau Statique', description: 'Tes cheveux se dressent quand tu le tiens.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Électrisée', description: 'Un léger courant parcourt la lame.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Crépitante', description: 'Des étincelles jaillissent à chaque mouvement.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'COMMON', name: 'Épée du Tonnerre', description: 'On entend un grondement sourd quand elle frappe.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'COMMON', name: 'Pointe Chargée', description: 'Comme toucher une clôture électrique. En pire.' },
  // LIGHTNING ARMOR (5)
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'COMMON', name: 'Gilet Conducteur', description: 'Des fils de cuivre tissés dans le tissu. Ça picote.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'COMMON', name: 'Plastron Chargé', description: 'Il crépite quand il pleut.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'COMMON', name: 'Cape de l\'Orage', description: 'Elle claque comme le tonnerre dans le vent.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'COMMON', name: 'Bouclier Paratonnerre', description: 'Attire la foudre. C\'est le but, apparemment.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'COMMON', name: 'Ceinture Voltaïque', description: 'Elle stocke un peu d\'électricité statique.' },
  // LIGHTNING SPELL (5)
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'COMMON', name: 'Décharge', description: 'Un petit choc. Désagréable.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'COMMON', name: 'Arc Statique', description: 'Un petit arc électrique entre tes doigts.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'COMMON', name: 'Picotement', description: 'Ça chatouille. Mais en méchant.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'COMMON', name: 'Étincelle Bleue', description: 'Une étincelle bleutée jaillit vers l\'ennemi.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'COMMON', name: 'Court-Circuit', description: 'Un sort de base pour les apprentis mages de foudre.' },
  // SHADOW WEAPON (5)
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Voilée', description: 'Elle semble disparaître quand tu ne la regardes pas.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'COMMON', name: 'Couteau Furtif', description: 'Si léger qu\'on ne le sent pas dans la main.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Obscure', description: 'La lame absorbe la lumière autour d\'elle.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'COMMON', name: 'Stilet Nocturne', description: 'Fait pour frapper dans le noir.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Brumeuse', description: 'Un halo de brume entoure le tranchant.' },
  // SHADOW ARMOR (5)
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'COMMON', name: 'Cape Sombre', description: 'Une cape qui absorbe la lumière autour d\'elle.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'COMMON', name: 'Tunique du Rôdeur', description: 'Parfaite pour se fondre dans les ombres.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'COMMON', name: 'Gilet d\'Ombres', description: 'Les ombres semblent s\'accrocher au tissu.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'COMMON', name: 'Masque du Voleur', description: 'Cache ton visage et brouille ta silhouette.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'COMMON', name: 'Capuche Nocturne', description: 'Quand tu la mets, les gens oublient ton visage.' },
  // SHADOW SPELL (5)
  { trait: 'SHADOW', type: 'SPELL', rarity: 'COMMON', name: 'Voile d\'Ombre', description: 'Un léger brouillard noir. Distrayant.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'COMMON', name: 'Obscurcissement', description: 'La lumière faiblit légèrement autour de toi.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'COMMON', name: 'Murmure Noir', description: 'L\'ennemi entend des chuchotements inquiétants.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'COMMON', name: 'Ombre Rampante', description: 'Ton ombre bouge indépendamment de toi.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'COMMON', name: 'Noirceur', description: 'Un petit coin de ténèbres. Pas très effrayant.' },
  // HEAL WEAPON (5)
  { trait: 'HEAL', type: 'WEAPON', rarity: 'COMMON', name: 'Bâton de Vie', description: 'Un simple bâton de bois qui bourgeonne en permanence.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Soignante', description: 'Les blessures qu\'elle inflige guérissent en retour.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Verdoyante', description: 'De petites feuilles poussent le long du tranchant.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'COMMON', name: 'Bâton du Druide', description: 'Un bâton noueux imprégné d\'énergie vitale.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'COMMON', name: 'Épée Apaisante', description: 'Toucher la lame calme la douleur.' },
  // HEAL ARMOR (5)
  { trait: 'HEAL', type: 'ARMOR', rarity: 'COMMON', name: 'Tunique du Guérisseur', description: 'Douce et apaisante. Les blessures se ferment lentement.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'COMMON', name: 'Cape de Mousse', description: 'De la mousse pousse sur le tissu. Ça sent la forêt.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'COMMON', name: 'Bandages Enchantés', description: 'Ils se resserrent d\'eux-mêmes sur les blessures.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'COMMON', name: 'Plastron Vivant', description: 'Le cuir semble respirer. Un peu flippant.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'COMMON', name: 'Amulette de Soin', description: 'Un pendentif qui émet une douce lueur verte.' },
  // HEAL SPELL (5)
  { trait: 'HEAL', type: 'SPELL', rarity: 'COMMON', name: 'Premiers Soins', description: 'Un pansement magique. Ça aide.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'COMMON', name: 'Baume Magique', description: 'Un onguent lumineux qui apaise les plaies.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'COMMON', name: 'Lueur Verte', description: 'Une lumière verte enveloppe la blessure.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'COMMON', name: 'Toucher Apaisant', description: 'Ta main brille et la douleur s\'estompe.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'COMMON', name: 'Pluie de Pollen', description: 'Du pollen magique tombe et soigne les petites coupures.' },
  // POISON WEAPON (5)
  { trait: 'POISON', type: 'WEAPON', rarity: 'COMMON', name: 'Dague Enduite', description: 'Un peu de venin de serpent sur la lame. Classique.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'COMMON', name: 'Couteau Suintant', description: 'Un liquide verdâtre suinte de la lame.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'COMMON', name: 'Lame Empoisonnée', description: 'Trempée dans un marais toxique pendant trois jours.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'COMMON', name: 'Stylet Vénéneux', description: 'Un stylet fin enduit de venin d\'araignée.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'COMMON', name: 'Épine Toxique', description: 'Arrachée à une plante carnivore géante.' },
  // POISON ARMOR (5)
  { trait: 'POISON', type: 'ARMOR', rarity: 'COMMON', name: 'Gilet Toxique', description: 'Trempé dans un marais. Ça pue mais ça protège.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'COMMON', name: 'Cape Fétide', description: 'L\'odeur seule repousse les ennemis.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'COMMON', name: 'Plastron de Spores', description: 'Des champignons toxiques poussent dessus.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'COMMON', name: 'Gants du Marais', description: 'Verts, humides, et légèrement acides.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'COMMON', name: 'Masque Pestilentiel', description: 'Filtre les poisons. Ou les concentre. Pas sûr.' },
  // POISON SPELL (5)
  { trait: 'POISON', type: 'SPELL', rarity: 'COMMON', name: 'Crachat Acide', description: 'Dégoûtant mais efficace.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'COMMON', name: 'Bulle Toxique', description: 'Une bulle verdâtre qui éclate au contact.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'COMMON', name: 'Piqûre', description: 'Comme une piqûre d\'abeille. En plus méchant.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'COMMON', name: 'Spore', description: 'Un nuage de spores irritantes.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'COMMON', name: 'Nausée', description: 'L\'ennemi a soudain très mal au ventre.' },
];

// ═══════════════════════════════════════════
// RARE (45 items — ~2-3 per trait/type combo)
// ═══════════════════════════════════════════

const RARE_ITEMS: ItemTemplate[] = [
  // BURN (8)
  { trait: 'BURN', type: 'WEAPON', rarity: 'RARE', name: 'Épée Volcanique', description: 'Forgée dans la lave du Mont Ignis, elle brûle au toucher.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'RARE', name: 'Sabre Embrasé', description: 'Les flammes lèchent la lame sans la consumer.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'RARE', name: 'Cotte de Braises', description: 'Les mailles rougeoient comme des charbons ardents.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'RARE', name: 'Armure du Brasier', description: 'Elle réchauffe même dans le blizzard le plus féroce.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'RARE', name: 'Boule de Feu', description: 'Le classique des mages de combat. Jamais démodé.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'RARE', name: 'Mur de Flammes', description: 'Un rideau de feu sépare toi de ton ennemi.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'RARE', name: 'Hache Ardente', description: 'Le manche est chaud au toucher. La lame est pire.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'RARE', name: 'Cercle de Feu', description: 'Un anneau de flammes entoure la cible.' },
  // FREEZE (8)
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'RARE', name: 'Épée du Blizzard', description: 'Le vent hurle quand elle fend l\'air.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'RARE', name: 'Hache de Givre', description: 'La lame est un bloc de glace aiguisé.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'RARE', name: 'Armure de Cristal', description: 'Des cristaux de glace forment une protection scintillante.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'RARE', name: 'Cotte du Blizzard', description: 'Le froid émane de chaque maillon.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'RARE', name: 'Cage de Givre', description: 'Des barreaux de glace emprisonnent la cible.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'RARE', name: 'Lance de Glace', description: 'Un projectile de glace fonce vers l\'ennemi.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'RARE', name: 'Bouclier de Givre', description: 'Un mur de glace qui se reforme après chaque coup.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'RARE', name: 'Rapière Gelée', description: 'Chaque estocade laisse une trace de givre.' },
  // LIGHTNING (8)
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'RARE', name: 'Lance Foudroyante', description: 'L\'air crépite d\'électricité autour de la pointe.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'RARE', name: 'Masse Électrique', description: 'Chaque impact génère un flash aveuglant.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'RARE', name: 'Armure Voltaïque', description: 'Des arcs électriques parcourent sa surface.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'RARE', name: 'Cape de l\'Éclair', description: 'Elle flotte comme soulevée par l\'électricité statique.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'RARE', name: 'Chaîne d\'Éclairs', description: 'La foudre saute de cible en cible.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'RARE', name: 'Boule de Foudre', description: 'Une sphère crépitante qui poursuit sa cible.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'RARE', name: 'Gantelet Chargé', description: 'Chaque coup de poing est accompagné d\'une décharge.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'RARE', name: 'Javelot du Tonnerre', description: 'Il siffle comme l\'orage quand tu le lances.' },
  // SHADOW (7)
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'RARE', name: 'Dague de Minuit', description: 'Forgée à minuit pile, lors d\'une éclipse totale.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'RARE', name: 'Lame Fantôme', description: 'Elle traverse parfois la matière.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'RARE', name: 'Armure Spectrale', description: 'Semi-transparente, elle laisse passer certains coups.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'RARE', name: 'Manteau du Spectre', description: 'Tu deviens translucide quand tu te tiens immobile.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'RARE', name: 'Pas de l\'Ombre', description: 'Tu te déplaces entre les ombres.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'RARE', name: 'Clone Obscur', description: 'Une copie de toi faite d\'ombre apparaît brièvement.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'RARE', name: 'Cape du Silence', description: 'Tes pas ne font plus aucun bruit.' },
  // HEAL (7)
  { trait: 'HEAL', type: 'WEAPON', rarity: 'RARE', name: 'Lame Régénérante', description: 'Chaque coupure qu\'elle inflige se soigne en retour.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'RARE', name: 'Masse du Paladin', description: 'Bénie par un prêtre. Elle guérit celui qui la manie.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'RARE', name: 'Armure Vivante', description: 'Des lianes vivantes referment les brèches d\'elles-mêmes.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'RARE', name: 'Robe du Moine', description: 'Imprégnée de prières de guérison séculaires.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'RARE', name: 'Régénération', description: 'Tes cellules se réparent à vue d\'oeil.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'RARE', name: 'Onde de Vie', description: 'Une vague d\'énergie verte parcourt ton corps.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'RARE', name: 'Arc de Lumière', description: 'Ses flèches soignent les alliés et blessent les ennemis.' },
  // POISON (7)
  { trait: 'POISON', type: 'WEAPON', rarity: 'RARE', name: 'Épée Corrosive', description: 'L\'acide ronge tout ce qu\'elle touche.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'RARE', name: 'Kriss Empoisonné', description: 'La lame ondulée diffuse le venin plus rapidement.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'RARE', name: 'Armure de Mucus', description: 'Une substance visqueuse repousse les attaques.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'RARE', name: 'Plastron Acide', description: 'L\'acide coule lentement le long des plaques.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'RARE', name: 'Nuage Toxique', description: 'Un brouillard verdâtre envahit le terrain.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'RARE', name: 'Morsure Venimeuse', description: 'Un serpent spectral mord la cible.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'RARE', name: 'Gantelets Suintants', description: 'Du poison coule entre les jointures.' },
];

// ═══════════════════════════════════════════
// EPIC (22 items)
// ═══════════════════════════════════════════

const EPIC_ITEMS: ItemTemplate[] = [
  // BURN (4)
  { trait: 'BURN', type: 'WEAPON', rarity: 'EPIC', name: 'Claymore Infernale', description: 'Les flammes dansent le long de sa lame comme si elles étaient vivantes.' },
  { trait: 'BURN', type: 'ARMOR', rarity: 'EPIC', name: 'Armure du Magma', description: 'Coulée dans la roche en fusion, elle repousse le froid.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'EPIC', name: 'Pluie de Météores', description: 'Le ciel s\'embrase et la terre tremble.' },
  { trait: 'BURN', type: 'WEAPON', rarity: 'EPIC', name: 'Fléau de Lave', description: 'La chaîne est faite de lave solidifiée en mouvement.' },
  // FREEZE (4)
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'EPIC', name: 'Hache du Permafrost', description: 'Taillée dans la glace éternelle du Pôle Oublié.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'EPIC', name: 'Plastron Arctique', description: 'Forgé dans les profondeurs d\'un glacier millénaire.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'EPIC', name: 'Tempête de Grêle', description: 'Des blocs de glace tombent du ciel sans fin.' },
  { trait: 'FREEZE', type: 'ARMOR', rarity: 'EPIC', name: 'Cuirasse d\'Avalanche', description: 'La puissance d\'une avalanche dans chaque plaque.' },
  // LIGHTNING (4)
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'EPIC', name: 'Marteau de l\'Orage', description: 'Chaque impact déclenche un coup de tonnerre.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'EPIC', name: 'Harnais du Tonnerre', description: 'L\'orage est emprisonné dans chaque plaque.' },
  { trait: 'LIGHTNING', type: 'SPELL', rarity: 'EPIC', name: 'Frappe Orageuse', description: 'Un éclair massif tombe du ciel sur commande.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'EPIC', name: 'Trident de la Foudre', description: 'Trois pointes, trois éclairs simultanés.' },
  // SHADOW (4)
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'EPIC', name: 'Faux du Crépuscule', description: 'La frontière entre la lumière et l\'ombre prend forme.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'EPIC', name: 'Plastron du Fantôme', description: 'Tu deviens flou aux yeux de tes ennemis.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'EPIC', name: 'Éclipse', description: 'Le soleil disparaît. La panique s\'installe.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'EPIC', name: 'Cauchemar', description: 'L\'ennemi voit ses pires peurs prendre forme.' },
  // HEAL (3)
  { trait: 'HEAL', type: 'WEAPON', rarity: 'EPIC', name: 'Sceptre de l\'Aube', description: 'La lumière du matin guérit toutes les blessures.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'EPIC', name: 'Plastron de Résurrection', description: 'Les coups reçus alimentent ta force vitale.' },
  { trait: 'HEAL', type: 'SPELL', rarity: 'EPIC', name: 'Fontaine de Jouvence', description: 'Une source de vie jaillit sous tes pieds.' },
  // POISON (3)
  { trait: 'POISON', type: 'WEAPON', rarity: 'EPIC', name: 'Faux Pestilentielle', description: 'L\'odeur seule suffit à faire fuir les ennemis.' },
  { trait: 'POISON', type: 'ARMOR', rarity: 'EPIC', name: 'Carapace Venimeuse', description: 'Toucher cette armure est une erreur fatale.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'EPIC', name: 'Peste Noire', description: 'La maladie se propage à une vitesse terrifiante.' },
];

// ═══════════════════════════════════════════
// LEGENDARY (12 items — 2 per trait)
// ═══════════════════════════════════════════

const LEGENDARY_ITEMS: ItemTemplate[] = [
  { trait: 'BURN', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Fléau du Phoenix', description: 'Seul un guerrier digne peut manier cette arme née des cendres d\'un phoenix.' },
  { trait: 'BURN', type: 'SPELL', rarity: 'LEGENDARY', name: 'Nova Solaire', description: 'Une explosion de lumière pure qui calcine tout.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Lame de l\'Hiver Éternel', description: 'Celui qui la brandit ne ressent plus jamais le froid.' },
  { trait: 'FREEZE', type: 'SPELL', rarity: 'LEGENDARY', name: 'Cryostase', description: 'Fige le temps et l\'espace autour de l\'ennemi.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Éclair de Zeus', description: 'Volé à l\'Olympe. Les dieux sont furieux.' },
  { trait: 'LIGHTNING', type: 'ARMOR', rarity: 'LEGENDARY', name: 'Armure de Tesla', description: 'Un chef-d\'oeuvre de technologie et de magie combinées.' },
  { trait: 'SHADOW', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Épée du Néant', description: 'Tranchante comme l\'absence de lumière.' },
  { trait: 'SHADOW', type: 'ARMOR', rarity: 'LEGENDARY', name: 'Vêtement de l\'Invisible', description: 'Seuls ceux qui ont vu la mort peuvent le voir.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Épée de l\'Archange', description: 'Une lame sacrée qui restaure autant qu\'elle détruit.' },
  { trait: 'HEAL', type: 'ARMOR', rarity: 'LEGENDARY', name: 'Égide de la Vie', description: 'Aucune blessure ne peut être fatale tant que tu la portes.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'LEGENDARY', name: 'Croc de la Vipère Noire', description: 'Extrait du plus grand serpent jamais vu. Mortel.' },
  { trait: 'POISON', type: 'SPELL', rarity: 'LEGENDARY', name: 'Putréfaction', description: 'La chair de l\'ennemi se décompose en temps réel.' },
];

// ═══════════════════════════════════════════
// MYTHIC (6 items — 1 per trait)
// ═══════════════════════════════════════════

const MYTHIC_ITEMS: ItemTemplate[] = [
  { trait: 'BURN', type: 'WEAPON', rarity: 'MYTHIC', name: 'Ragnarok', description: 'L\'épée qui mettra fin au monde. Chaque coup déclenche un incendie.' },
  { trait: 'FREEZE', type: 'WEAPON', rarity: 'MYTHIC', name: 'Fimbulvetr', description: 'L\'arme de l\'hiver final. Un seul coup gèle l\'âme.' },
  { trait: 'LIGHTNING', type: 'WEAPON', rarity: 'MYTHIC', name: 'Mjölnir', description: 'Le marteau du dieu du tonnerre lui-même.' },
  { trait: 'SHADOW', type: 'SPELL', rarity: 'MYTHIC', name: 'Trou Noir', description: 'Même la lumière n\'en réchappe pas.' },
  { trait: 'HEAL', type: 'WEAPON', rarity: 'MYTHIC', name: 'Yggdrasil', description: 'Le bâton taillé dans l\'Arbre-Monde. La vie coule en lui.' },
  { trait: 'POISON', type: 'WEAPON', rarity: 'MYTHIC', name: 'Pandémie', description: 'Cette arme a décimé des civilisations entières.' },
];

// ═══════════════════════════════════════════
// LOOKUP
// ═══════════════════════════════════════════

const ALL_ITEMS = [...COMMON_ITEMS, ...RARE_ITEMS, ...EPIC_ITEMS, ...LEGENDARY_ITEMS, ...MYTHIC_ITEMS];

export function getItemTemplate(trait: string, type: string, rarity: string): ItemTemplate {
  // Find all matching items
  const matches = ALL_ITEMS.filter(
    i => i.rarity === rarity && i.trait === trait && i.type === type
  );

  if (matches.length > 0) {
    // Pick a random one from the pool
    return matches[Math.floor(Math.random() * matches.length)];
  }

  // Fallback: match by rarity + trait only (ignore type)
  const traitMatches = ALL_ITEMS.filter(
    i => i.rarity === rarity && i.trait === trait
  );

  if (traitMatches.length > 0) {
    return traitMatches[Math.floor(Math.random() * traitMatches.length)];
  }

  // Final fallback
  return { name: `${trait} ${type}`, description: 'Un item mystérieux aux origines inconnues.', trait, type, rarity };
}

export function getItemsByRarity(rarity: string): ItemTemplate[] {
  return ALL_ITEMS.filter(i => i.rarity === rarity);
}

export function getAllItems(): ItemTemplate[] {
  return ALL_ITEMS;
}
