import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import mongoose, {mongo} from "mongoose";
import session from "express-session"
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";

const app = express();

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/UsersDB")

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	googleId: String,
	secret: String
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
	done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
	const user = await User.findById(id);
	return done(null, user);
});

passport.use(new GoogleStrategy({
		clientID: process.env.CLIENTID,
		clientSecret: process.env.CLIENT_SECRET,
		callbackURL: "http://localhost:3000/auth/google/secrets",
		userProfileURl: 'https://www.googleapis.com/oauth2/v3/userinfo'
	},
	function(accessToken, refreshToken, profile, cb) {
		User.findOrCreate({ username: profile.displayName, googleId: profile.id }, function (err, user) {
			return cb(err, user)
		});
	}
));

app.get("/", (req, res) =>{
	res.render("home.ejs")
})

app.get("/auth/google",
	passport.authenticate("google", { scope: ['profile']})
)

app.get("/auth/google/secrets",
	passport.authenticate('google', { failureRedirect: "/login" }),
	(req, res) => {
	res.redirect("/secrets")
	}
)

app.get("/login", (req, res) => {
	res.render("login.ejs")
})

app.get("/register", (req, res) => {
	res.render("register.ejs")
})

app.get("/secrets", (req, res) => {
	User.find({secret: {$ne: null}})
		.then(function (foundUser) {
			res.render("secrets.ejs", { userSecrets: foundUser})
		})
		.catch(function (err) {
			console.log(err)
		})
})

app.get("/submit", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("submit.ejs")
	} else {
		res.redirect("/login")
	}
})

app.get("/logout", (req, res, next) => {
	req.logout(req.user, err => {
		if(err) return next(err);
		res.redirect("/");
	});
});

app.post("/register", (req, res) => {
	User.register({username:req.body.username}, req.body.password, function(err, user) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	})
});

app.post("/login", (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	})
	req.login(user, function (err) {
		if (err) {
			console.log(err)
			res.redirect("/register")
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets")
			})
		}
	})
});

app.post("/submit", (req, res) => {
	const secret = req.body.secret;
	User.findById(req.user.id)
		.then(function (foundUser) {
			foundUser.secret = secret
			foundUser.save();
			res.redirect("/secrets")
		})
		.catch(function (err) {
			console.log(err)
		})
})


app.listen(3000)