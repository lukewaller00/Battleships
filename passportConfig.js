const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./schema/User');

function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) =>{
        const user = await getUserByEmail(email);
        console.log(user[0])
        if (user[0] == null){
            return done(null, false, {message: "No User with inputted email"});
        }
        try{
            if (await bcrypt.compare(password, user[0].password)){
                return done(null, user[0]);
            }
            else{
                return done(null, false, {message: "Incorrect Password"});
            }
        }
        catch(e){
            return done (e);
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => {
        console.log("serializing user into session")
        console.log(user)
        done(null, user.id)});
    
    passport.deserializeUser(async (id, done) => {
        console.log("deserializing user")
        console.log(id)
        try{
            const user = await User.findById(id)
            done(null, user)
        }
        catch(e){
            console.log(e)
        }
    });
}

module.exports = initialize