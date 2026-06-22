import {
    Box,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';
import { Thread } from './types';

interface Props {
    thread: Thread;
}
  
const CommentBoxCar: React.FC<Props> = ({
    thread,
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 45%)',
            }}
        >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                                {thread.createdByName ?? 'Unknown author'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Started {thread.createdAt}
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        size="small"
                        label={`v${thread.version_id}`}
                        color="primary"
                        variant="outlined"
                    />
                </Stack>

                {thread.reportSection && (
                    <Chip
                        size="small"
                        label={thread.reportSection}
                        sx={{ mt: 1.5 }}
                        variant="filled"
                    />
                )}
            </Box>

            <Box sx={{ px: 2.5, py: 1.5 }}>
                {thread.items.map((comment, index) => (
                    <Box key={index} sx={{ position: 'relative', pl: 3, pb: index === thread.items.length - 1 ? 0 : 2.5 }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 9,
                                top: 10,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: 'primary.light',
                                border: '2px solid',
                                borderColor: 'background.paper',
                                boxShadow: 1,
                            }}
                        />
                        {index < thread.items.length - 1 && (
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                    position: 'absolute',
                                    left: 13,
                                    top: 20,
                                    bottom: 0,
                                    borderColor: 'divider',
                                }}
                            />
                        )}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.default',
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                spacing={0.5}
                                sx={{ mb: 0.75 }}
                            >
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {comment.userName ?? 'Event'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {comment.timestamp}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {comment.text}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
  
export default CommentBoxCar;
