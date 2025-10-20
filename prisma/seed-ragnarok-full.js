import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding Ragnarok content (Full)...\n');

  await prisma.post.deleteMany();

  const posts = await Promise.all([
    // ALL / Highlight
    prisma.post.create({
      data: {
        title: 'Ragnarok Online: The Ultimate MMORPG Experience',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        categoryId: 1,
        description: 'Discover the magical world of Ragnarok Online, where adventure and friendship await.',
        content: 'Ragnarok Online is a classic MMORPG that has captivated players worldwide for over two decades. Set in the fantasy world of Midgard, players embark on epic quests, battle fearsome monsters, and forge lasting friendships. The game offers diverse character classes, intricate crafting systems, and competitive guild warfare.',
        statusId: 1,
        author: 'RO Veteran',
        published: true
      }
    }),

    // BEGINNER
    prisma.post.create({
      data: {
        title: 'Getting Started: Your First Steps in Midgard',
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
        categoryId: 2,
        description: 'Complete beginner guide to starting your Ragnarok journey.',
        content: 'Welcome to Ragnarok Online! This comprehensive guide will walk you through character creation, basic controls, and your first quests. Learn how to navigate the Training Grounds, choose your starting equipment, and understand the fundamental game mechanics that will serve you throughout your adventure.',
        statusId: 1,
        author: 'Game Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Best Classes for Beginners in Ragnarok Online',
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41',
        categoryId: 2,
        description: 'A comprehensive guide to choosing your first class in RO.',
        content: 'Starting your journey in Ragnarok Online? Choosing the right class is crucial. Swordsman offers great survivability and straightforward gameplay. Acolyte provides support capabilities while being able to solo effectively. Mage delivers powerful magic attacks from range. Each path offers unique gameplay experiences and progression options.',
        statusId: 1,
        author: 'Class Expert',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Leveling Guide: 1-99 Fastest Routes',
        image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
        categoryId: 2,
        description: 'Optimize your leveling journey from novice to transcendent.',
        content: 'Maximize your experience gain with this detailed leveling guide. Learn the best hunting spots for each level range, recommended party compositions, and efficient quest routes. Includes tips for solo and party play, optimal equipment upgrades, and stamina management strategies.',
        statusId: 1,
        author: 'Leveling Pro',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Understanding Stats: Building Your Perfect Character',
        image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5',
        categoryId: 2,
        description: 'Master the stat system and create optimal builds.',
        content: 'Stats determine your character effectiveness. STR affects physical damage, AGI increases attack speed and dodge, VIT provides HP and defense, INT boosts magic damage and SP, DEX improves hit rate and casting speed, and LUK influences critical rate and perfect dodge. Learn optimal stat distributions for each class.',
        statusId: 1,
        author: 'Build Specialist',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Essential Items Every Novice Should Have',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        categoryId: 2,
        description: 'Must-have items for starting players.',
        content: 'Essential beginner items include Red Potions for HP recovery, Blue Potions for SP, Butterfly Wings for quick escapes, and basic equipment from NPCs. Learn where to buy these items, how to use them effectively, and when to upgrade to better alternatives as you progress.',
        statusId: 1,
        author: 'Merchant Guide',
        published: true
      }
    }),

    // PvP/WoE
    prisma.post.create({
      data: {
        title: 'War of Emperium: Guild Warfare Strategy',
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc',
        categoryId: 3,
        description: 'Tactics and strategies for conquering guild castles.',
        content: 'The War of Emperium represents the pinnacle of guild warfare in Ragnarok Online. Guilds battle for control of powerful castles, utilizing strategic positioning, coordinated attacks, and specialized builds. Learn offensive and defensive formations, breaker strategies, support coordination, and emergency protocols.',
        statusId: 1,
        author: 'Guild Leader',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'PvP Class Tier List and Matchups',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        categoryId: 3,
        description: 'Dominate PvP with the best classes and counter strategies.',
        content: 'Current PvP meta analysis covering top-tier classes, their strengths and weaknesses. Learn class-specific matchup strategies, equipment requirements, skill rotations, and positioning tactics. Includes counters for common builds and adaptation strategies.',
        statusId: 1,
        author: 'PvP Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Building the Perfect WoE Character',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        categoryId: 3,
        description: 'Specialized builds for War of Emperium.',
        content: 'WoE requires specialized character builds optimized for castle warfare. Breakers need high VIT and AGI, defenders require tank builds with crowd control, and support classes need survivability. Learn stat allocation, essential equipment, and role-specific skills for each WoE position.',
        statusId: 1,
        author: 'WoE Strategist',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Arena Guide: Mastering Battlegrounds',
        image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f',
        categoryId: 3,
        description: 'Compete in arena battles and earn exclusive rewards.',
        content: 'Battlegrounds offer structured PvP with unique objectives. Learn map-specific strategies, optimal team compositions, point management, and communication tactics. Includes reward systems, ranking progression, and seasonal exclusive items.',
        statusId: 1,
        author: 'Arena Champion',
        published: true
      }
    }),

    // MVP
    prisma.post.create({
      data: {
        title: 'Legendary MVP Hunting Guide',
        image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
        categoryId: 4,
        description: 'Master the art of hunting the most powerful bosses.',
        content: 'MVP monsters are the ultimate challenge in Ragnarok Online. From the terrifying Baphomet in the Labyrinth to the mighty Amon Ra in Pyramid, each MVP requires strategy, teamwork, and proper preparation. Learn spawn times, patterns, resistances, and optimal party compositions.',
        statusId: 1,
        author: 'MVP Hunter',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Top 10 MVPs Worth Hunting',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        categoryId: 4,
        description: 'Best MVP targets for loot and experience.',
        content: 'These MVPs offer the best rewards for time invested. Includes drop tables, difficulty ratings, spawn locations, and estimated clear times. Features both beginner-friendly and end-game MVPs with their most valuable card drops and equipment.',
        statusId: 1,
        author: 'Drop Expert',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Solo MVP Builds: Hunt Alone Successfully',
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41',
        categoryId: 4,
        description: 'Classes and builds capable of soloing MVPs.',
        content: 'Some classes can effectively solo certain MVPs with proper builds and tactics. Learn which MVPs are soloable, required equipment, skill rotations, consumable management, and safety protocols. Includes class-specific guides for Sniper, High Wizard, and Champion solo builds.',
        statusId: 1,
        author: 'Solo Hunter',
        published: true
      }
    }),

    // CRAFTING
    prisma.post.create({
      data: {
        title: 'Crafting and Refining: Maximizing Your Equipment',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        categoryId: 5,
        description: 'Learn the secrets of equipment enhancement.',
        content: 'Equipment enhancement is crucial for character progression. From basic refining to advanced card slotting, understanding the smithing system can make the difference between victory and defeat. Safe refine limits, catalyst usage, and refiner NPCs explained in detail.',
        statusId: 1,
        author: 'Master Smith',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Card System Guide: Maximize Your Power',
        image: 'https://images.unsplash.com/photo-1614680376408-81e0d76ade7e',
        categoryId: 5,
        description: 'Understanding cards and optimal slotting strategies.',
        content: 'Cards provide powerful bonuses when socketed into equipment. Learn card categories, combo effects, best-in-slot recommendations for each class, and cost-effective alternatives. Includes farming locations for valuable cards and market price trends.',
        statusId: 1,
        author: 'Card Collector',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Forging Perfect Weapons: Blacksmith Guide',
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b',
        categoryId: 5,
        description: 'Master the art of weapon creation.',
        content: 'Blacksmiths can forge weapons with bonus stats. Learn material requirements, forging mechanics, stat probabilities, and how to create highly refined weapons. Includes cost analysis and market values for popular forged weapons.',
        statusId: 1,
        author: 'Forgemaster',
        published: true
      }
    }),

    // LORE
    prisma.post.create({
      data: {
        title: 'Prontera: Heart of the Rune-Midgarts Kingdom',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        categoryId: 6,
        description: 'Explore the capital city and its rich history.',
        content: 'Prontera stands as the magnificent capital of the Rune-Midgarts Kingdom. This bustling city serves as the central hub for adventurers, featuring the majestic Prontera Castle, busy marketplaces, and the Sanctuary. Learn about its history, key locations, and important NPCs.',
        statusId: 1,
        author: 'Lore Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'The Legend of Yggdrasil Tree',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        categoryId: 6,
        description: 'Discover the mythology behind RO.',
        content: 'The World Tree Yggdrasil connects all realms in Ragnarok Online mythology. Learn about its significance, the nine worlds it connects, and how it influences the game story. Includes connections to Norse mythology and in-game lore quests.',
        statusId: 1,
        author: 'Historian',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'The God Items: Legendary Artifacts',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        categoryId: 6,
        description: 'Stories behind the most powerful equipment.',
        content: 'God Items are legendary equipment pieces with incredible power. Learn their origins, the quests required to obtain them, and their significance in Ragnarok lore. Includes Sleipnir, Mjolnir, and other mythological artifacts.',
        statusId: 1,
        author: 'Artifact Scholar',
        published: true
      }
    }),

    // EVENTS
    prisma.post.create({
      data: {
        title: 'Seasonal Events Guide 2024',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        categoryId: 7,
        description: 'Maximize rewards from special events.',
        content: 'Seasonal events offer exclusive items, experience bonuses, and unique challenges. Learn event schedules, optimal farming strategies, exclusive rewards, and limited-time quests. Includes Christmas, Halloween, and Summer events with their special mechanics.',
        statusId: 1,
        author: 'Event Coordinator',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Monster Taming: Catch Your Perfect Pet',
        image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca',
        categoryId: 7,
        description: 'Guide to taming and raising monsters as pets.',
        content: 'Pet system allows you to tame monsters as companions. Learn taming mechanics, best pets for each class, feeding requirements, intimacy management, and pet evolution systems. Includes rare pet locations and benefits.',
        statusId: 1,
        author: 'Pet Trainer',
        published: true
      }
    }),

    // BUILDS
    prisma.post.create({
      data: {
        title: 'Meta Builds for Every Class',
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
        categoryId: 8,
        description: 'Current best builds for PvE and PvP.',
        content: 'These builds dominate the current meta across all content types. Includes stat distributions, skill builds, equipment recommendations, and playstyle guides for every class. Regular updates based on balance patches and meta shifts.',
        statusId: 1,
        author: 'Build Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Budget Builds: Strong Without Breaking Bank',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
        categoryId: 8,
        description: 'Effective builds for players on limited budgets.',
        content: 'Competitive builds using affordable equipment. Learn cost-effective alternatives to expensive items, efficient zeny farming methods while building your character, and upgrade priorities. Proves you do not need expensive gear to be effective.',
        statusId: 1,
        author: 'Budget Expert',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'End-Game Builds: Maximum Power',
        image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
        categoryId: 8,
        description: 'Ultimate builds for veteran players.',
        content: 'Min-maxed builds for players with resources and dedication. Includes BiS (Best in Slot) equipment for every slot, perfect stat allocations, advanced skill rotations, and optimization techniques. These builds represent peak character performance.',
        statusId: 1,
        author: 'Min-Max Specialist',
        published: true
      }
    })
  ]);

  console.log(`Created ${posts.length} Ragnarok posts\n`);
  posts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title}`);
  });
  console.log('\n🎉 Full Ragnarok content loaded!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());