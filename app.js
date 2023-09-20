import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
mongoose.connect("mongodb://localhost:27017/loginDB")
	.catch(function (err) {
		console.log(err)
	})

const userSchema = new mongoose.Schema({
	email: String,
	password: String
})


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
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
	const newUser = new User({
		email: req.body.username,
		password: req.body.password
	});
	newUser.save()
		.then(function () {
			res.render("secrets.ejs")
		})
		.catch(function (err) {
			console.log(err)
		})
})

app.post("/login", (req, res) => {
	const username = req.body.username
	const password = req.body.password
	User.findOne({email:username})
		.then(function (foundUser) {
			if (foundUser.password === password) {
				res.render("secrets.ejs")
			}
		})
		.catch(function (err) {
			console.log(err)
		})
})


app.listen(3000)