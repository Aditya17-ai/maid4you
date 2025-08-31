import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create services with Indian pricing (in INR)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Regular Housekeeping',
        description: 'Daily cleaning, dusting, and basic household maintenance',
        category: 'HOUSEKEEPING',
        basePrice: 300, // ₹300/hr
        duration: 120, // 2 hours
        icon: '🏠'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Deep Cleaning',
        description: 'Thorough cleaning including bathrooms, kitchen, and all rooms',
        category: 'DEEP_CLEANING',
        basePrice: 500, // ₹500/hr
        duration: 240, // 4 hours
        icon: '🧹'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Cooking & Meal Prep',
        description: 'Meal preparation, cooking, and kitchen management',
        category: 'COOKING',
        basePrice: 400, // ₹400/hr
        duration: 180, // 3 hours
        icon: '👩‍🍳'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Laundry Service',
        description: 'Washing, drying, ironing, and folding clothes',
        category: 'LAUNDRY',
        basePrice: 250, // ₹250/hr
        duration: 120, // 2 hours
        icon: '👕'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Babysitting',
        description: 'Professional childcare and supervision',
        category: 'BABYSITTING',
        basePrice: 450, // ₹450/hr
        duration: 240, // 4 hours
        icon: '👶'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Elderly Care',
        description: 'Compassionate care and assistance for elderly family members',
        category: 'ELDERLY_CARE',
        basePrice: 600, // ₹600/hr
        duration: 480, // 8 hours
        icon: '👴'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Pet Care',
        description: 'Pet sitting, walking, and basic pet care services',
        category: 'PET_CARE',
        basePrice: 350, // ₹350/hr
        duration: 120, // 2 hours
        icon: '🐕'
      }
    }),
    prisma.service.create({
      data: {
        name: 'Gardening',
        description: 'Garden maintenance, plant care, and landscaping',
        category: 'GARDENING',
        basePrice: 400, // ₹400/hr
        duration: 180, // 3 hours
        icon: '🌱'
      }
    })
  ])

  console.log('Created services:', services.length)

  // Create sample admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@maidservice.in',
      name: 'Admin User',
      role: 'ADMIN',
      address: 'Mumbai, Maharashtra, India',
      latitude: 19.0760,
      longitude: 72.8777,
      phone: '+91-9876543210'
    }
  })

  console.log('Created admin user:', adminUser.email)

  // Create sample customer
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.in',
      name: 'Rajesh Kumar',
      role: 'CUSTOMER',
      address: 'Bandra West, Mumbai, Maharashtra',
      latitude: 19.0544,
      longitude: 72.8181,
      phone: '+91-9123456789'
    }
  })

  console.log('Created customer:', customer.email)

  // Create sample maid users
  const maidUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'priya.sharma@maid.in',
        name: 'Priya Sharma',
        role: 'MAID',
        address: 'Andheri East, Mumbai, Maharashtra',
        latitude: 19.1136,
        longitude: 72.8697,
        phone: '+91-9234567890',
        image: '/avatars/priya.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'sunita.devi@maid.in',
        name: 'Sunita Devi',
        role: 'MAID',
        address: 'Powai, Mumbai, Maharashtra',
        latitude: 19.1197,
        longitude: 72.9106,
        phone: '+91-9345678901',
        image: '/avatars/sunita.jpg'
      }
    }),
    prisma.user.create({
      data: {
        email: 'maya.patel@maid.in',
        name: 'Maya Patel',
        role: 'MAID',
        address: 'Juhu, Mumbai, Maharashtra',
        latitude: 19.1075,
        longitude: 72.8263,
        phone: '+91-9456789012',
        image: '/avatars/maya.jpg'
      }
    })
  ])

  // Create maid profiles with Indian pricing
  const maidProfiles = await Promise.all([
    prisma.maidProfile.create({
      data: {
        userId: maidUsers[0].id,
        bio: 'Experienced housekeeping professional with 8 years of experience in Mumbai. Specializes in deep cleaning and cooking traditional Indian meals.',
        experience: 8,
        hourlyRate: 350, // ₹350/hr
        languages: ['Hindi', 'English', 'Marathi'],
        backgroundCheck: true,
        rating: 4.8,
        totalReviews: 127,
        isVerified: true,
        isActive: true,
        radius: 15,
        availability: {
          "1": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "2": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "3": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "4": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "5": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "6": { "available": true, "slots": [{"start": "09:00", "end": "15:00"}] },
          "0": { "available": false, "slots": [] }
        }
      }
    }),
    prisma.maidProfile.create({
      data: {
        userId: maidUsers[1].id,
        bio: 'Dedicated and reliable maid with expertise in childcare and elderly care. Fluent in Hindi and English.',
        experience: 5,
        hourlyRate: 400, // ₹400/hr
        languages: ['Hindi', 'English', 'Bengali'],
        backgroundCheck: true,
        rating: 4.6,
        totalReviews: 89,
        isVerified: true,
        isActive: true,
        radius: 20,
        availability: {
          "1": { "available": true, "slots": [{"start": "07:00", "end": "19:00"}] },
          "2": { "available": true, "slots": [{"start": "07:00", "end": "19:00"}] },
          "3": { "available": true, "slots": [{"start": "07:00", "end": "19:00"}] },
          "4": { "available": true, "slots": [{"start": "07:00", "end": "19:00"}] },
          "5": { "available": true, "slots": [{"start": "07:00", "end": "19:00"}] },
          "6": { "available": true, "slots": [{"start": "08:00", "end": "16:00"}] },
          "0": { "available": true, "slots": [{"start": "10:00", "end": "14:00"}] }
        }
      }
    }),
    prisma.maidProfile.create({
      data: {
        userId: maidUsers[2].id,
        bio: 'Professional cook and housekeeper specializing in Gujarati and North Indian cuisine. Very organized and punctual.',
        experience: 12,
        hourlyRate: 500, // ₹500/hr
        languages: ['Hindi', 'English', 'Gujarati'],
        backgroundCheck: true,
        rating: 4.9,
        totalReviews: 203,
        isVerified: true,
        isActive: true,
        radius: 25,
        availability: {
          "1": { "available": true, "slots": [{"start": "06:00", "end": "20:00"}] },
          "2": { "available": true, "slots": [{"start": "06:00", "end": "20:00"}] },
          "3": { "available": true, "slots": [{"start": "06:00", "end": "20:00"}] },
          "4": { "available": true, "slots": [{"start": "06:00", "end": "20:00"}] },
          "5": { "available": true, "slots": [{"start": "06:00", "end": "20:00"}] },
          "6": { "available": true, "slots": [{"start": "08:00", "end": "18:00"}] },
          "0": { "available": false, "slots": [] }
        }
      }
    })
  ])

  // Connect maids to services they offer
  await Promise.all([
    // Priya's services
    prisma.maidService.create({
      data: { maidId: maidProfiles[0].id, serviceId: services[0].id, customPrice: 350 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[0].id, serviceId: services[1].id, customPrice: 550 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[0].id, serviceId: services[2].id, customPrice: 450 }
    }),

    // Sunita's services
    prisma.maidService.create({
      data: { maidId: maidProfiles[1].id, serviceId: services[0].id, customPrice: 400 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[1].id, serviceId: services[4].id, customPrice: 500 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[1].id, serviceId: services[5].id, customPrice: 650 }
    }),

    // Maya's services
    prisma.maidService.create({
      data: { maidId: maidProfiles[2].id, serviceId: services[0].id, customPrice: 500 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[2].id, serviceId: services[1].id, customPrice: 600 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[2].id, serviceId: services[2].id, customPrice: 550 }
    }),
    prisma.maidService.create({
      data: { maidId: maidProfiles[2].id, serviceId: services[7].id, customPrice: 450 }
    })
  ])

  console.log('Connected maids to services')
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
