const { faker } = require('@faker-js/faker');
const Service = require('../models/service');

const categories = [
  "Financial Analysis",
  "Marketing Analytics",
  "Business Intelligence",
  "Consulting Services"
];
const industries = ["Retail", "E-commerce", "Healthcare", "Manufacturing"];
const keywords = [
  "forecasting", "data-driven", "strategy", "optimization", "growth",
  "efficiency", "ROI", "analytics", "financial modeling", "insight"
];

function getPriceForCategory(category) {
  switch (category) {
    case 'Financial Analysis':
    case 'Consulting Services':
      return faker.number.int({ min: 25000, max: 100000 });
    case 'Marketing Analytics':
    case 'Business Intelligence':
      return faker.number.int({ min: 10000, max: 50000 });
    default:
      return faker.number.int({ min: 5000, max: 25000 });
  }
}

function generateUniqueName(existingNames) {
  let name;
  let attempts = 0;

  do {
    const category = faker.helpers.arrayElement(categories);
    const industry = faker.helpers.arrayElement(industries);
    name = `${category} for ${industry} - ${faker.company.catchPhrase()}`;
    attempts++;
  } while (existingNames.has(name) && attempts < 10);

  return name;
}

function generateUniqueService(existingNames) {
  const category = faker.helpers.arrayElement(categories);
  const industry = faker.helpers.arrayElement(industries);
  const name = generateUniqueName(existingNames);
  existingNames.add(name);

  return {
    name,
    description: faker.lorem.paragraphs(2),
    category,
    industry,
    price: getPriceForCategory(category),
    duration_hours: faker.helpers.arrayElement([1, 2, 4, 8, 12]),
    tags: faker.helpers.arrayElements(keywords, faker.number.int({ min: 2, max: 5 }))
  };
}

async function seedServices() {
  try {
    const count = await Service.countDocuments();
    if (count > 0) {
      console.log(`✅ Found ${count} existing services. Skipping seed.`);
      return;
    }

    const existingNames = new Set();
    const services = [];

    while (services.length < 275) {
      const service = generateUniqueService(existingNames);
      services.push(service);
    }

    await Service.insertMany(services, { ordered: false });
    console.log("🌱 Successfully seeded 275 unique service records");
  } catch (error) {
    console.error("❌ Failed to seed services:", error);
  }
}

module.exports = seedServices;
