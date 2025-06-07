'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Job = {
  id: string
  company_name: string
  role: string
  status: string
  applied_on?: string | null
  user_id: string
  created_at?: string
}

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<{
    id: string
    email: string
    full_name?: string
  } | null>(null)

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [appliedOn, setAppliedOn] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editJobId, setEditJobId] = useState<string | null>(null)
  const [editCompanyName, setEditCompanyName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editAppliedOn, setEditAppliedOn] = useState('')

  useEffect(() => {
    const getSessionAndFetchJobs = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session?.user) {
        router.push('/')
        return
      }

      const currentUser = session.user
      setUser({
        id: currentUser.id,
        email: currentUser.email ?? '',
        full_name: (currentUser.user_metadata as { full_name?: string })?.full_name,
      })

      const { data: jobsData, error: jobError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (jobError) {
        console.error('Job fetch error:', jobError.message)
      }

      setJobs(jobsData ?? [])
      setLoading(false)
    }

    getSessionAndFetchJobs()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        router.push('/')
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: (session.user.user_metadata as { full_name?: string })?.full_name,
        })
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('Logout failed: ' + error.message)
      return
    }
    setUser(null)
    setJobs([])
    router.push('/')
  }

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      alert('User ID missing. Try reloading.')
      return
    }

    if (!companyName || !role || !status) {
      alert('Please fill all fields')
      return
    }

    const { data, error } = await supabase.from('job_applications').insert({
      company_name: companyName,
      role,
      status,
      applied_on: appliedOn || null,
      user_id: user.id,
    })

    if (error) {
      alert('Error adding job: ' + error.message)
      return
    }

    setJobs((prev) => [...(data as unknown as Job[]), ...prev])
    setCompanyName('')
    setRole('')
    setStatus('')
    setAppliedOn('')
    setModalOpen(false)
  }

  const openEditModal = (job: Job) => {
    setEditJobId(job.id)
    setEditCompanyName(job.company_name)
    setEditRole(job.role)
    setEditStatus(job.status)
    setEditAppliedOn(job.applied_on ?? '')
    setEditModalOpen(true)
  }

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editJobId) return

    const { error } = await supabase
      .from('job_applications')
      .update({
        company_name: editCompanyName,
        role: editRole,
        status: editStatus,
        applied_on: editAppliedOn || null,
      })
      .eq('id', editJobId)

    if (error) {
      alert('Error updating job: ' + error.message)
      return
    }

    setJobs((prev) =>
      prev.map((job) =>
        job.id === editJobId
          ? {
              ...job,
              company_name: editCompanyName,
              role: editRole,
              status: editStatus,
              applied_on: editAppliedOn || null,
            }
          : job
      )
    )

    setEditModalOpen(false)
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hi, {user?.full_name ?? user?.email}</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Intern Applications</h2>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Application</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Job Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddJob} className="flex flex-col gap-4 mt-4">
              <Input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <Input
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
              <Input
                placeholder="Status (e.g., Applied, Interview)"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              />
              <Input
                type="date"
                value={appliedOn}
                onChange={(e) => setAppliedOn(e.target.value)}
              />
              <Button type="submit">Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-4">
        {jobs.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          jobs.map((job) => (
            <li
              key={job.id}
              className="p-4 border rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <strong>{job.company_name}</strong> — {job.role}{' '}
                <em>({job.status})</em>{' '}
                {job.applied_on && (
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(job.applied_on).toLocaleDateString()}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => openEditModal(job)}>
                Edit
              </Button>
            </li>
          ))
        )}
      </ul>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditJob} className="flex flex-col gap-4 mt-4">
            <Input
              placeholder="Company Name"
              value={editCompanyName}
              onChange={(e) => setEditCompanyName(e.target.value)}
              required
            />
            <Input
              placeholder="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              required
            />
            <Input
              placeholder="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              required
            />
            <Input
              type="date"
              value={editAppliedOn}
              onChange={(e) => setEditAppliedOn(e.target.value)}
            />
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
