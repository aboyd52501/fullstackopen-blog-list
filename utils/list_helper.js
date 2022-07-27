// I removed the unused variable because airbnb eslint didn't like it
const dummy = () => 1;

const totalLikes = (blogs) => (
  blogs.reduce((acc, x) => acc + x.likes, 0)
);

module.exports = {
  dummy,
  totalLikes,
};
