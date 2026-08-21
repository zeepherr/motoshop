import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/primsa.js";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Development seed users only.
// You may optionally add SEED_USER_PASSWORD to .env later.
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? "SeedPassword123!";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env");
}

// ======================================================
// HELPERS
// ======================================================

const money = (cents) => (cents / 100).toFixed(2);

const daysAgo = (days, hour = 10) => {
  const date = new Date();

  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);

  return date;
};

// ======================================================
// RESET
// ======================================================

async function resetDatabase() {
  console.log("🧹 Clearing existing development data...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.userMotor.deleteMany();

  await prisma.authSession.deleteMany();
  await prisma.userInfo.deleteMany();
  await prisma.pendingRegistration.deleteMany();

  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  await prisma.service.deleteMany();

  await prisma.motor.deleteMany();
  await prisma.motorBrand.deleteMany();

  await prisma.user.deleteMany();
}

// ======================================================
// USERS
// ======================================================

async function seedUsers() {
  console.log("👤 Seeding users...");

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const seedPasswordHash = await bcrypt.hash(SEED_USER_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      role: "ADMIN",

      email: ADMIN_EMAIL,

      firstName: "System",
      lastName: "Admin",

      password: adminPasswordHash,

      isActive: true,
      emailVerifiedAt: new Date(),

      userInfo: {
        create: {
          photoUrl: null,
        },
      },
    },
  });

  const staffData = [
    {
      firstName: "Aung",
      lastName: "Min",
      email: "staff1@example.com",
      phone: "0800001001",
    },
    {
      firstName: "Nanda",
      lastName: "Htun",
      email: "staff2@example.com",
      phone: "0800001002",
    },
    {
      firstName: "Kyaw",
      lastName: "Zin",
      email: "staff3@example.com",
      phone: "0800001003",
    },
  ];

  const staffs = [];

  for (const staff of staffData) {
    const createdStaff = await prisma.user.create({
      data: {
        ...staff,

        role: "STAFF",
        password: seedPasswordHash,

        isActive: true,
        emailVerifiedAt: new Date(),

        userInfo: {
          create: {
            photoUrl: null,
          },
        },
      },
    });

    staffs.push(createdStaff);
  }

  const memberData = [
    ["Min", "Khant"],
    ["Thura", "Aung"],
    ["Htet", "Naing"],
    ["Aye", "Chan"],
    ["Nyein", "Thu"],
    ["Su", "Mon"],
    ["Moe", "Myint"],
    ["May", "Thazin"],
    ["Ko", "Ko"],
    ["Ei", "Phyu"],
  ];

  const members = [];

  for (let i = 0; i < memberData.length; i++) {
    const [firstName, lastName] = memberData[i];

    const member = await prisma.user.create({
      data: {
        role: "MEMBER",

        firstName,
        lastName,

        email: `member${i + 1}@example.com`,
        phone: `0800002${String(i + 1).padStart(3, "0")}`,

        password: seedPasswordHash,

        isActive: true,
        emailVerifiedAt: new Date(),

        userInfo: {
          create: {
            photoUrl: null,
          },
        },
      },
    });

    members.push(member);
  }

  return {
    admin,
    staffs,
    members,
  };
}

// ======================================================
// MOTOR BRANDS + MOTORS
// ======================================================

