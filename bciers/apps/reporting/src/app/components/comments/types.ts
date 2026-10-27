export type Comment = {
  id: number;
  version_id: number;
  author?: string;
  timestamp?: string;
  comment: string;
  user_can_edit?: boolean;
};

export type Thread = {
  id: number;
  version_id: number;
  facility_name?: string;
  facility_id?: string;
  comments: Comment[];
  resolved: boolean;
};

export type FacilityItem = {
  facility_id: string;
  facility_name: string;
};

export type ThreadsResponse = {
  threads: Thread[];
  facilities: FacilityItem[];
  can_create_comment_thread: boolean;
};
