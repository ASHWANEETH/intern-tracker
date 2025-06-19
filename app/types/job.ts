export type Job = {
  id: string;
  company_name: string;
  role: string;
  ctc: string;
  requirements?: string | null;
  status: string;
  last_date_to_apply?: string | null;
  applied_date?: string | null;
  exam_date?: string | null;
  created_at?: string;
  user_id: string;
};
