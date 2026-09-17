export const showHomePage = async (req, res) => {
  void req;

  const title = 'Home';
  res.render('home', { title });
};
