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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

type Job = {
  id: string
  company_name: string
  role: string
  ctc: string
  requirements: string
  status: string
  interview_date?: string | null
  applied_date?: string | null
  created_at?: string
  user_id: string
}

const statusColors: Record<string, string> = {
  'to-apply': 'bg-gray-300 text-gray-800',
  applied: 'bg-blue-200 text-blue-800',
  waiting: 'bg-yellow-200 text-yellow-800',
  rejected: 'bg-red-200 text-red-800',
  approved: 'bg-green-200 text-green-800',
}

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [ctc, setCtc] = useState('')
  const [requirements, setRequirements] = useState('')
  const [status, setStatus] = useState('to-apply')
  const [interviewDate, setInterviewDate] = useState('')
  const [editJobId, setEditJobId] = useState<string | null>(null)
  const [appliedDate, setAppliedDate] = useState('')


  const handleEditClick = (job: Job) => {
    setEditJobId(job.id)
    setCompanyName(job.company_name)
    setRole(job.role)
    setCtc(job.ctc)
    setRequirements(job.requirements)
    setStatus(job.status)
    setInterviewDate(job.interview_date || '')
    setAppliedDate(job.applied_date || '')
    setModalOpen(true)
  }

  const handleAddOrUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    if (editJobId) {
      const { error } = await supabase.from('job_applications').update({
        company_name: companyName,
        role,
        ctc,
        requirements,
        status,
        interview_date: interviewDate || null,
        applied_date: appliedDate || null,
      }).eq('id', editJobId)

      if (!error) {
        setJobs(prev => prev.map(job => job.id === editJobId
          ? { ...job, company_name: companyName, role, ctc, requirements, status, interview_date: interviewDate }
          : job
        ))
      }
    } else {
      const { data, error } = await supabase.from('job_applications').insert({
        company_name: companyName,
        role,
        ctc,
        requirements,
        status,
        interview_date: interviewDate || null,
        applied_date: appliedDate || null,
        user_id: user.id,
      }).select()

      if (!error && data) {
        const newJobs = Array.isArray(data) ? data : [data]
        setJobs(prev => [...newJobs, ...prev])
      }
    }

    setCompanyName('')
    setRole('')
    setCtc('')
    setRequirements('')
    setStatus('to-apply')
    setInterviewDate('')
    setEditJobId(null)
    setModalOpen(false)
  }

  useEffect(() => {
    const getSessionAndFetchJobs = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

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

      const { data: jobsData } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      setJobs(jobsData ?? [])
      setLoading(false)
    }

    getSessionAndFetchJobs()
  }, [supabase, router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      router.push('/')
    }
  }

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    await supabase.from('job_applications').update({ status: newStatus }).eq('id', jobId)
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job))
    )
  }

  const handleDelete = async (jobId: string) => {
    await supabase.from('job_applications').delete().eq('id', jobId)
    setJobs(prev => prev.filter(job => job.id !== jobId))
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 truncate max-w-[70%]">
          Hi, {user?.full_name ?? user?.email}
        </h1>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Intern Applications</h2>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setCompanyName('')
                setRole('')
                setCtc('')
                setRequirements('')
                setStatus('to-apply')
                setInterviewDate('')
                setModalOpen(true)
              }}
            >
              Add New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editJobId ? 'Edit Job Application' : 'Add Job Application'}</DialogTitle>
            </DialogHeader>
              <form onSubmit={handleAddOrUpdateJob} className="flex flex-col gap-4 mt-4">
                <Input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                <Input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} required />
                <Input placeholder="CTC / Stipend" value={ctc} onChange={e => setCtc(e.target.value)} required />
                <Input placeholder="Job Requirements" value={requirements} onChange={e => setRequirements(e.target.value)} required />

                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-apply">To Apply</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>

                {status === "to-apply" ? (
                  <>
                    <label className="font-medium text-gray-700">Last Date to Apply</label>
                    <Input
                      type="date"
                      value={interviewDate}
                      onChange={e => setInterviewDate(e.target.value)}
                      placeholder="Select last date to apply"
                      required
                    />
                  </>
                ) : (
                  <>
                    <label className="font-medium text-gray-700">Applied Date</label>
                    <Input
                      type="date"
                      value={appliedDate}
                      onChange={e => setAppliedDate(e.target.value)}
                      placeholder="Select applied date"
                      required
                    />

                    <label className="font-medium text-gray-700 mt-2">Exam / Interview Date</label>
                    <Input
                      type="date"
                      value={interviewDate}
                      onChange={e => setInterviewDate(e.target.value)}
                      placeholder="Select exam/interview date"
                    />
                  </>
                )}


                <Button type="submit" className="mt-2">{editJobId ? 'Update' : 'Submit'}</Button>
              </form>


          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-6">
        {jobs.map(job => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white w-full"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xl font-semibold text-indigo-700 truncate max-w-[65%]">{job.company_name}</h3>
              <Select value={job.status} onValueChange={(val) => handleStatusChange(job.id, val)}>
                <SelectTrigger
                  className={`h-8 w-28 flex items-center justify-center rounded-md ${
                    statusColors[job.status] ?? 'bg-gray-300 text-gray-800'
                  }`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-apply">To Apply</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-lg font-medium text-gray-900">{job.role}</p>
            <p className="text-sm text-gray-600 mt-1">{job.ctc}</p>
            <p className="text-sm text-gray-700 mt-3 italic">{job.requirements}</p>

            <div className="mt-4 text-sm text-gray-500 space-y-1">
              {(job.status === 'applied' || job.status === 'waiting' || job.status === 'approved') ? (
                <>
                  <p>Applied on: {job.applied_date ? new Date(job.applied_date).toLocaleDateString() : (job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')}</p>
                  {job.interview_date && (
                    <p>Interview Date: {new Date(job.interview_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                </>
              ) : (
                <p>Last Date to Apply: {job.interview_date ? new Date(job.interview_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button size="sm" variant="secondary" onClick={() => handleEditClick(job)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
