"use client";

import Tiles from "@/app/components/dashboard/Tiles";

import { IncomingTileData } from "@/app/components/dashboard/types";
// 📐 import the tile data
import reportAProblemTile from "@/app/data/dashboard_v2/shared/report_a_problem";
import bceidSelectOperatorTile from "@/app/data/dashboard_v2/bceid/select_operator";
import bceidMyOperatorTile from "@/app/data/dashboard_v2/bceid/my_operator";
import bceidOperationsTile from "@/app/data/dashboard_v2/bceid/operations";
import bceidUsersTile from "@/app/data/dashboard_v2/bceid/users";
import idirOperatorsTile from "@/app/data/dashboard_v2/idir/operators";
import idirOperationsTile from "@/app/data/dashboard_v2/idir/operations";
import idirUsersTile from "@/app/data/dashboard_v2/idir/users";

const tileMap = {
  bceidSelectOperatorTile,
  bceidMyOperatorTile,
  bceidOperationsTile,
  bceidUsersTile,
  idirOperatorsTile,
  idirOperationsTile,
  idirUsersTile,
  reportAProblemTile,
};

const RegistrationDashboard = ({
  tileData,
}: {
  tileData: IncomingTileData[];
}) => {
  return <Tiles tileData={tileData} tileMap={tileMap} />;
};

export default RegistrationDashboard;
