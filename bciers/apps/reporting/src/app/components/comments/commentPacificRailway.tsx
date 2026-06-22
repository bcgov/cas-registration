import { Box, Button, Drawer } from '@mui/material';
import React, { useState } from 'react';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CommentBoxCar from './commentBoxCar';
import { Thread } from './types';
// import getCommentsMaaaan from '../services/getCommentsMaaaan';

interface Props {
  version_id: number;
  facility_id?: number;
  slug?: string;  //replace with enum later
}
  
  const CommentPacificRailway: React.FC<Props> = ({
    version_id,
    facility_id,
    slug,
  }) => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };
    // const commentThreads = getCommentsMaaaan(version_id, facility_id, slug);
    const commentThreads: Thread[] = [
      {
        headHonchoId: 1,
        headHonchoName: "Test Thread 1",
        items: [
          {
            id: 1,
            userName: "Big Ralph",
            timestamp: "2023-07-01",
            text: "This is a test comment 1",
            version_id: 17,
          },
          {
            id: 2,
            userName: "Excitable Jurgen",
            timestamp: "2023-07-02",
            text: "This is another test comment 2",
            version_id: 17,
          },
        ],
        createdBy: "Big Ralph",
        createdAt: "2023-07-01",
        version_id: 17,
      },
      {
        headHonchoId: 2,
        headHonchoName: "Test Thread 2",
        items: [
          {
            id: 2,
            userName: "Excitable Jurgen",
            timestamp: "2023-07-02",
            text: "This is a third test comment 3",
            version_id: 17,
          },
        ],
        createdBy: "Excitable Jurgen",
        createdAt: "2023-07-02",
        version_id: 17,
      },
    ];
    

    const createNewCommentThread = () => {
        // Implement the logic to create a new comment thread here
    }
  
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          sx={{ position: "fixed", right: 0, top: "25%", height: "4rem" }}
          onClick={toggleDrawer(true)}
        >
          <QuestionAnswerIcon />
        </Button>
        <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
          <h1 className={`w-full text-lg`} style={{ textAlign: 'center' }}>Comments</h1>
          <Button
            onClick={createNewCommentThread}
            variant="outlined"
            color="primary"
            fullWidth
          >
            -----------New Thread-----------
          </Button>
          {commentThreads.map((thread) => (
            <CommentBoxCar key={thread.headHonchoId} thread={thread} />
          ))}
        </Drawer>
      </>
    );
  };
  
  export default CommentPacificRailway;
