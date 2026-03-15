import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setUserEnvironment() {
  const email = process.argv[2]
  const environment = process.argv[3]

  if (!email || !environment) {
    console.log('Usage: npx tsx scripts/set-user-environment.ts <email> <environment>')
    console.log('Environment can be: local, staging, or production')
    process.exit(1)
  }

  if (!['local', 'staging', 'production'].includes(environment)) {
    console.error('Invalid environment. Must be: local, staging, or production')
    process.exit(1)
  }

  const user = await prisma.shop.findUnique({
    where: { email },
    select: { id: true, email: true, environment: true }
  })

  if (!user) {
    console.error(`User with email ${email} not found`)
    await prisma.$disconnect()
    process.exit(1)
  }

  console.log('Current user:', user)

  await prisma.shop.update({
    where: { email },
    data: { environment }
  })

  console.log(`✅ Updated ${email} to environment: ${environment}`)

  await prisma.$disconnect()
}

setUserEnvironment()
