import { PrismaClient, Role, UserStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Default admin account. Login is passwordless (email OTP), so no password is stored.
// Override via env when seeding a different environment.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Admin'

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, role: Role.admin, status: UserStatus.active },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: Role.admin,
      status: UserStatus.active,
    },
  })

  console.log(`Seeded admin user: ${admin.email} (id: ${admin.id})`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
