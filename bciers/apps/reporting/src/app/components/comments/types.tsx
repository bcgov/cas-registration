import { TrainStations } from "@bciers/utils/src/enums";
import { UUID } from "crypto";

interface ThreadItem {
  id?: number;
  comment: string;
  created_at: string;
  report_version_id: number;
}

export interface Comment extends ThreadItem {
  created_by: UUID;
  user_name: string;
}

export interface EventEntry extends ThreadItem {
  event_type?: string;
}

export type TimelineEntry =
  | (Comment & { entry_type: "comment" })
  | (EventEntry & { entry_type: "event" });

export interface Thread {
  id: number;
  title: string;
  report_section?: TrainStations;
  report_comments: Comment[];
  report_events?: EventEntry[];
  created_by: UUID;
  user_name: string;
  created_at: string;
  report_version_id: number;
  updated_at?: string;
  facility_name?: string;
  is_resolved: boolean;
}
