import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'OWNER') {
    redirect('/login')
  }

  // Fetch dashboard stats
  const [
    totalClients,
    activeClients,
    totalAgents,
    availableAgents,
    totalTasks,
    inProgressTasks,
    totalProjects,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } }),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: 'AVAILABLE' } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.project.count(),
  ])

  // Recent activities
  const recentActivities = await prisma.agentActivity.findMany({
    take: 10,
    orderBy: { timestamp: 'desc' },
    include: { agent: true },
  })

  // Active projects
  const activeProjects = await prisma.project.findMany({
    where: { status: 'IN_PROGRESS' },
    take: 5,
    include: {
      client: true,
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {session.user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/owner/clients"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Manage Clients
              </a>
              <a
                href="/api/auth/signout"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={totalClients}
            subtitle={`${activeClients} active`}
            color="blue"
          />
          <StatCard
            title="AI Agents"
            value={totalAgents}
            subtitle={`${availableAgents} available`}
            color="cyan"
          />
          <StatCard
            title="Active Tasks"
            value={inProgressTasks}
            subtitle={`${totalTasks} total`}
            color="green"
          />
          <StatCard
            title="Projects"
            value={totalProjects}
            subtitle={`${activeProjects.length} in progress`}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Projects */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
            <div className="space-y-4">
              {activeProjects.length === 0 ? (
                <p className="text-gray-500 text-sm">No active projects</p>
              ) : (
                activeProjects.map((project) => (
                  <div key={project.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client.companyName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{project._count.tasks} tasks</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {project.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-700 text-xs font-medium">
                        {activity.agent.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                      <p className="text-xs text-gray-600">{activity.agent.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="View All Clients"
            description="Manage client accounts and assignments"
            href="/owner/clients"
            icon="👥"
          />
          <QuickAction
            title="Agent Management"
            description="Configure and monitor AI agents"
            href="/owner/agents"
            icon="🤖"
          />
          <QuickAction
            title="Analytics"
            description="View performance metrics and insights"
            href="/owner/analytics"
            icon="📊"
          />
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: number
  subtitle: string
  color: string
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  )
}
