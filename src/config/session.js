module.exports = env => ({
  secret: env.SESSION_SECRET, //KEY
  resave: false, //Không lưu lại session nếu không có thay đổi
  saveUninitialized: false, //Không tạo session nếu chưa dùng gì
});
