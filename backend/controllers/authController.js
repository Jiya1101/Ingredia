const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_in = process.env.JWT_EXPIRES_IN || 60;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.googleLogin = async(req, res, next) => {
    try{
        const {idToken} = req.body;

        if(!idToken){
            return res.status(400).json({message:'Google ID token is required for authentication.'});
        }

        const ticket = await client.verifyIdToken({
            idToken : idToken,
            audience : GOOGLE_CLIENT_ID,
        });

        const payLoad = ticket.getPayLoad();
        const googleId = payLoad.sub;
        const email = payLoad.email;
        const name = payLoad.name;
        const picture = payLoad.picture;


        let user = { googleId, email, name, picture };
        console.log(`User authenticated via Google: ${user.email}`);

        const customJwt = jwt.sign({
            id : user.googleId,
            email : user.email
        },
        JWT_SECRET,{
            expiresIn: JWT_EXPIRES_in}
        );

        res.status(200).json({
            status: 'success',
            token: customJwt, // The JWT your frontend will use for protected routes
            user: {
                id: user.googleId,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });

    } catch (error){
        console.error('Error during Google login process:', error.message);
        next(new Error('Authentication failed. Invalid Google ID token or server issue.'));

    }
};
