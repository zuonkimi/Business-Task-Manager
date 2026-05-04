const profilePageService = require('../../services/pageServices/profile.pageService');

class ProfileController {
  async show(req, res, next) {
    const viewerId = req.session.userId;
    const profileUserId = req.params.userId;
    const data = await profilePageService.getProfilePage(
      viewerId,
      profileUserId,
      req.query.keyword,
    );
    if (!data) return res.status(404).send('User not found!');
    return res.render('profile/show', data);
  }

  async edit(req, res, next) {
    const viewerId = req.session.userId;
    const userId = req.params.userId;
    const user = await profilePageService.getEditProfilePage(viewerId, userId);
    if (!user) return res.status(403).send('user is not found!');
    return res.render('profile/edit', { user });
  }

  async update(req, res, next) {
    const viewerId = req.session.userId;
    const userId = req.params.userId;
    const result = await profilePageService.updateProfilePage(
      viewerId,
      userId,
      req.body,
      req.file,
    );
    if (!result) return res.status(403).send('Forbidden');
    return res.redirect(`/profile/${userId}`);
  }
}

module.exports = new ProfileController();
