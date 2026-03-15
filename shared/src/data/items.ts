import { ItemType, ItemTrait, Rarity } from '../types/item';

export interface ItemTemplate {
  name: string;
  description: string;
}

type ItemCatalogKey = `${ItemTrait}_${ItemType}_${Rarity}`;

export const ITEM_CATALOG: Record<ItemCatalogKey, ItemTemplate> = {
  // ── BURN ──
  BURN_WEAPON_COMMON: { name: 'Lame Braise', description: 'Une dague rouillée qui garde la chaleur des forges oubliées.' },
  BURN_WEAPON_RARE: { name: 'Épée Volcanique', description: 'Forgée dans la lave du Mont Ignis, elle brûle au toucher.' },
  BURN_WEAPON_EPIC: { name: 'Claymore Infernale', description: 'Les flammes dansent le long de sa lame comme si elles étaient vivantes.' },
  BURN_WEAPON_LEGENDARY: { name: 'Fléau du Phoenix', description: 'Seul un guerrier digne peut manier cette arme née des cendres d\'un phoenix.' },
  BURN_WEAPON_MYTHIC: { name: 'Ragnarok', description: 'L\'épée qui mettra fin au monde. Chaque coup déclenche un incendie.' },
  BURN_ARMOR_COMMON: { name: 'Plastron Fumant', description: 'Un plastron noirci par la suie, encore tiède.' },
  BURN_ARMOR_RARE: { name: 'Cotte de Braises', description: 'Les mailles rougeoient comme des charbons ardents.' },
  BURN_ARMOR_EPIC: { name: 'Armure du Magma', description: 'Coulée dans la roche en fusion, elle repousse le froid.' },
  BURN_ARMOR_LEGENDARY: { name: 'Cuirasse Solaire', description: 'Forgée à la surface du soleil par les Anciens.' },
  BURN_ARMOR_MYTHIC: { name: 'Carapace du Dragon-Roi', description: 'Les écailles du dernier dragon, indestructibles et brûlantes.' },
  BURN_SPELL_COMMON: { name: 'Étincelle', description: 'Un petit sort de feu. Ça fait le travail.' },
  BURN_SPELL_RARE: { name: 'Boule de Feu', description: 'Le classique des mages de combat. Jamais démodé.' },
  BURN_SPELL_EPIC: { name: 'Pluie de Météores', description: 'Le ciel s\'embrase et la terre tremble.' },
  BURN_SPELL_LEGENDARY: { name: 'Nova Solaire', description: 'Une explosion de lumière pure qui calcine tout.' },
  BURN_SPELL_MYTHIC: { name: 'Souffle de l\'Enfer', description: 'Le sort interdit. On dit que même les dieux le craignent.' },

  // ── FREEZE ──
  FREEZE_WEAPON_COMMON: { name: 'Dague Givrée', description: 'Une lame recouverte d\'une fine couche de givre permanent.' },
  FREEZE_WEAPON_RARE: { name: 'Épée du Blizzard', description: 'Le vent hurle quand elle fend l\'air.' },
  FREEZE_WEAPON_EPIC: { name: 'Hache du Permafrost', description: 'Taillée dans la glace éternelle du Pôle Oublié.' },
  FREEZE_WEAPON_LEGENDARY: { name: 'Lame de l\'Hiver Éternel', description: 'Celui qui la brandit ne ressent plus jamais le froid.' },
  FREEZE_WEAPON_MYTHIC: { name: 'Fimbulvetr', description: 'L\'arme de l\'hiver final. Un seul coup gèle l\'âme.' },
  FREEZE_ARMOR_COMMON: { name: 'Tunique Glacée', description: 'Froide au toucher mais étrangement confortable.' },
  FREEZE_ARMOR_RARE: { name: 'Armure de Cristal', description: 'Des cristaux de glace forment une protection scintillante.' },
  FREEZE_ARMOR_EPIC: { name: 'Plastron Arctique', description: 'Forgé dans les profondeurs d\'un glacier millénaire.' },
  FREEZE_ARMOR_LEGENDARY: { name: 'Égide du Zéro Absolu', description: 'La température autour du porteur chute drastiquement.' },
  FREEZE_ARMOR_MYTHIC: { name: 'Manteau de la Banshee', description: 'Le cri de la Banshee est tissé dans chaque fibre.' },
  FREEZE_SPELL_COMMON: { name: 'Souffle Glacé', description: 'Un courant d\'air froid. Basique mais efficace.' },
  FREEZE_SPELL_RARE: { name: 'Cage de Givre', description: 'Des barreaux de glace emprisonnent la cible.' },
  FREEZE_SPELL_EPIC: { name: 'Tempête de Grêle', description: 'Des blocs de glace tombent du ciel sans fin.' },
  FREEZE_SPELL_LEGENDARY: { name: 'Cryostase', description: 'Fige le temps et l\'espace autour de l\'ennemi.' },
  FREEZE_SPELL_MYTHIC: { name: 'Ère Glaciaire', description: 'Plonge le monde entier dans un hiver sans fin.' },

  // ── LIGHTNING ──
  LIGHTNING_WEAPON_COMMON: { name: 'Couteau Statique', description: 'Tes cheveux se dressent quand tu le tiens.' },
  LIGHTNING_WEAPON_RARE: { name: 'Lance Foudroyante', description: 'L\'air crépite d\'électricité autour de la pointe.' },
  LIGHTNING_WEAPON_EPIC: { name: 'Marteau de l\'Orage', description: 'Chaque impact déclenche un coup de tonnerre.' },
  LIGHTNING_WEAPON_LEGENDARY: { name: 'Éclair de Zeus', description: 'Volé à l\'Olympe. Les dieux sont furieux.' },
  LIGHTNING_WEAPON_MYTHIC: { name: 'Mjölnir', description: 'Le marteau du dieu du tonnerre lui-même.' },
  LIGHTNING_ARMOR_COMMON: { name: 'Gilet Conducteur', description: 'Des fils de cuivre tissés dans le tissu. Ça picote.' },
  LIGHTNING_ARMOR_RARE: { name: 'Armure Voltaïque', description: 'Des arcs électriques parcourent sa surface.' },
  LIGHTNING_ARMOR_EPIC: { name: 'Harnais du Tonnerre', description: 'L\'orage est emprisonné dans chaque plaque.' },
  LIGHTNING_ARMOR_LEGENDARY: { name: 'Armure de Tesla', description: 'Un chef-d\'oeuvre de technologie et de magie combinées.' },
  LIGHTNING_ARMOR_MYTHIC: { name: 'Manteau de la Tempête', description: 'Porté par le Seigneur des Orages avant sa chute.' },
  LIGHTNING_SPELL_COMMON: { name: 'Décharge', description: 'Un petit choc. Désagréable.' },
  LIGHTNING_SPELL_RARE: { name: 'Chaîne d\'Éclairs', description: 'La foudre saute de cible en cible.' },
  LIGHTNING_SPELL_EPIC: { name: 'Frappe Orageuse', description: 'Un éclair massif tombe du ciel sur commande.' },
  LIGHTNING_SPELL_LEGENDARY: { name: 'Jugement Divin', description: 'La foudre des dieux frappe les indignes.' },
  LIGHTNING_SPELL_MYTHIC: { name: 'Apocalypse Électrique', description: 'Le ciel entier se déchire en mille éclairs.' },

  // ── SHADOW ──
  SHADOW_WEAPON_COMMON: { name: 'Lame Voilée', description: 'Elle semble disparaître quand tu ne la regardes pas.' },
  SHADOW_WEAPON_RARE: { name: 'Dague de Minuit', description: 'Forgée à minuit pile, lors d\'une éclipse totale.' },
  SHADOW_WEAPON_EPIC: { name: 'Faux du Crépuscule', description: 'La frontière entre la lumière et l\'ombre prend forme.' },
  SHADOW_WEAPON_LEGENDARY: { name: 'Épée du Néant', description: 'Tranchante comme l\'absence de lumière.' },
  SHADOW_WEAPON_MYTHIC: { name: 'Murmure du Vide', description: 'Cette arme n\'existe pas vraiment. Et pourtant elle tue.' },
  SHADOW_ARMOR_COMMON: { name: 'Cape Sombre', description: 'Une cape qui absorbe la lumière autour d\'elle.' },
  SHADOW_ARMOR_RARE: { name: 'Armure Spectrale', description: 'Semi-transparente, elle laisse passer certains coups.' },
  SHADOW_ARMOR_EPIC: { name: 'Plastron du Fantôme', description: 'Tu deviens flou aux yeux de tes ennemis.' },
  SHADOW_ARMOR_LEGENDARY: { name: 'Vêtement de l\'Invisible', description: 'Seuls ceux qui ont vu la mort peuvent le voir.' },
  SHADOW_ARMOR_MYTHIC: { name: 'Seconde Peau du Vide', description: 'Tu ne fais plus partie du monde visible.' },
  SHADOW_SPELL_COMMON: { name: 'Voile d\'Ombre', description: 'Un léger brouillard noir. Distrayant.' },
  SHADOW_SPELL_RARE: { name: 'Pas de l\'Ombre', description: 'Tu te déplaces entre les ombres.' },
  SHADOW_SPELL_EPIC: { name: 'Éclipse', description: 'Le soleil disparaît. La panique s\'installe.' },
  SHADOW_SPELL_LEGENDARY: { name: 'Dimension Miroir', description: 'Tu envoies l\'ennemi dans un reflet inversé du monde.' },
  SHADOW_SPELL_MYTHIC: { name: 'Trou Noir', description: 'Même la lumière n\'en réchappe pas.' },

  // ── HEAL ──
  HEAL_WEAPON_COMMON: { name: 'Bâton de Vie', description: 'Un simple bâton de bois qui bourgeonne en permanence.' },
  HEAL_WEAPON_RARE: { name: 'Lame Régénérante', description: 'Chaque coupure qu\'elle inflige se soigne en retour.' },
  HEAL_WEAPON_EPIC: { name: 'Sceptre de l\'Aube', description: 'La lumière du matin guérit toutes les blessures.' },
  HEAL_WEAPON_LEGENDARY: { name: 'Épée de l\'Archange', description: 'Une lame sacrée qui restaure autant qu\'elle détruit.' },
  HEAL_WEAPON_MYTHIC: { name: 'Yggdrasil', description: 'Le bâton taillé dans l\'Arbre-Monde. La vie coule en lui.' },
  HEAL_ARMOR_COMMON: { name: 'Tunique du Guérisseur', description: 'Douce et apaisante. Les blessures se ferment lentement.' },
  HEAL_ARMOR_RARE: { name: 'Armure Vivante', description: 'Des lianes vivantes referment les brèches d\'elles-mêmes.' },
  HEAL_ARMOR_EPIC: { name: 'Plastron de Résurrection', description: 'Les coups reçus alimentent ta force vitale.' },
  HEAL_ARMOR_LEGENDARY: { name: 'Égide de la Vie', description: 'Aucune blessure ne peut être fatale tant que tu la portes.' },
  HEAL_ARMOR_MYTHIC: { name: 'Coeur du Monde', description: 'Le battement de la planète résonne dans cette armure.' },
  HEAL_SPELL_COMMON: { name: 'Premiers Soins', description: 'Un pansement magique. Ça aide.' },
  HEAL_SPELL_RARE: { name: 'Régénération', description: 'Tes cellules se réparent à vue d\'oeil.' },
  HEAL_SPELL_EPIC: { name: 'Fontaine de Jouvence', description: 'Une source de vie jaillit sous tes pieds.' },
  HEAL_SPELL_LEGENDARY: { name: 'Résurrection', description: 'Tu reviens de l\'au-delà, plus fort qu\'avant.' },
  HEAL_SPELL_MYTHIC: { name: 'Immortalité', description: 'La mort elle-même détourne le regard.' },

  // ── POISON ──
  POISON_WEAPON_COMMON: { name: 'Dague Enduite', description: 'Un peu de venin de serpent sur la lame. Classique.' },
  POISON_WEAPON_RARE: { name: 'Épée Corrosive', description: 'L\'acide ronge tout ce qu\'elle touche.' },
  POISON_WEAPON_EPIC: { name: 'Faux Pestilentielle', description: 'L\'odeur seule suffit à faire fuir les ennemis.' },
  POISON_WEAPON_LEGENDARY: { name: 'Croc de la Vipère Noire', description: 'Extrait du plus grand serpent jamais vu. Mortel.' },
  POISON_WEAPON_MYTHIC: { name: 'Pandémie', description: 'Cette arme a décimé des civilisations entières.' },
  POISON_ARMOR_COMMON: { name: 'Gilet Toxique', description: 'Trempé dans un marais. Ça pue mais ça protège.' },
  POISON_ARMOR_RARE: { name: 'Armure de Mucus', description: 'Une substance visqueuse repousse les attaques.' },
  POISON_ARMOR_EPIC: { name: 'Carapace Venimeuse', description: 'Toucher cette armure est une erreur fatale.' },
  POISON_ARMOR_LEGENDARY: { name: 'Peau de la Méduse', description: 'Le regard pétrifie, le contact empoisonne.' },
  POISON_ARMOR_MYTHIC: { name: 'Exosquelette du Fléau', description: 'L\'armure de la Peste incarnée. Tout meurt autour.' },
  POISON_SPELL_COMMON: { name: 'Crachat Acide', description: 'Dégoûtant mais efficace.' },
  POISON_SPELL_RARE: { name: 'Nuage Toxique', description: 'Un brouillard verdâtre envahit le terrain.' },
  POISON_SPELL_EPIC: { name: 'Peste Noire', description: 'La maladie se propage à une vitesse terrifiante.' },
  POISON_SPELL_LEGENDARY: { name: 'Putréfaction', description: 'La chair de l\'ennemi se décompose en temps réel.' },
  POISON_SPELL_MYTHIC: { name: 'Extinction', description: 'Le dernier sort. Plus rien ne vit après ça.' },
};

export function getItemTemplate(trait: string, type: string, rarity: string): ItemTemplate {
  const key = `${trait}_${type}_${rarity}` as ItemCatalogKey;
  return ITEM_CATALOG[key] || { name: `${trait} ${type}`, description: 'Un item mystérieux.' };
}
