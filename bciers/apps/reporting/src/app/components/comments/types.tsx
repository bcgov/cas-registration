import { TrainStations } from "@bciers/utils/src/enums";

export interface Comment extends ThreadItem {
  userName: string;
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
    createdBy: string;
    createdAt: string;
    version_id: number;
    lastUpdatedAt?: string;
    lastUpdatedBy?: string;
}
