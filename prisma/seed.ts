import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const PASSWORD = 'Password@123';

const categories = ['Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Grains'];
const certAgencies = ['USDA Organic', 'EU Organic', 'Soil Association', 'Demeter', 'NASAA'];
const locations = [
  'Brooklyn, NY', 'Queens, NY', 'Bronx, NY',
  'Chicago, IL', 'Los Angeles, CA', 'Austin, TX',
  'Portland, OR', 'Seattle, WA', 'Denver, CO', 'Miami, FL',
];
const farmNames = [
  'Green Roots Farm', 'Urban Harvest Co', 'City Seeds Farm',
  'Rooftop Garden', 'Metro Greens', 'Fresh Acres Urban Farm',
  'Concrete Jungle Farm', 'Sky Garden', 'Community Roots Farm', 'Vertical Veg Farm',
];
const produceNames = [
  'Organic Tomatoes', 'Fresh Basil', 'Heritage Carrots', 'Baby Spinach',
  'Rainbow Chard', 'Heirloom Cucumbers', 'Microgreens Mix', 'Bell Peppers',
  'Cherry Tomatoes', 'Kale Bunch',
];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.order.deleteMany();
  await prisma.produce.deleteMany();
  await prisma.rentalSpace.deleteMany();
  await prisma.sustainabilityCert.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@urbanfarm.com',
      password: hashedPassword,
      role: 'admin',
      verified: true,
      status: 'active',
      profileImage: 'https://avatar.iran.liara.run/public/1.png',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Customer
  const customer = await prisma.user.create({
    data: {
      name: 'Jane Customer',
      email: 'customer@urbanfarm.com',
      password: hashedPassword,
      role: 'customer',
      verified: true,
      status: 'active',
      profileImage: 'https://avatar.iran.liara.run/public/2.png',
    },
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // 10 Vendors
  const vendorIds: string[] = [];

  for (let i = 0; i < 10; i++) {
    const vendor = await prisma.user.create({
      data: {
        name: `Vendor ${i + 1}`,
        email: `vendor${i + 1}@urbanfarm.com`,
        password: hashedPassword,
        role: 'vendor',
        verified: true,
        status: 'active',
        profileImage: `https://avatar.iran.liara.run/public/${i + 10}.png`,
      },
    });

    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: vendor.id,
        farmName: farmNames[i] ?? `Urban Farm ${i + 1}`,
        farmLocation: locations[i] ?? 'New York, NY',
        certificationStatus: 'approved',
      },
    });

    // Sustainability cert for each vendor
    await prisma.sustainabilityCert.create({
      data: {
        vendorId: vendorProfile.id,
        certifyingAgency: certAgencies[i % certAgencies.length] ?? 'USDA Organic',
        certificationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
    });

    // Rental space for each vendor
    await prisma.rentalSpace.create({
      data: {
        vendorId: vendorProfile.id,
        location: locations[i] ?? 'New York, NY',
        size: parseFloat((Math.random() * 50 + 10).toFixed(2)),
        price: parseFloat((Math.random() * 200 + 50).toFixed(2)),
        availability: true,
      },
    });

    vendorIds.push(vendorProfile.id);
    console.log(`✅ Vendor ${i + 1} created: ${vendor.email}`);
  }

  // 100 Produce items (10 per vendor)
  let produceCount = 0;
  for (const vendorId of vendorIds) {
    for (let p = 0; p < 10; p++) {
      await prisma.produce.create({
        data: {
          vendorId,
          name: `${produceNames[p % produceNames.length]} #${produceCount + 1}`,
          description: `Freshly grown organic ${produceNames[p % produceNames.length]?.toLowerCase()} from our urban farm.`,
          price: parseFloat((Math.random() * 20 + 2).toFixed(2)),
          category: categories[p % categories.length] ?? 'Vegetables',
          availableQuantity: Math.floor(Math.random() * 100 + 10),
          certificationStatus: 'approved',
        },
      });
      produceCount++;
    }
  }
  console.log(`✅ ${produceCount} produce items created`);

  // Community posts
  const allUsers = [admin.id, customer.id];
  const postContent = [
    'Just harvested my first batch of organic tomatoes! Tip: use companion planting with basil.',
    'Best soil mix for rooftop gardens? I use a 60/30/10 blend of compost, perlite, and topsoil.',
    'Anyone tried vertical farming with PVC pipes? Works great for herbs!',
    'Reminder: water your plants early morning to reduce evaporation.',
    'Sharing my composting guide for urban farmers — link in bio!',
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.communityPost.create({
      data: {
        userId: allUsers[i % allUsers.length] ?? admin.id,
        postContent: postContent[i] ?? 'Great farming tips for urban gardeners!',
      },
    });
  }
  console.log('✅ Community posts created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:    admin@urbanfarm.com');
  console.log('Vendor:   vendor1@urbanfarm.com ... vendor10@urbanfarm.com');
  console.log('Customer: customer@urbanfarm.com');
  console.log('Password: Password@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
