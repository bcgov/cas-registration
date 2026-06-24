import { TrainStations } from "@bciers/utils/src/enums";
import { UUID } from "crypto";

export interface Comment extends ThreadItem {
  created_by: UUID;
  user_name: string;
}

export interface EventEntry extends ThreadItem {
  eventType: string;
}

interface ThreadItem {
  id?: number;
  comment: string;
  created_at: string;
  report_version: number;
}

export interface Thread {
  id: number;
  title: string;
  report_section?: TrainStations;
  report_comments_bodyofthesnake: Comment[];
  created_by: UUID;
  user_name: string;
  created_at: string;
  report_version: number;
  updated_at?: string;
}
