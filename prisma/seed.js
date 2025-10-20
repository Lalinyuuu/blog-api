import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUniqueSlug(title) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  let counter = 1;
  let uniqueSlug = slug;
  while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

async function main() {
  console.log('🎮 Seeding Ragnarok content...\n');

  // ลบข้อมูลเก่าทั้งหมด
  console.log('Deleting old data...');
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old data deleted\n');

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ragnarok.com',
      username: 'ragnarok_admin',
      password: adminPassword,
      name: 'RO Veteran',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'gamemaster@ragnarok.com',
      username: 'game_master',
      password: userPassword,
      name: 'Game Master',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'mvphunter@ragnarok.com',
      username: 'mvp_hunter',
      password: userPassword,
      name: 'MVP Hunter',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  });

  console.log('Created 3 users\n');

  const postsData = [
    // BUILDS — Budget
    {
      title: 'Budget-Friendly Builds in Ragnarok Online',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
      category: 'Builds',
      description: 'Low-cost Archer/Hunter, Priest, and Swordsman builds plus money & upgrade roadmap.',
      content: `
  # Budget-Friendly Builds in Ragnarok Online (That Actually Work)
  
  Starting fresh? You don’t need MVP cards or +10 gears to progress. This guide covers **three proven, low-cost builds**—**Archer/Hunter**, **Acolyte/Priest**, and **Swordsman**—plus **money tips** and a **smart upgrade order**.
  
  ---
  
  ## TL;DR Priorities
  
  1. **Element > refine** — elemental arrows/converters before gambling for +9/+10.  
  2. **Evergreen cards first:** Raydric, Marc, Hydra, Skeleton Worker, Thara Frog.  
  3. **Hit consistency breakpoints** (DEX/INT/VIT/ASPD) before luxury items.
  
  ---
  
  ## Archer / Hunter — F2P Workhorse
  
  **Stats:** DEX 90–100 • AGI 70–90 • LUK 20–40 • VIT 20–40 optional
  
  | Slot | Budget Item | Why it works | Card |
  |---|---|---|---|
  | Weapon | Composite Bow [4] / Hunter Bow | Cheap + scales with elemental arrows | Hydra / Skel Worker |
  | Armor | Tights [1] / Chain Mail [1] | DEX/ATK or sturdiness | Pecopeco |
  | Garment | Muffler [1] | Neutral resist or Flee | Raydric / Bapho Jr. |
  | Shoes | Boots [1] | HP/SP sustain | Matyr / Verit |
  | Shield | — | Bows 2H, skip early | — |
  | Accessory | Clip [1] / Earring | QoL stats | Smokie / Phen (alt builds) |
  
  **Play:** kite → swap **elemental arrows** (Fire vs Earth, Silver vs Undead, Wind vs Water). Use traps to control packs.
  
  ---
  
  ## Acolyte / Priest — Budget Support Hero
  
  **Stats:** INT 90–99 • DEX 50–70 • VIT 20–40
  
  | Slot | Budget Item | Why it works | Card |
  |---|---|---|---|
  | Weapon | Silver Staff / Healing Staff | Early MATK/Heal | — |
  | Shield | Buckler/Guard | Huge EHP/cheap | Thara Frog |
  | Armor | Saint’s Robe [1] | Resist & common | Marc (anti-freeze) |
  | Garment | Muffler [1] | Neutral resist | Raydric |
  | Shoes | Shoes [1] | Sustain | Verit |
  | Accessory | Rosary / Clip [1] | Cast & utility | Phen (no cast cancel) |
  
  **Toolkit:** Bless/Increase AGI uptime, Safety Wall on tanks, Lex Aeterna before burst, Phen to avoid cast flinch.
  
  ---
  
  ## Swordsman — Solid Beginner Tank/DPS
  
  **Stats:** STR 80–90 • VIT 70–90 • DEX 30–40 • (AGI 20–40 if solo)
  
  | Slot | Budget Item | Why | Card |
  |---|---|---|---|
  | Weapon | Broadsword [1] / Pike [4] | Flexible & cheap | Skel Worker/Hydra |
  | Shield | Buckler/Guard | Mitigation | Thara Frog |
  | Armor | Chain Mail [1] | Sturdy | Pecopeco |
  | Garment | Manteau/Muffler [1] | Neutral resist | Raydric |
  | Shoes | Greaves [1] | EHP | Matyr/Verit |
  | Accessory | Ring/Clip [1] | QoL/ATK | stat cards |
  
  **Tips:** pull → wall-stack → Bowling Bash (Knight path). Keep **Endure** for pathing.
  
  ---
  
  ## Money & Upgrade Roadmap
  
  - **Farm cards that always sell:** Hydra, Raydric, Thara Frog, Marc, Skeleton Worker.  
  - **Daily loops:** Jellopy/Phracon/Trunks/Fluff → sell in bulk.  
  - **Order:** Element access → Raydric/Marc/Thara → weapon slots (Hydra/SW) → safe +4 → weapon +7 / armor +7 → QoL headgears.
  
  **3-Day Plan:**  
  *Day 1:* job change → Composite Bow/Broadsword → element arrows.  
  *Day 2:* first evergreen card; consider +7 weapon.  
  *Day 3:* Phen (Priest) or round out Archer slots; save for Marc.
  
  Low-budget doesn’t mean weak—**it means efficient**. Build the fundamentals now and add luxury later.
      `,
      authorId: user1.id,
      status: 'published'
    },
  
    // BUILDS — Meta
    {
      title: 'Meta Builds for Every Class (Quick Start)',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      category: 'Builds',
      description: 'A practical snapshot of strong PvE/PvP archetypes and why they work.',
      content: `
  # Meta Builds for Every Class — A Practical Snapshot
  
  Metas shift, but principles last. Here’s a **server-agnostic** overview of strong archetypes and the logic behind them so you can adapt to your patch.
  
  ## High Wizard — Control & AoE DPS
  **Stats:** INT 99, DEX 90+, VIT 20–40  
  **Core:** Storm Gust (freeze control), Meteor Storm (zone burn), LoV (vs AGI mobs)  
  **Gear Path:** Staff of Destruction/Healing Staff → Marc, Raydric → +7 staff/robe  
  **Why it works:** map control + party carry during WoE chokes and dungeons.
  
  ## Sniper/Ranger — Trapper or ASPD Falcon
  **Stats:** DEX 99+, AGI 90+, LUK 50–70  
  **Core:** Sharp Shooting/Arrow Shower, Blitz Beat (Falcon), Ankle Snare  
  **Gear:** Hunter/Elven Bow, Tights [1], Raydric, Hydra/SW  
  **Why:** safe ranged burst or trap control; fantastic farmer.
  
  ## Lord Knight — Bowling Bash Bruiser
  **Stats:** STR 99+, VIT 80–100, DEX 40–50  
  **Core:** Bowling Bash, Spiral Pierce (patch-dependent), Provoke, Endure  
  **Gear:** Thara Frog shield, Raydric, Pecopeco armor  
  **Why:** front-line disruption + reliable melee DPS.
  
  ## Assassin Cross — Crit or Soul Destroyer
  **Stats:** LUK/AGI focus for Crit or INT/DEX for SD hybrid  
  **Core:** Crit auto-attacks, Sonic Blow, Cloaking; SD for ranged poke  
  **Why:** picks targets, scales with cards/elements, excels at backline pressure.
  
  ## Priest/High Priest — The Always-Needed Support
  **Stats:** INT/DEX with splash of VIT  
  **Core:** Bless/AGI, Safety Wall, Lex Aeterna, Assumptio (later patches)  
  **Why:** throughput + anti-wipe utility.
  
  > **Takeaway:** prioritize **element, card synergies, and cast/ASPD breakpoints**. Those win patches.
      `,
      authorId: user2.id,
      status: 'published'
    },
  
    // BEGINNER — Onboarding
    {
      title: 'Getting Started: Your First Steps in Midgard',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
      category: 'Beginner',
      description: 'A friendly roadmap from Novice to your first real maps and parties.',
      content: `
  # Getting Started: Your First Steps in Midgard
  
  Welcome! Here’s a smooth route from **Novice → First Job → Real maps** without wasting time.
  
  ## 1) Pick a Starter That Fits You
  - **Swordsman:** tough, straightforward, great for learning pulls.  
  - **Acolyte:** party magnet; low budget; heals never go out of style.  
  - **Archer:** safe ranged farmer; strong with elemental arrows.
  
  ## 2) Early Leveling Route (Examples)
  
  | Base | Map | Why |
  |---|---|---|
  | 1–15 | South Prontera Field | gentle mobs; quick intro |
  | 15–30 | Payon Forest / Culverts 1F | ranged-friendly or simple UD mobs |
  | 30–50 | Payon Dungeon 1F–2F / Geffen Dungeon 1F | dense packs, better drops |
  | 50+ | Orc Village / Byalan 1F–2F | elemental advantage shines |
  
  ## 3) Spend Stats Wisely
  - **Physical:** STR/DEX/AGI as your main trio.  
  - **Magic:** INT first, DEX for cast.  
  - **Support:** INT + VIT, splash DEX for QoL.
  
  ## 4) Early Purchases That Pay Off
  - **Elemental arrows/converters** (power spike).  
  - **Raydric/Marc/Thara Frog** when you can afford them.  
  - **Safe refines** to +4 (free), then **+7 weapon** if price is right.
  
  ## 5) Party Etiquette
  Bring pots, call out pulls, don’t face-tank what you can kite, and always thank your Priest. You’ll be on guild radars in no time.
      `,
      authorId: user1.id,
      status: 'published'
    },
  
    // PVP/WoE — Strategy
    {
      title: 'War of Emperium: Guild Warfare Strategy',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
      category: 'PvP',
      description: 'From entry chokes to Emperium rooms: comps, roles, and win conditions.',
      content: `
  # War of Emperium: Guild Warfare Strategy
  
  WoE is choreography: **comps**, **cooldowns**, and **positioning**. Winning is about coordination, not just numbers.
  
  ## Core Squad Roles
  
  | Role | Classes | Job |
  |---|---|---|
  | Front | Lord Knight, Paladin | soak damage, peel, open space |
  | Control | Wizard/High Wizard, Professor | Storm Gust/Meteor, Land Protector, Dispel |
  | Support | High Priest | Heal, SW/Kyrie, Lex Aeterna |
  | Picks | Assassin Cross, Sniper | delete supports, break lines |
  | Objective | High ASPD melee | break Emperium fast |
  
  ## Choke → Hallway → Emp Room
  
  1. **Choke:** Wizards own this. LP counters enemy AoE.  
  2. **Push:** Knights wall-walk and BB to create gaps.  
  3. **Emp:** Protect with SW and LP; burst invaders; maximize ASPD on the breaker.
  
  **Consumables/cards** that matter every week: **Marc**, **Raydric**, **Thara Frog**, **ED** alt armor, element res pots. Communication wins more fights than +10s.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // PVP — Arena
    {
      title: 'Arena PvP Strategies: Small-Scale Domination',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800',
      category: 'PvP',
      description: 'Tight comps, CC windows, and burst timing.',
      content: `
  # Arena PvP Strategies: Small-Scale Domination
  
  Arena is about **focus fire** and **crowd control**.
  
  ## The Meta Trio
  - **Damage:** Assassin Cross (Crit/SD) or Wizard (burst).  
  - **Control/Debuff:** Professor (Dispel, LP, Wall of Fog).  
  - **Support/Tank:** High Priest + LK/Paladin.
  
  ## Win Pattern
  1. **Identify support** → CC them (Stun/Freeze/Sleep).  
  2. **Burst window** → SD/Asura/Meteor into Lex Aeterna.  
  3. **Reset** behind walls; never trickle in.
  
  **Positioning rule:** supports behind tanks, casters side-step to avoid line engages, always respect Cloak angles.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // MVP — Party
    {
      title: 'Legendary MVP Hunting Guide',
      image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
      category: 'MVP',
      description: 'Timers, roles, key cards, and clean pulls.',
      content: `
  # Legendary MVP Hunting Guide
  
  MVPs are checklists. Respect timers, assign roles, and pack the right cards.
  
  ## Respawn Discipline
  Track kills; most MVPs: **60–120 min**. Use shared sheets or a simple Discord bot.
  
  ## Roles
  - **Scout:** locate & call HP/element.  
  - **Tank:** Paladin/LK with **Thara Frog**, **Raydric**, element swaps.  
  - **Support:** High Priest with **Phen** & **Marc**.  
  - **DPS:** Sniper/Wizard/Assassin depending on boss weaknesses.
  
  ## Pre-Pull Loadout
  
  | Slot | Card |
  |---|---|
  | Garment | **Raydric** (neutral mit) |
  | Shield | **Thara Frog** (demi-human) or element-specific |
  | Armor | **Marc** (anti-freeze) / **Evil Druid** (status immunity, watch Holy) |
  
  **Consumables:** Ygg Berries/Seeds, element converters, foods.  
  **Hint:** control adds first; don’t chase parse—chase uptime.
      `,
      authorId: user2.id,
      status: 'published'
    },
  
    // MVP — Solo
    {
      title: 'Solo MVP Builds: When You Want the Glory',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      category: 'MVP',
      description: 'Practical solo archetypes and survival patterns.',
      content: `
  # Solo MVP Builds: When You Want the Glory
  
  Not all MVPs are soloable, but many are with the right build and discipline.
  
  ## Assassin Cross (Crit DPS)
  **Stats:** LUK/AGI focus, STR for damage  
  **Why it works:** ignores DEF with crits, high ASPD, Cloak scouting  
  **Pattern:** Cloak → isolate → **EDP + Crit**; reset with Hide or pot lines.
  
  ## Champion (Asura)
  **Why:** one-punch threat; needs perfect timing & SP economy  
  **Pattern:** Zen → Fury → Asura → Tele reset. If it lives, kite or bail.
  
  ## Paladin (Sacrifice/Shield)
  **Why:** durable, abuses Holy and reflect mechanics on specific MVPs  
  **Pattern:** swap elements, keep pots rolling, use terrain to limit contact.
  
  Rule #1: **Know the boss script.** If you can predict, you can live.
      `,
      authorId: user2.id,
      status: 'published'
    },
  
    // CRAFTING — Refining
    {
      title: 'Crafting & Refining: Maximizing Equipment Value',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      category: 'Crafting',
      description: 'Safe refines, card priorities, and when to stop.',
      content: `
  # Crafting & Refining: Maximizing Equipment Value
  
  Refining is exciting—and expensive. Here’s a **value-first** approach.
  
  ## Safe Wins First
  - **Free +4** on most pieces—do it.  
  - Aim **+7 weapon** before luxury; **+7 armor** is usually the stop line for value.
  
  ## Card Before Gamble
  - **Weapons:** Hydra/Skeleton Worker vs race/size.  
  - **Garment:** Raydric.  
  - **Armor:** Marc (anti-freeze) / Pecopeco (+HP).  
  - **Shield:** Thara Frog (demi-human).
  
  ## Element Beats Refine
  Elemental arrows/converters can add **30–75%** damage depending on target, often outvaluing several refine levels.
  
  **Checklist:** define goal → card slots → safe +4 → +7 weapon → +7 armor → cosmetics later.
      `,
      authorId: user1.id,
      status: 'published'
    },
  
    // CRAFTING — Cards
    {
      title: 'Card Slotting Guide: Best-in-Slot on a Budget',
      image: 'https://images.unsplash.com/photo-1614680376408-81e0d76ade7e?w=800',
      category: 'Crafting',
      description: 'Which cards go where, with simple tables.',
      content: `
  # Card Slotting Guide: Best-in-Slot on a Budget
  
  Cards define identity. Start with **universal value**.
  
  ## Armor (Survival)
  | Card | Effect | Use |
  |---|---|---|
  | **Marc** | Freeze immunity | WoE/PvE staple |
  | **Pecopeco** | +10% Max HP | Any frontliner |
  
  ## Garment (Mitigation)
  | Card | Effect | Use |
  |---|---|---|
  | **Raydric** | -20% Neutral | All content |
  | **Deviling** | -50% Neutral +50% others | Niche, be careful |
  
  ## Shield
  | Card | Effect | Use |
  |---|---|---|
  | **Thara Frog** | -30% from demi-human | PvP/WoE |
  | **Penomena** | -30% long range | certain maps |
  
  ## Weapon
  - **Hydra** (race) / **Skeleton Worker** (size) / **Santa Poring** (holy) — pick by target.  
  **Rule:** build for the maps you actually farm, not theoretical BIS.
      `,
      authorId: user1.id,
      status: 'published'
    },
  
    // LORE — Prontera
    {
      title: 'Prontera: Heart of the Rune-Midgarts Kingdom',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      category: 'Lore',
      description: 'The city that never sleeps: economy, landmarks, and routes.',
      content: `
  # Prontera: Heart of the Rune-Midgarts Kingdom
  
  Prontera is more than a starter hub—it’s the **economic & social center** of Midgard.
  
  ## Landmarks
  - **Central Plaza:** player shops and meetup point.  
  - **Castle:** WoE objective and RP hotspot.  
  - **Church:** class fantasy central for Acolytes/Priests.
  
  ## Why Players Gather Here
  Refiners, Kafra, common warp routes, and easy exits to **Geffen** (west) and **Payon** (east). If you’re trading or recruiting, you’re doing it in Prontera.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // LORE — Yggdrasil
    {
      title: 'The Legend of Yggdrasil — World Tree Lore',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      category: 'Lore',
      description: 'How the World Tree threads through Ragnarok’s worldbuilding.',
      content: `
  # The Legend of Yggdrasil — World Tree Lore
  
  **Yggdrasil** is the mythic World Tree connecting realms—**Midgard**, **Asgard**, **Jotunheim**, **Niflheim**—and the inspiration behind many dungeons and items.
  
  ## Game Touchpoints
  - **Yggdrasil Seed/Berry:** powerful heals said to be blessed by the Tree.  
  - **Thematic dungeons:** nature-infused bosses and guardians.  
  - **Narrative:** rot of the roots hints at calamity; heroes intervene.
  
  Knowing the lore adds flavor to your grind—and explains why some late-game content feels elemental and ancient at once.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // EVENTS
    {
      title: 'Seasonal Events Guide 2025',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      category: 'Events',
      description: 'What to prioritize and how to turn events into profit.',
      content: `
  # Seasonal Events Guide 2025
  
  Events = free power + cosmetics + zeny. Here’s how to win each season.
  
  ## Valentine / White Day (Feb–Mar)
  **Do:** chocolate/candy quests, daily turn-ins.  
  **Prioritize:** limited costumes, EXP boosters, then materials.
  
  ## Summer (Jun–Aug)
  **Do:** island quests/Comodo beach runs.  
  **Prioritize:** enriched ores, water-element resources, sunglasses-type headgears.
  
  ## Halloween (Oct)
  **Do:** spooky dungeons, Undead quests.  
  **Prioritize:** shadow/ghost enchants, themed costumes, EXP farms in UD maps.
  
  ### Event Currency Order
  1) Materials for ongoing quests → 2) Enriched refine mats → 3) Limited costumes → 4) Consumables.  
  Play the long game: limited cosmetics hold value far past the event.
      `,
      authorId: user2.id,
      status: 'published'
    },
  
    // GUIDES — Overview
    {
      title: 'Ragnarok Online: The Ultimate MMORPG Experience',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      category: 'Guides',
      description: 'What makes RO timeless: classes, economy, and community.',
      content: `
  # Ragnarok Online: The Ultimate MMORPG Experience
  
  RO blends **2D sprites on 3D maps**, a vibrant soundtrack, and a player-driven economy into a timeless loop: **adventure, party, profit**.
  
  ## What Hooks People
  - **Class depth:** Novice → transcendent paths with wildly different playstyles.  
  - **Cards & builds:** endless tinkering.  
  - **Community:** WoE nights, MVP rallies, and bustling Prontera markets.
  
  If you set small goals (job change, first +7, evergreen cards) you’ll find the game endlessly rewarding—no whale wallet needed.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // BEGINNER — Class pick
    {
      title: 'Best Classes for Beginners (Pick Your Path)',
      image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800',
      category: 'Beginner',
      description: 'Swordsman, Acolyte, or Archer? Start strong with the right fit.',
      content: `
  # Best Classes for Beginners (Pick Your Path)
  
  **Swordsman, Acolyte, Archer**—all beginner-friendly, all strong in different ways.
  
  | Class | Why Start Here | Typical Stats |
  |---|---|---|
  | **Swordsman** | tanky, simple melee, learns map control | STR/VIT/DEX |
  | **Acolyte** | party magnet, low budget, crucial utility | INT/DEX/VIT |
  | **Archer** | safe ranged farmer, fast leveling | DEX/AGI/LUK |
  
  **Rule of thumb:** if you love solo farming → Archer; if you love parties → Acolyte; if you want to face-tank and learn pulls → Swordsman.
      `,
      authorId: user1.id,
      status: 'published'
    },
  
    // GUIDES — Highlight/All
    {
      title: 'Ragnarok Online: The Ultimate MMORPG Experience — Highlight',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      category: 'Guides',
      description: 'A compact highlight pointing to the full guide.',
      content: `
  # Highlight
  
  A compact overview of RO's charm—classes, cards, economy, and community. Read the **full Guides article** for details and starter goals.
      `,
      authorId: admin.id,
      status: 'published'
    },
  
    // PvP — WoE Basics (short highlight for lists)
    {
      title: 'The War of Emperium — WoE Basics (Quick Read)',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
      category: 'PvP',
      description: 'Your first checklist before marching to the castle.',
      content: `
  # WoE Basics — Quick Read
  
  - Bring **Marc/Raydric/Thara** and element swaps.  
  - Roles defined *before* the gate: front, control, support, picks, breaker.  
  - Choke discipline wins. LP vs. SG/Meteor decides pushes.  
  - Break fast, then stabilize with SW/LP around the Emp.
      `,
      authorId: admin.id,
      status: 'published'
    },
  ];

  const posts = [];
  for (const postData of postsData) {
    const slug = await createUniqueSlug(postData.title);
    const post = await prisma.post.create({
      data: {
        ...postData,
        slug,
        publishedAt: postData.status === 'published' ? new Date() : null,
      },
    });
    posts.push(post);
  }

  console.log(`Created ${posts.length} posts\n`);
  posts.forEach((p, i) => console.log(`   ${i + 1}. ${p.title} [${p.category}]`));
  console.log('\n🎉 Seeding completed!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());