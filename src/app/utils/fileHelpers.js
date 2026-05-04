const buildAttachments = files => {
  if (!files || !files.length) return [];
  return files.map(file => ({
    url: '/uploads/' + file.filename,
    type: file.mimetype.includes('image') ? 'image' : 'file',
    name: file.originalname,
  }));
};

const isOwner = (viewerId, ownerId) => {
  return viewerId && viewerId.toString() === ownerId.toString();
};

module.exports = { buildAttachments, isOwner };
