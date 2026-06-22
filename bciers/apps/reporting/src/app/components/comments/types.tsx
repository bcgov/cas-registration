import { TrainStations } from "@bciers/utils/src/enums";
import { UUID } from "crypto";

export interface Comment extends ThreadItem {
  userName: string;
  userId?: UUID;
};

export interface EventEntry extends ThreadItem {
  eventType: string;
};

interface ThreadItem {
  id?: number;
  text: string;
  timestamp: string;
  version_id: number;
};

export interface Thread {
    headHonchoId: number;
    headHonchoName: string;
    reportSection?: TrainStations;
    items: (Comment)[];
    createdByName: string;
    createdById?: UUID;
    createdAt: string;
    version_id: number;
    lastUpdatedAt?: string;
    lastUpdatedBy?: string;
}
