const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const prisma = require('./prisma');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await prisma.users.upsert({
          where: { email: profile.emails[0].value },
          update: { googleid: profile.id },
          create: {
            name: profile.displayName,
            email: profile.emails[0].value,
            googleid: profile.id,
          },
        });

        let profiles = await prisma.profiles.upsert({
          where: { userId: user.id },
          update: { userId: user.id },
          create: { userId: user.id },
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
