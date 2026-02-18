import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Owner User
  const ownerPassword = await hash('aimforce2026', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@aimforce.cloud' },
    update: {},
    create: {
      email: 'owner@aimforce.cloud',
      name: 'AIMForce Admin',
      role: 'OWNER',
      passwordHash: ownerPassword,
    },
  })
  console.log('✓ Owner created:', owner.email)

  // Create AI Agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Marketing Maven',
        type: 'MARKETING',
        description: 'Expert in content strategy, social media, and campaign execution',
        status: 'AVAILABLE',
        capabilities: JSON.stringify([
          'Content Strategy',
          'Social Media Management',
          'Campaign Planning',
          'Analytics',
        ]),
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Content Creator',
        type: 'CONTENT',
        description: 'Specialized in writing, video scripts, and multimedia content',
        status: 'AVAILABLE',
        capabilities: JSON.stringify([
          'Blog Writing',
          'Video Scripts',
          'Social Posts',
          'Email Campaigns',
        ]),
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Analytics Ace',
        type: 'ANALYTICS',
        description: 'Data analysis, insights generation, and reporting',
        status: 'AVAILABLE',
        capabilities: JSON.stringify([
          'Data Analysis',
          'Report Generation',
          'KPI Tracking',
          'Forecasting',
        ]),
      },
    }),
  ])
  console.log('✓ Created', agents.length, 'agents')

  // Create Demo Clients
  const clientPassword = await hash('demo2026', 10)
  
  const client1User = await prisma.user.create({
    data: {
      email: 'demo1@company.com',
      name: 'Tech Startup Inc',
      role: 'CLIENT',
      passwordHash: clientPassword,
    },
  })

  const client1 = await prisma.client.create({
    data: {
      userId: client1User.id,
      companyName: 'Tech Startup Inc',
      industry: 'Technology',
      status: 'ACTIVE',
    },
  })

  const client2User = await prisma.user.create({
    data: {
      email: 'demo2@company.com',
      name: 'E-Commerce Plus',
      role: 'CLIENT',
      passwordHash: clientPassword,
    },
  })

  const client2 = await prisma.client.create({
    data: {
      userId: client2User.id,
      companyName: 'E-Commerce Plus',
      industry: 'Retail',
      status: 'ACTIVE',
    },
  })

  console.log('✓ Created 2 demo clients')

  // Assign Agents to Clients
  await prisma.agentAssignment.createMany({
    data: [
      { clientId: client1.id, agentId: agents[0].id }, // Marketing Maven → Tech Startup
      { clientId: client1.id, agentId: agents[1].id }, // Content Creator → Tech Startup
      { clientId: client2.id, agentId: agents[0].id }, // Marketing Maven → E-Commerce
      { clientId: client2.id, agentId: agents[2].id }, // Analytics Ace → E-Commerce
    ],
  })
  console.log('✓ Assigned agents to clients')

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      name: 'Q1 2026 Marketing Campaign',
      description: 'Launch new product line with integrated marketing strategy',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2026-01-01'),
      dueDate: new Date('2026-03-31'),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      clientId: client2.id,
      name: 'Brand Refresh & Content Strategy',
      description: 'Update brand identity and create content calendar',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2026-02-15'),
      dueDate: new Date('2026-04-30'),
    },
  })

  console.log('✓ Created 2 projects')

  // Create Tasks
  await prisma.task.createMany({
    data: [
      // Tech Startup tasks
      {
        clientId: client1.id,
        projectId: project1.id,
        title: 'Develop social media content calendar',
        description: 'Create 3-month content plan for LinkedIn, Twitter, and Instagram',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedTo: agents[0].id,
        dueDate: new Date('2026-02-28'),
      },
      {
        clientId: client1.id,
        projectId: project1.id,
        title: 'Write product launch blog posts',
        description: 'Draft 5 blog posts highlighting new features',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedTo: agents[1].id,
        dueDate: new Date('2026-03-10'),
      },
      {
        clientId: client1.id,
        projectId: project1.id,
        title: 'Design email campaign templates',
        description: 'Create branded email templates for product launch',
        status: 'DONE',
        priority: 'MEDIUM',
        assignedTo: agents[1].id,
        completedAt: new Date('2026-02-10'),
      },
      // E-Commerce tasks
      {
        clientId: client2.id,
        projectId: project2.id,
        title: 'Conduct competitor analysis',
        description: 'Analyze top 5 competitors for brand positioning insights',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedTo: agents[2].id,
        dueDate: new Date('2026-02-25'),
      },
      {
        clientId: client2.id,
        projectId: project2.id,
        title: 'Create brand style guide',
        description: 'Document updated brand colors, fonts, and visual identity',
        status: 'TODO',
        priority: 'HIGH',
        assignedTo: agents[0].id,
        dueDate: new Date('2026-03-05'),
      },
      {
        clientId: client2.id,
        title: 'Weekly analytics report',
        description: 'Generate weekly performance metrics and insights',
        status: 'TODO',
        priority: 'LOW',
        assignedTo: agents[2].id,
        dueDate: new Date('2026-02-22'),
      },
    ],
  })
  console.log('✓ Created 6 tasks')

  // Create Recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        clientId: client1.id,
        title: 'Increase LinkedIn engagement',
        description: 'Your LinkedIn posts are getting 2x more engagement than other platforms. Consider focusing more effort here for Q1.',
        priority: 'HIGH',
        category: 'Social Media',
      },
      {
        clientId: client1.id,
        title: 'Video content opportunity',
        description: 'Analysis shows your audience responds well to video. Recommend adding 2-3 videos per month to content plan.',
        priority: 'MEDIUM',
        category: 'Content Strategy',
      },
      {
        clientId: client2.id,
        title: 'Email list growth strategy',
        description: 'Email list growth has slowed. Recommend implementing lead magnet campaign to boost signups.',
        priority: 'HIGH',
        category: 'Email Marketing',
      },
    ],
  })
  console.log('✓ Created 3 recommendations')

  // Create Agent Activities
  await prisma.agentActivity.createMany({
    data: [
      {
        agentId: agents[0].id,
        activity: 'Completed content calendar review',
        description: 'Reviewed and approved Q1 social media content calendar for Tech Startup Inc',
      },
      {
        agentId: agents[1].id,
        activity: 'Drafted blog post',
        description: 'Completed first draft of "5 Features That Set Us Apart" blog post',
      },
      {
        agentId: agents[2].id,
        activity: 'Generated analytics report',
        description: 'Created weekly performance dashboard for E-Commerce Plus',
      },
    ],
  })
  console.log('✓ Created 3 agent activities')

  // Create Sample Analytics
  await prisma.analytics.createMany({
    data: [
      {
        clientId: client1.id,
        metric: 'social_engagement',
        value: 12500,
        unit: 'interactions',
        period: 'weekly',
      },
      {
        clientId: client1.id,
        metric: 'website_visitors',
        value: 8200,
        unit: 'visits',
        period: 'weekly',
      },
      {
        clientId: client2.id,
        metric: 'email_open_rate',
        value: 24.5,
        unit: 'percent',
        period: 'weekly',
      },
      {
        clientId: client2.id,
        metric: 'conversion_rate',
        value: 3.2,
        unit: 'percent',
        period: 'weekly',
      },
    ],
  })
  console.log('✓ Created 4 analytics records')

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📝 Login Credentials:')
  console.log('   Owner: owner@aimforce.cloud / aimforce2026')
  console.log('   Demo Client 1: demo1@company.com / demo2026')
  console.log('   Demo Client 2: demo2@company.com / demo2026')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