async function seedMotors() {
  console.log("🏍️ Seeding motorcycles...");

  const brandNames = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "GPX", "Vespa"];

  const brands = {};

  for (const name of brandNames) {
    const brand = await prisma.motorBrand.create({
      data: {
        name,
      },
    });

    brands[name] = brand;
  }

  const motorData = [
    ["Honda", "Click 160", "AUTOMATIC"],
    ["Honda", "PCX 160", "AUTOMATIC"],
    ["Honda", "Wave 125i", "MANUAL"],

    ["Yamaha", "NMAX 155", "AUTOMATIC"],
    ["Yamaha", "Aerox 155", "AUTOMATIC"],
    ["Yamaha", "Finn 115", "MANUAL"],

    ["Suzuki", "Burgman Street 125EX", "AUTOMATIC"],
    ["Suzuki", "Smash 115", "MANUAL"],
    ["Suzuki", "Raider R150", "MANUAL"],

    ["Kawasaki", "Ninja 400", "MANUAL"],
    ["Kawasaki", "Z400", "MANUAL"],
    ["Kawasaki", "KLX230", "MANUAL"],

    ["GPX", "Drone 150", "AUTOMATIC"],
    ["GPX", "Legend 250 Twin", "MANUAL"],
    ["GPX", "Demon GR200R", "MANUAL"],

    ["Vespa", "Primavera 150", "AUTOMATIC"],
    ["Vespa", "Sprint 150", "AUTOMATIC"],
    ["Vespa", "GTS 300", "AUTOMATIC"],
  ];

  const motors = [];

  for (const [brandName, model, type] of motorData) {
    const motor = await prisma.motor.create({
      data: {
        motorBrandId: brands[brandName].id,
        model,
        type,
      },
    });

    motors.push(motor);
  }

  return {
    brands,
    motors,
  };
}

// ======================================================
// USER MOTORS
// ======================================================

async function seedUserMotors(members, motors) {
  console.log("🔗 Seeding member motorcycles...");

  for (let i = 0; i < members.length; i++) {
    await prisma.userMotor.create({
      data: {
        userId: members[i].id,
        motorId: motors[i % motors.length].id,
      },
    });
  }
}

// ======================================================
// PRODUCT CATEGORIES
// ======================================================

async function seedProductCategories() {
  console.log("📦 Seeding product categories...");

  const categoryNames = [
    "Tires",
    "Engine Oil & Fluids",
    "Brake Parts",
    "Drive & Chain",
    "Electrical",
    "Accessories",
  ];

  const categories = {};

  for (const name of categoryNames) {
    const category = await prisma.productCategory.create({
      data: {
        name,
      },
    });

    categories[name] = category;
  }

  return categories;
}

// ======================================================
// PRODUCTS
// ======================================================

