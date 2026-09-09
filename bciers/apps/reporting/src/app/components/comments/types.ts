export type Comment = {
  id?: number;
  version_id: number;
  author?: string;
  timestamp?: string;
  comment: string;
};

export type Thread = {
  id?: number;
  version_id: number;
  facility_name?: string;
  facility_id?: string;
  comments: Comment[];
};

export type FacilityItem = {
  facility_id: string;
  facility_name: string;
};

export type ThreadsResponse = {
  threads: Thread[];
  facilities: FacilityItem[];
};
