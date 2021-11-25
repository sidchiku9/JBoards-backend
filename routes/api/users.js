const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')
    //@router POST api/users
    //@desc  Register user
    //@access PUBLIC

router.post('/', [
    //these messages can be displayed inside react
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async(req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
        //See if the user exists: if YES then send error

        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }

        //Get the user's gravatar

        const avatar = gravatar.url(email, {
            s: '200', //size
            r: 'pg', //no NSFW
            d: 'mm' //some default picture
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt the password

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save()

        //user is registering successfully up till the above code

        //Return JWT

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload,
                config.get('jwtsecret'),
                (err, token) => {
                    if (err) throw err
                    res.json({ token })
                }) //change this : the expire thingy { expiresIn: 360000000 },

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router