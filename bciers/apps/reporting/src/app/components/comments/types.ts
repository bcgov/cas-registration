export type Comment = {
  id?: number;
  version_id: number;
  author: string;
  timestamp: string;
  comment: string;
};

export type Thread = {
  id?: number;
  version_id: number;
  facility_name?: string;
  comments: Comment[];
};
