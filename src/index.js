require('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const app = express();

const db = require('./config/db');
const path = require('path');
const route = require('./routes');
const sessionConfig = require('./config/session')(process.env);
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.connect();
app.use(session(sessionConfig));

//Veiw engine
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    helpers: require('./helpers/handlebars'),
  }),
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

//Custom method
app.use(methodOverride('_method'));

// static file
app.use(express.static(path.join(__dirname, 'public')));

route(app);

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
