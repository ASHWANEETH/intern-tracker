// app/dashboard/DeadlinesTab.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import JobTile from "@/components/JobTile";

export default function DeadlinesTab() {
  const supabase = createClient();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("last_date_to_apply", { ascending: true });

      setJobs(data || []);
    };

    fetch();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
      <div className="flex flex-col gap-4">
        {jobs.filter(j => j.last_date_to_apply).map(job => (
          <JobTile key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
