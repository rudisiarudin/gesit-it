export type Activity = {
  id: number;
  activity_name: string;
  location: string;
  user: string;
  it: string;
  type: string;
  category: string;
  remarks: string;
  status: string;
  created_at: string;
  updated_at?: string;
  duration?: string;
};

export type FormData = {
  activity_name: string;
  location: string;
  user: string;
  it: string;
  type: string;
  category: string;
  remarks: string;
  status: string;
  duration?: string;
  updated_at?: string;
};
