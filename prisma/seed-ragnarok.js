import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding Ragnarok content...\n');

  await prisma.post.deleteMany();

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Ragnarok Online: The Ultimate MMORPG Experience',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        categoryId: 1,
        description: 'Discover the magical world of Ragnarok Online, where adventure and friendship await.',
        content: 'Ragnarok Online is a classic MMORPG that has captivated players worldwide for over two decades. Set in the fantasy world of Midgard, players embark on epic quests, battle fearsome monsters, and forge lasting friendships...',
        statusId: 1,
        author: 'RO Veteran',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Best Classes for Beginners in Ragnarok Online',
        image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
        categoryId: 2,
        description: 'A comprehensive guide to choosing your first class in RO.',
        content: 'Starting your journey in Ragnarok Online? Choosing the right class is crucial. Swordsman offers great survivability, Acolyte provides support capabilities, and Mage delivers powerful magic attacks. Each path offers unique gameplay...',
        statusId: 1,
        author: 'Game Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Prontera: Heart of the Rune-Midgarts Kingdom',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        categoryId: 1,
        description: 'Explore the capital city and its rich history.',
        content: 'Prontera stands as the magnificent capital of the Rune-Midgarts Kingdom. This bustling city serves as the central hub for adventurers, featuring the majestic Prontera Castle, busy marketplaces, and the Sanctuary...',
        statusId: 1,
        author: 'Lore Master',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Legendary MVP Hunting Guide',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        categoryId: 3,
        description: 'Master the art of hunting the most powerful bosses.',
        content: 'MVP (Most Valuable Player) monsters are the ultimate challenge in Ragnarok Online. From the terrifying Baphomet in the Labyrinth to the mighty Amon Ra in Pyramid, each MVP requires strategy, teamwork, and proper preparation...',
        statusId: 1,
        author: 'MVP Hunter',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'War of Emperium: Guild Warfare Strategy',
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc',
        categoryId: 3,
        description: 'Tactics and strategies for conquering guild castles.',
        content: 'The War of Emperium (WoE) represents the pinnacle of guild warfare in Ragnarok Online. Guilds battle for control of powerful castles, utilizing strategic positioning, coordinated attacks, and specialized builds...',
        statusId: 1,
        author: 'Guild Leader',
        published: true
      }
    }),
    prisma.post.create({
      data: {
        title: 'Crafting and Refining: Maximizing Your Equipment',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        categoryId: 2,
        description: 'Learn the secrets of equipment enhancement.',
        content: 'Equipment enhancement is crucial for character progression. From basic refining to advanced card slotting, understanding the smithing system can make the difference between victory and defeat. Safe refine limits, catalyst usage...',
        statusId: 1,
        author: 'Master Smith',
        published: true
      }
    })
  ]);

  console.log(`Created ${posts.length} Ragnarok posts\n`);
  posts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title}`);
  });
  console.log('\n🎉 Ragnarok content loaded!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());