import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const app = express();
const saltRounds = 10;
mongoose.connect("mongodb://localhost:27017/loginDB")
	.catch(function (err) {
		console.log(err)
	})

const userSchema = new mongoose.Schema({
	email: String,
	password: String
})
await bcrypt.compare(password, hash)

const User = new mongoose.model("User", userSchema);


app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) =>{
	res.render("home.ejs")
})

app.get("/login", (req, res) => {
	res.render("login.ejs")
})

app.get("/register", (req, res) => {
	res.render("register.ejs")
})

app.post("/register", (req, res) => {
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		const newUser = new User({
			email: req.body.username,
			password: hash
		});
		newUser.save()
			.then(function () {
				res.render("secrets.ejs")
			})
			.catch(function (err) {
				console.log(err)
			})
	})
})

app.post("/login", (req, res) => {
	const username = req.body.username
	const password = req.body.password
	User.findOne({email:username})
		.then(function (foundUser) {
			bcrypt.compare(password, foundUser.password, (err, result) => {
				if (result === true) {
					res.render("secrets.ejs")
				}
			})
		})
		.catch(function (err) {
			console.log(err)
		})
})


app.listen(3000)