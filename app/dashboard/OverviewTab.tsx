// app/dashboard/OverviewTab.tsx
"use client";
// import { useEffect, useState } from "react";
// import DashboardGreeting from "@/components/DashboardGreet";
// import { createClient } from "@/lib/supabaseClient";

export default function OverviewTab() {
  // const supabase = createClient();
  // const [user, setUser] = useState(null);
  // const [jobs, setJobs] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { data: sessionData } = await supabase.auth.getSession();
  //     const session = sessionData?.session;
  //     if (!session) return;

  //     const { data: jobData } = await supabase
  //       .from("job_applications")
  //       .select("*")
  //       .eq("user_id", session.user.id);

  //     setUser(session.user);
  //     setJobs(jobData || []);
  //   };

  //   fetchData();
  // }, []);

  return (
    <div className="text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Applications</h2>
      <p>Track your job applications here.</p>
    </div>
  );
}
