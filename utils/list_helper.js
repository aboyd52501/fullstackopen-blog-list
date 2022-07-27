// I removed the unused variable because airbnb eslint didn't like it
const dummy = () => 1;

const totalLikes = (blogs) => (
  blogs.reduce((acc, x) => acc + x.likes, 0)
);

const favoriteBlog = (blogs) => (
  blogs.reduce((fav, x) => (
    x.likes > fav.likes ? x : fav
  ))
);

const mostBlogs = (blogs) => {
  const count = {};
  blogs.forEach((blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1;
  });

  const mostBlogsAuthor = Object.entries(count).reduce((most, x) => (
    most[1] < x[1] ? x : most
  ));

  return {
    author: mostBlogsAuthor[0],
    blogs: mostBlogsAuthor[1],
  };
};

const mostLikes = (blogs) => {
  const count = {};
  blogs.forEach((blog) => {
    count[blog.author] = (count[blog.author] || 0) + blog.likes;
  });

  const mostLikesAuthor = Object.entries(count).reduce((most, x) => (
    most[1] < x[1] ? x : most
  ));

  return {
    author: mostLikesAuthor[0],
    likes: mostLikesAuthor[1],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
