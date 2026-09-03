interface Props {
  comment: string;
}

const Comment: React.FC<Props> = ({ comment }) => {
  return <div>{comment}</div>;
};

export default Comment;
