'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Job = {
  id: string
  company_name: string
  role: string
  status: string
  applied_on?: string
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('job_applications').select('*')
      if (error) console.error('Fetch error:', error)
      setJobs(data || [])
    }

    fetchJobs()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Intern Applications</h1>
      <ul className="space-y-2">
        {jobs.map((job) => (
          <li key={job.id} className="p-4 border rounded shadow-sm">
            <strong>{job.company_name}</strong> — {job.role} <em>({job.status})</em>
          </li>
        ))}
      </ul>
    </div>
  )
}