async function seedProducts(categories) {
  console.log("🛞 Seeding products...");

  const productsData = [
    // TIRES
    {
      category: "Tires",
      sku: "TIR-001",
      name: "IRC NR77 70/90-17",
      description: "Daily-use motorcycle tire.",
      cost: 65000,
      sell: 82000,
      stock: 18,
      unit: "piece",
    },
    {
      category: "Tires",
      sku: "TIR-002",
      name: "IRC NR77 80/90-17",
      description: "Durable commuter motorcycle tire.",
      cost: 72000,
      sell: 90000,
      stock: 14,
      unit: "piece",
    },
    {
      category: "Tires",
      sku: "TIR-003",
      name: "Michelin City Extra 80/90-17",
      description: "Street tire for everyday riding.",
      cost: 110000,
      sell: 135000,
      stock: 10,
      unit: "piece",
    },
    {
      category: "Tires",
      sku: "TIR-004",
      name: "Michelin City Extra 90/90-17",
      description: "Premium street motorcycle tire.",
      cost: 125000,
      sell: 152000,
      stock: 0,
      unit: "piece",
    },
    {
      category: "Tires",
      sku: "TIR-005",
      name: "Maxxis M6233 90/80-14",
      description: "Scooter tire for urban use.",
      cost: 85000,
      sell: 105000,
      stock: 9,
      unit: "piece",
    },

    // ENGINE OIL
    {
      category: "Engine Oil & Fluids",
      sku: "OIL-001",
      name: "Motul 5100 10W-40 1L",
      description: "4-stroke motorcycle engine oil.",
      cost: 39000,
      sell: 48000,
      stock: 20,
      unit: "bottle",
    },
    {
      category: "Engine Oil & Fluids",
      sku: "OIL-002",
      name: "Shell Advance AX7 10W-40 1L",
      description: "Synthetic technology motorcycle oil.",
      cost: 25000,
      sell: 32000,
      stock: 24,
      unit: "bottle",
    },
    {
      category: "Engine Oil & Fluids",
      sku: "OIL-003",
      name: "Honda GN4 10W-30 0.8L",
      description: "Motorcycle engine oil.",
      cost: 18000,
      sell: 24000,
      stock: 16,
      unit: "bottle",
    },
    {
      category: "Engine Oil & Fluids",
      sku: "OIL-004",
      name: "Yamalube 4T 10W-40 1L",
      description: "4-stroke motorcycle lubricant.",
      cost: 22000,
      sell: 29000,
      stock: 17,
      unit: "bottle",
    },
    {
      category: "Engine Oil & Fluids",
      sku: "OIL-005",
      name: "DOT 4 Brake Fluid 500ml",
      description: "DOT 4 hydraulic brake fluid.",
      cost: 12000,
      sell: 18000,
      stock: 12,
      unit: "bottle",
    },

    // BRAKES
    {
      category: "Brake Parts",
      sku: "BRK-001",
      name: "Front Brake Pad - Honda Wave",
      description: "Front brake pad replacement set.",
      cost: 12000,
      sell: 18000,
      stock: 15,
      unit: "set",
    },
    {
      category: "Brake Parts",
      sku: "BRK-002",
      name: "Rear Brake Shoe - Honda Wave",
      description: "Rear drum brake shoe set.",
      cost: 14000,
      sell: 21000,
      stock: 11,
      unit: "set",
    },
    {
      category: "Brake Parts",
      sku: "BRK-003",
      name: "Front Brake Pad - Yamaha NMAX",
      description: "Front brake pad set for NMAX.",
      cost: 24000,
      sell: 33000,
      stock: 8,
      unit: "set",
    },
    {
      category: "Brake Parts",
      sku: "BRK-004",
      name: "Rear Brake Pad - Yamaha NMAX",
      description: "Rear brake pad replacement set.",
      cost: 21000,
      sell: 30000,
      stock: 7,
      unit: "set",
    },
    {
      category: "Brake Parts",
      sku: "BRK-005",
      name: "Universal Brake Disc 220mm",
      description: "220mm motorcycle brake disc.",
      cost: 45000,
      sell: 59000,
      stock: 4,
      unit: "piece",
    },

    // DRIVE & CHAIN
    {
      category: "Drive & Chain",
      sku: "DRV-001",
      name: "DID 428 Chain 120L",
      description: "Motorcycle drive chain.",
      cost: 42000,
      sell: 56000,
      stock: 8,
      unit: "piece",
    },
    {
      category: "Drive & Chain",
      sku: "DRV-002",
      name: "Honda Wave Chain & Sprocket Kit",
      description: "Complete chain and sprocket kit.",
      cost: 62000,
      sell: 79000,
      stock: 6,
      unit: "set",
    },
    {
      category: "Drive & Chain",
      sku: "DRV-003",
      name: "Yamaha Finn Chain & Sprocket Kit",
      description: "Complete drivetrain replacement kit.",
      cost: 65000,
      sell: 82000,
      stock: 4,
      unit: "set",
    },
    {
      category: "Drive & Chain",
      sku: "DRV-004",
      name: "CVT Drive Belt - NMAX 155",
      description: "Replacement CVT drive belt.",
      cost: 78000,
      sell: 98000,
      stock: 5,
      unit: "piece",
    },
    {
      category: "Drive & Chain",
      sku: "DRV-005",
      name: "Roller Weight Set 12g",
      description: "CVT roller weight replacement set.",
      cost: 18000,
      sell: 26000,
      stock: 10,
      unit: "set",
    },

    // ELECTRICAL
    {
      category: "Electrical",
      sku: "ELE-001",
      name: "Yuasa YTX5L-BS Battery",
      description: "Maintenance-free motorcycle battery.",
      cost: 72000,
      sell: 89000,
      stock: 7,
      unit: "piece",
    },
    {
      category: "Electrical",
      sku: "ELE-002",
      name: "NGK CPR6EA-9 Spark Plug",
      description: "Standard motorcycle spark plug.",
      cost: 9000,
      sell: 13000,
      stock: 30,
      unit: "piece",
    },
    {
      category: "Electrical",
      sku: "ELE-003",
      name: "LED Headlight Bulb H4",
      description: "Universal H4 LED motorcycle bulb.",
      cost: 18000,
      sell: 26000,
      stock: 12,
      unit: "piece",
    },
    {
      category: "Electrical",
      sku: "ELE-004",
      name: "12V Motorcycle Horn",
      description: "Universal motorcycle horn.",
      cost: 12000,
      sell: 18000,
      stock: 9,
      unit: "piece",
    },
    {
      category: "Electrical",
      sku: "ELE-005",
      name: "Dual USB Motorcycle Charger",
      description: "Handlebar-mounted dual USB charger.",
      cost: 22000,
      sell: 32000,
      stock: 6,
      unit: "piece",
    },

    // ACCESSORIES
    {
      category: "Accessories",
      sku: "ACC-001",
      name: "Full Face Helmet - Basic",
      description: "Daily full-face motorcycle helmet.",
      cost: 85000,
      sell: 109000,
      stock: 7,
      unit: "piece",
    },
    {
      category: "Accessories",
      sku: "ACC-002",
      name: "Open Face Helmet - Classic",
      description: "Classic open-face motorcycle helmet.",
      cost: 62000,
      sell: 82000,
      stock: 9,
      unit: "piece",
    },
    {
      category: "Accessories",
      sku: "ACC-003",
      name: "Motorcycle Phone Holder",
      description: "Adjustable handlebar phone mount.",
      cost: 18000,
      sell: 29000,
      stock: 15,
      unit: "piece",
    },
    {
      category: "Accessories",
      sku: "ACC-004",
      name: "Motorcycle Rain Cover XL",
      description: "Water-resistant motorcycle cover.",
      cost: 22000,
      sell: 34000,
      stock: 8,
      unit: "piece",
    },
    {
      category: "Accessories",
      sku: "ACC-005",
      name: "Universal Grip Set",
      description: "Replacement motorcycle handle grips.",
      cost: 9000,
      sell: 15000,
      stock: 20,
      unit: "pair",
    },
  ];

  const products = [];

  for (const product of productsData) {
    const created = await prisma.product.create({
      data: {
        productCategoryId: categories[product.category].id,

        sku: product.sku,
        name: product.name,
        description: product.description,

        costPrice: money(product.cost),
        sellingPrice: money(product.sell),

        stockQuantity: product.stock,

        unit: product.unit,

        // Seed images intentionally omitted for now.
        imageKey: null,
      },
    });

    products.push({
      record: created,
      sellCents: product.sell,
    });
  }

  return products;
}

