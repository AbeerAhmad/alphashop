var express = require('express');
var server = express();
var body_parser = require('body-parser');
var multer = require('multer')  
var session = require('express-session');
var passport = require("passport");
var LocalStrategy = require("passport-local");
server.use(body_parser.urlencoded())
server.use(body_parser.json())
server.use(express.static('./build'))
server.use(express.static('./'))

var mongoose = require('mongoose');
const mymongo='mongodb://abeer:asad1234@ds115071.mlab.com:15071/alphashop'
mongoose.connect( mymongo||'mongodb://localhost:27017/Alpha', { useNewUrlParser: true })
mongoose.connection.once('open', function () { console.log('Successfully Connected to DB') })
const User = mongoose.model('user', { username: String, fullname: String, password: String, contact: Number, email: String, });
const AD=mongoose.model('ad',{userId:String, type:String,purpose:String, location:String, area:Number,unit:String, price:Number, recommendation:Array,files:Array,Address:String })


// var customConfig = multer.diskStorage({
//     destination: function (req, file, next) {
//         next(null, './materialui/upload')
//     },
//     filename: function (req, file, next) {
//         next(null, Math.floor(Math.random()*100000000) + '-' + file.originalname)
//     }
// })

server.post('/addetail',(req,res)=>{
    let id =req.body._id
    AD.findById(id,function(err,data){
        res.json(data)
    })
})








server.post('/Newdata', (req,res)=>{
    let id=req.body.id

    AD.find({
        _id:id
    }).exec(function (err, users) {
        if (err) {
            return res.json({ success: false, err: err })
        }
        res.json(users)
    });
})

server.post('/userads', (req,res)=>{
    let id=req.body.id

    AD.find({
        userId:id
    }).exec(function (err, ads) {
        if (err) {
            return res.json({ success: false, err: err })
        }
            res.json(ads)
    });
})



server.post('/searching', (req, res) => {
    let city=req.body.city
    let prefer=req.body.prefer

    AD.find({
        location:city,
        recommendation:prefer,

    }).exec(function (err, users) {
        if (err) {
            return res.json({ success: false, err: err })
        }
        res.json(users)
    });
})



// var upload = multer({ storage: customConfig })
var upload = multer({ dest: 'upload/' })


server.post('/create', upload.array('file'), function (req, res) {
    let ad=new AD({ userId:req.body.user,type:req.body.type,purpose:req.body.purpose, location:req.body.city, area:req.body.area,unit:req.body.unit, price:req.body.price, recommendation:req.body.recommendation ,files:req.files ,Address:req.body.address })
  
    ad.save(() => console.log('added to db'))
    res.send(ad)

})

server.post('/signup', function (req, res) {
    let user = new User({ fullname: req.body.fullname, username: req.body.username, email: req.body.email, contact: req.body.contact, password: req.body.password })
    user.save(() => console.log('added to db'))
    res.send(user)

})


server.get('/getads', (req, res) => {

    AD.find().exec(function (err, users) {
        if (err) {
            return res.json({ success: false, err: err })
        }
        res.json(users)
    });
})







//passport local strategy





passport.use(new LocalStrategy(
    function (username, password, next) {
        User.findOne({ username: username, password: password }, function (err, user) {
            if (user) { return next(null, user); }
            if(!user) {
                return next(null, false)
            };
            return next(null, false)
        });

    }
));
passport.serializeUser(function (user, next) {
    next(null, user)
})
passport.deserializeUser(function (_id, next) {
    User.findOne({_id:_id},(err,user) => {
        next(null,user)
    })
    // next(null, user);
})
server.use(session({ secret: "secret-word" }));
server.use(passport.initialize());
server.use(passport.session());

server.post('/signin', passport.authenticate('local'), function (req, res) {

    res.json(req.user)

})
server.get('/logout',(req,res)=>{
    req.logout();
    res.json('logout')
})
server.get('/is_authenticated',(req,res)=>{
    res.json(req.user||{res:false})
})
//passport end



server.listen(process.env.PORT || 7000, () => { console.log('Server is running Successfully') })