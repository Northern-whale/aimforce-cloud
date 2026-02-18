import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ClientPortal() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CLIENT' || !session.user.clientId) {
    redirect('/login')
  }

  const clientId = session.user.clientId

  // Fetch client data
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { user: true },
  })

  if (!client) {
    redirect('/login')
  }

  // Fetch dashboard data
  const [tasks, agents, projects, recommendations, recentVoiceNotes] = await Promise.all([
    prisma.task.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { agent: true, project: true },
    }),
    prisma.agentAssignment.findMany({
      where: { clientId },
      include: {
        agent: true,
      },
    }),
    prisma.project.findMany({
      where: { clientId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
      },
    }),
    prisma.recommendation.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.voiceNote.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {session.user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/portal/voice"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
              >
                🎤 Record Voice Note
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="To Do" value={tasksByStatus.todo} color="gray" />
          <StatCard title="In Progress" value={tasksByStatus.inProgress} color="blue" />
          <StatCard title="Completed" value={tasksByStatus.done} color="green" />
          <StatCard title="Your Agents" value={agents.length} color="cyan" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Tasks & Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  💡 AI Recommendations
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded"
                    >
                      <h3 className="font-medium text-gray-900">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                        {rec.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
                <a href="/portal/tasks" className="text-sm text-blue-600 hover:text-blue-700">
                  View All →
                </a>
              </div>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks yet</p>
                ) : (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                task.status === 'DONE'
                                  ? 'bg-green-100 text-green-700'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.agent && (
                              <span className="text-xs text-gray-500">
                                Assigned to: {task.agent.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Projects */}
            {projects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{project._count.tasks} tasks</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Agents & Voice Notes */}
          <div className="space-y-8">
            {/* Your AI Agents */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your AI Team</h2>
              <div className="space-y-3">
                {agents.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      {assignment.agent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{assignment.agent.name}</h3>
                      <p className="text-xs text-gray-600">{assignment.agent.type}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        assignment.agent.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700'
                          : assignment.agent.status === 'BUSY'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {assignment.agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Voice Notes */}
            {recentVoiceNotes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Voice Notes</h2>
                  <a href="/portal/voice" className="text-sm text-blue-600 hover:text-blue-700">
                    View All →
                  </a>
                </div>
                <div className="space-y-3">
                  {recentVoiceNotes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>🎤</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        {note.duration && <span>{note.duration}s</span>}
                      </div>
                      {note.transcription && (
                        <p className="text-sm text-gray-700 line-clamp-2">{note.transcription}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/portal/voice"
                  className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎤</span>
                    <span className="font-medium">Record Voice Note</span>
                  </div>
                </a>
                <a
                  href="/portal/files"
                  className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📁</span>
                    <span className="font-medium">Upload Files</span>
                  </div>
                </a>
                <a
                  href="/portal/analytics"
                  className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span className="font-medium">View Analytics</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-50 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    cyan: 'bg-cyan-50 text-cyan-700',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
