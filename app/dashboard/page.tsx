'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Job = {
  id: string
  company_name: string
  role: string
  status: string
  applied_on?: string
}

export default function Dashboard() {
  const supabase = createClient()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [appliedOn, setAppliedOn] = useState('')

  // Fetch user and jobs on mount
  useEffect(() => {
    const fetchUserAndJobs = async () => {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setLoading(false)
        // Handle user not logged in: redirect or show message
        return
      }

      setUserName(user.user_metadata?.full_name || user.email || 'User')

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
      } else {
        setJobs(data || [])
      }
      setLoading(false)
    }

    fetchUserAndJobs()
  }, [supabase])

  // Open modal for new job
  function openNewJobModal() {
    setEditingJob(null)
    setCompanyName('')
    setRole('')
    setStatus('')
    setAppliedOn('')
    setModalOpen(true)
  }

  // Open modal for edit job
  function openEditJobModal(job: Job) {
    setEditingJob(job)
    setCompanyName(job.company_name)
    setRole(job.role)
    setStatus(job.status)
    setAppliedOn(job.applied_on || '')
    setModalOpen(true)
  }

  // Submit new or updated job
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (editingJob) {
      // Update existing job
      const { error } = await supabase
        .from('job_applications')
        .update({
          company_name: companyName,
          role,
          status,
          applied_on: appliedOn || null,
        })
        .eq('id', editingJob.id)
        .eq('user_id', user.id)

      if (error) {
        alert('Update failed: ' + error.message)
      } else {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === editingJob.id
              ? { ...j, company_name: companyName, role, status, applied_on: appliedOn }
              : j
          )
        )
        setModalOpen(false)
      }
    } else {
      // Insert new job
      const { error, data } = await supabase.from('job_applications').insert({
        user_id: user.id,
        company_name: companyName,
        role,
        status,
        applied_on: appliedOn || null,
      })

      if (error) {
        alert('Insert failed: ' + error.message)
      } else if (data && data.length > 0) {
        setJobs((prev) => [data[0], ...prev])
        setModalOpen(false)
      }
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Hi, {userName}</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Intern Applications</h2>
        <Button onClick={openNewJobModal}>+ Add New Application</Button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && jobs.length === 0 && <p>No job applications found.</p>}

      <ul className="space-y-3">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="p-4 border rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <strong>{job.company_name}</strong> — {job.role} <em>({job.status})</em>{' '}
              {job.applied_on && (
                <span className="text-sm text-gray-500"> | Applied on: {job.applied_on}</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => openEditJobModal(job)}>
              Edit
            </Button>
          </li>
        ))}
      </ul>

      {/* Modal for Add/Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Application' : 'New Application'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Status (e.g. Applied, Interviewed)"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
            <Input
              type="date"
              placeholder="Applied On"
              value={appliedOn}
              onChange={(e) => setAppliedOn(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
