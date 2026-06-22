import { Box } from '@mui/material';
import React from 'react';
import { Thread } from './types';

interface Props {
    thread: Thread;
}
  
const CommentBoxCar: React.FC<Props> = ({
    thread,
}) => {
    return (
        <Box>
            <h2> {thread.createdBy ?? ""}</h2>
            <p> {thread.createdAt}</p>
            <div> { thread.version_id } </div>
            { thread.reportSection && <div>{ thread.reportSection }</div> }

            {thread.items.map((comment, index) => (
                <Box key={index}>
                    <h3>{comment.userName ?? "Event"}</h3>
                    <p>{comment.version_id}</p>
                    <p>{comment.timestamp}</p>
                    <p>{comment.text}</p>
                </Box>
            ))}
        </Box>
    );
};
  
export default CommentBoxCar;
