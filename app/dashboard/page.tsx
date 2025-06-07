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
  requirements?: string | null
  status: string
  last_date_to_apply?: string | null
  applied_date?: string | null
  exam_date?: string | null
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
  const [lastDateToApply, setLastDateToApply] = useState('')
  const [appliedDate, setAppliedDate] = useState('')
  const [examDate, setExamDate] = useState('')
  const [editJobId, setEditJobId] = useState<string | null>(null)

  const handleEditClick = (job: Job) => {
    setEditJobId(job.id)
    setCompanyName(job.company_name)
    setRole(job.role)
    setCtc(job.ctc)
    setRequirements(job.requirements || '')
    setStatus(job.status)
    setLastDateToApply(job.last_date_to_apply || '')
    setAppliedDate(job.applied_date || '')
    setExamDate(job.exam_date || '')
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
        requirements: requirements || null,
        status,
        last_date_to_apply: lastDateToApply || null,
        applied_date: appliedDate || null,
        exam_date: examDate || null,
      }).eq('id', editJobId)

      if (!error) {
        setJobs(prev => prev.map(job => job.id === editJobId
          ? { ...job, company_name: companyName, role, ctc, requirements, status, last_date_to_apply: lastDateToApply, applied_date: appliedDate, exam_date: examDate }
          : job
        ))
      }
    } else {
      const { data, error } = await supabase.from('job_applications').insert({
        company_name: companyName,
        role,
        ctc,
        requirements: requirements || null,
        status,
        last_date_to_apply: lastDateToApply || null,
        applied_date: appliedDate || null,
        exam_date: examDate || null,
        user_id: user.id,
      }).select()

      if (!error && data) {
        const newJobs = Array.isArray(data) ? data : [data]
        setJobs(prev => [...newJobs, ...prev])
      }
    }

    // Reset form state
    setCompanyName('')
    setRole('')
    setCtc('')
    setRequirements('')
    setStatus('to-apply')
    setLastDateToApply('')
    setAppliedDate('')
    setExamDate('')
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
                setLastDateToApply('')
                setAppliedDate('')
                setExamDate('')
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
              <Input placeholder="Job Requirements" value={requirements} onChange={e => setRequirements(e.target.value)} />

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
                    value={lastDateToApply}
                    onChange={e => setLastDateToApply(e.target.value)}
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
                  />

                  <label className="font-medium text-gray-700 mt-2">Exam / Interview Date</label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
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
            className="border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-indigo-200 hover:border-indigo-200 transition cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{job.company_name}</h3>
              <Select
                value={job.status}
                onValueChange={value => handleStatusChange(job.id, value)}
              >
                <SelectTrigger
                  className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 ease-in-out ${
                    statusColors[job.status] || 'bg-gray-300 text-gray-800'
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-w-xs">
                  <SelectItem value="to-apply" className="hover:bg-yellow-100">To Apply</SelectItem>
                  <SelectItem value="applied" className="hover:bg-blue-100">Applied</SelectItem>
                  <SelectItem value="waiting" className="hover:bg-purple-100">Waiting</SelectItem>
                  <SelectItem value="rejected" className="hover:bg-red-100">Rejected</SelectItem>
                  <SelectItem value="approved" className="hover:bg-green-100">Approved</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <p className="text-gray-700">{job.role}</p>
            <p className="text-gray-700 font-semibold">CTC / Stipend: {job.ctc}</p>
            {job.requirements && <p className="mt-2 text-gray-600">{job.requirements}</p>}

            <div className="mt-4 text-sm text-gray-500 space-y-1">
              {job.status === 'to-apply' ? (
                <p>
                  Last Date to Apply:{' '}
                  {job.last_date_to_apply
                    ? new Date(job.last_date_to_apply).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              ) : (
                <>
                  <p>
                    Applied on:{' '}
                    {job.applied_date
                      ? new Date(job.applied_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                      : job.created_at
                      ? new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                  <p>
                    Exam / Interview Date:{' '}
                    {job.exam_date
                      ? new Date(job.exam_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              <Button size="sm" onClick={() => handleEditClick(job)}>Edit</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(job.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