// ======================================================
// SERVICES
// ======================================================

async function seedServices() {
  console.log("🔧 Seeding services...");

  const serviceData = [
    {
      name: "Engine Oil Change",
      description: "Engine oil replacement labor.",
      price: 8000,
    },
    {
      name: "Tire Replacement",
      description: "Remove and install one motorcycle tire.",
      price: 12000,
    },
    {
      name: "Brake Pad Replacement",
      description: "Brake pad replacement labor.",
      price: 15000,
    },
    {
      name: "Chain Adjustment",
      description: "Drive chain tension adjustment.",
      price: 10000,
    },
    {
      name: "Chain & Sprocket Replacement",
      description: "Replace chain and sprocket set.",
      price: 25000,
    },
    {
      name: "Battery Replacement",
      description: "Battery removal and installation.",
      price: 10000,
    },
    {
      name: "Spark Plug Replacement",
      description: "Spark plug replacement labor.",
      price: 8000,
    },
    {
      name: "CVT Inspection & Cleaning",
      description: "Inspect and clean CVT system.",
      price: 30000,
    },
    {
      name: "General Motorcycle Checkup",
      description: "Basic safety and condition inspection.",
      price: 20000,
    },
    {
      name: "Electrical Diagnosis",
      description: "Electrical system diagnosis.",
      price: 25000,
    },
  ];

  const services = [];

  for (const service of serviceData) {
    const created = await prisma.service.create({
      data: {
        name: service.name,
        description: service.description,
        price: money(service.price),
      },
    });

    services.push({
      record: created,
      priceCents: service.price,
    });
  }

  return services;
}

// ======================================================
// ORDERS
// ======================================================

