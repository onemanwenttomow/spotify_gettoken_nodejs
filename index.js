const express = require("express");
const { client_id, client_secret } = require("./secrets");
const app = express();

const passport = require("passport");

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
const SpotifyStrategy = require("passport-spotify").Strategy;

let userAccessToken = "";

passport.use(
    new SpotifyStrategy(
        {
            clientID: client_id,
            clientSecret: client_secret,
            callbackURL: "http://localhost:8080/callback"
        },
        function(accessToken, refreshToken, expires_in, profile, done) {
            userAccessToken = accessToken;
            console.log("uAT in Use: ", userAccessToken);
            process.nextTick(function() {
                return done(null, profile);
            });
        }
    )
);

app.use(passport.initialize());

const config = {
    scope: [
        "user-read-email",
        "user-read-private",
        "user-top-read",
        "user-follow-read",
        "playlist-modify-private",
        "playlist-modify-public",
        "ugc-image-upload"
    ],
    showDialog: true
};

app.get("/", passport.authenticate("spotify", config), (req, res) => {
    console.log("Will never make it here...");
    res.send("test...");
});

app.get(
    "/callback",
    passport.authenticate("spotify", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/app");
    }
);

app.get("/app", (req, res) => {
    console.log("app userAccessToken:", userAccessToken);
    res.send('<h1>WORKED!</h1>');
});

app.listen(process.env.PORT || 8080, () =>
    console.log("I'm listening on 8080 or process.env.PORT")
);
