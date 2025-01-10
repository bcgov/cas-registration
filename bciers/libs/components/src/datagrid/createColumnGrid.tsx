const createColumnGroup = (
    groupId: string,
    headerName: string,
    renderHeaderGroup: any,
) => ({
    groupId,
    headerName,
    renderHeaderGroup,
    children: [{ field: groupId }],
});

export default createColumnGroup;