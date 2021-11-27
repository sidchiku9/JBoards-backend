const express = require('express')
const auth = require('../../middleware/auth')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@router GET api/profile/me
//@desc  Get current users profile
//@access PRIVATE

router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }

        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

//@router POST api/profile
//@desc  Create/Update user profile
//@access PRIVATE

router.post('/', [auth, [
    check('status', 'Status is required')
    .not()
    .isEmpty(),
    check('skills', 'Skills are required')
    .not()
    .isEmpty()
]], async(req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    //Build profile object
    const profileFields = {}
    profileFields.user = req.user.id

    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername

    if (skills) {
        profileFields.skills = skills.split(',').map(
            skill => skill.trim()
        )
    }

    // Build social objects

    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({ user: req.user.id })

        if (profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            console.log('Profile updated')
            return res.json(profile)
        }

        //CREATE A NEW PROFILE

        profile = new Profile(profileFields)
        await profile.save()
        console.log('New profile created')
        res.json(profile)

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

//@router GET api/profile
//@desc  Get all profiles
//@access PUBLIC

router.get("/", async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

//@router GET api/profile/user/:used_id
//@desc  Get profile by user id
//@access PUBLIC

router.get("/user/:user_id", async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(500).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)
    } catch (error) {
        console.error(error.message)

        if (error.kind == 'ObjectId') {
            return res.status(500).json({ msg: 'There is no profile for this user' })
        }
        res.status(500).send('Server error')
    }
})

module.exports = router
module.exports = router