async function seedOrders({
  admin,
  staffs,
  members,
  motors,
  products,
  services,
}) {
  console.log("🧾 Seeding orders...");

  const ORDER_COUNT = 36;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const isMember = i % 3 !== 0;

    const member = isMember ? members[i % members.length] : null;

    const handledBy = i % 5 === 0 ? admin : staffs[i % staffs.length];

    const motor = i % 4 === 0 ? null : motors[i % motors.length];

    let status = "COMPLETED";

    if (i % 10 === 0) {
      status = "CANCELLED";
    } else if (i % 8 === 0) {
      status = "PENDING";
    }

    const orderItems = [];

    // Primary product
    const product = products[i % products.length];

    const productQuantity = (i % 3) + 1;

    const productLineTotal = product.sellCents * productQuantity;

    orderItems.push({
      productId: product.record.id,
      serviceId: null,

      itemType: "PRODUCT",

      itemNameSnapshot: product.record.name,

      quantity: productQuantity,

      unitPrice: money(product.sellCents),

      lineTotal: money(productLineTotal),

      lineTotalCents: productLineTotal,
    });

    // Some orders also include service.
    if (i % 2 === 0) {
      const service = services[i % services.length];

      orderItems.push({
        productId: null,
        serviceId: service.record.id,

        itemType: "SERVICE",

        itemNameSnapshot: service.record.name,

        quantity: 1,

        unitPrice: money(service.priceCents),

        lineTotal: money(service.priceCents),

        lineTotalCents: service.priceCents,
      });
    }

    // Some orders contain an additional product.
    if (i % 5 === 0) {
      const secondProduct = products[(i + 7) % products.length];

      orderItems.push({
        productId: secondProduct.record.id,

        serviceId: null,

        itemType: "PRODUCT",

        itemNameSnapshot: secondProduct.record.name,

        quantity: 1,

        unitPrice: money(secondProduct.sellCents),

        lineTotal: money(secondProduct.sellCents),

        lineTotalCents: secondProduct.sellCents,
      });
    }

    const subtotalCents = orderItems.reduce(
      (total, item) => total + item.lineTotalCents,
      0,
    );

    const discountRate = isMember ? (i % 4 === 0 ? 10 : 5) : 0;

    const discountAmountCents = Math.round(
      subtotalCents * (discountRate / 100),
    );

    const finalTotalCents = subtotalCents - discountAmountCents;

    const createdAt = daysAgo(ORDER_COUNT - i);

    await prisma.order.create({
      data: {
        orderNumber: `SEED-ORD-${String(i + 1).padStart(4, "0")}`,

        memberId: member?.id ?? null,

        handledById: handledBy.id,

        motorId: motor?.id ?? null,

        customerType: isMember ? "MEMBER" : "GUEST",

        subtotal: money(subtotalCents),

        discountRate: discountRate.toFixed(2),

        discountAmount: money(discountAmountCents),

        finalTotal: money(finalTotalCents),

        status,

        createdAt,

        completedAt:
          status === "COMPLETED"
            ? new Date(createdAt.getTime() + 30 * 60 * 1000)
            : null,

        orderItems: {
          create: orderItems.map(({ lineTotalCents, ...item }) => item),
        },
      },
    });
  }
}

// ======================================================
// MAIN
// ======================================================

async function main() {
  console.log("🌱 Starting HrungMoto seed...\n");

  await resetDatabase();

  const { admin, staffs, members } = await seedUsers();

  const { motors } = await seedMotors();

  await seedUserMotors(members, motors);

  const categories = await seedProductCategories();

  const products = await seedProducts(categories);

  const services = await seedServices();

  await seedOrders({
    admin,
    staffs,
    members,
    motors,
    products,
    services,
  });

  console.log("\n✅ Seed completed successfully.");
  console.log(`👤 Admin: ${ADMIN_EMAIL}`);
  console.log(`👥 Staff: ${staffs.length}`);
  console.log(`👥 Members: ${members.length}`);
  console.log(`🏍️ Motors: ${motors.length}`);
  console.log(`📦 Products: ${products.length}`);
  console.log(`🔧 Services: ${services.length}`);
  console.log("🧾 Orders: 36");
}

main()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
