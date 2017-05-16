//Pulling all the packages...
/// BASE SETUP
var express = require("express");
var app = express();
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
var port = process.env.port || 8080;

// Getting the user defined models
var User = require('./models/user.js');
var Poll = require('./models/poll.js');
var PollJoiner = require('./models/pollJoiner.js');
var PollResult = require('./models/pollResult.js');
var PollOption = require('./models/pollOption.js');
var Role = require('./models/role.js');
var Event = require('./models/event.js');

// APP CONFIGURATION
// use body parser to get the info from the post requests
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//configure the app to set the CORS request
app.use(function(req,res,next){
    
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET, POST');
    res.setHeader('Access-Control-Allow-Headers','X-Requested-With, content-type, \Authorization');
    next();
});

// log all requests to console..
app.use(morgan('dev'));

// connect to our database
mongoose.connect('mongodb://localhost:27017/rosta_db');

// Routes for our API
var apiRouter = express.Router();

// middleware to use all the requests
apiRouter.use(function(req,res,next){
    
    // do the logging
    console.log('Somebody just came to to our app!');
    
    next();
});


// test route to make sure everything is working
apiRouter.get('/',function(req,res){
    
    res.json({message:'horray! welcome to our api!'});
    
});

//On the routes that end with /users
apiRouter.route('/users')

    //adding user to the db
    .post(function(req,res){
        
        var user = new User();
        
        //Setting the users from the request
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        user.sex = req.body.sex;
        user.picLocation = req.body.picLocation;
        user.phone = req.body.phone;
        user.email = req.body.email;
        user.roleId = req.body.roleId;
        user.active = req.body.active;
        
        //Saving the user in DB
        //accessed at POST http://localhost:8080/api/users
        user.save(function(err){
            
            if(err){
                
                if(err.code == 11000){
                    return res.json({status:false,message:'User already with that username exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({status:true,message:'User Created!'});
            
        });
        
    })
    
    //Getting the users from the DB
    //Accessed at GET http://localhost:8080/api/users
    .get(function(req,res){
       
        User.find(function(err,users){
            
            if(err) return res.send(err);
            
            return res.json(users);
        });
        
    });
    

//Route for authenticating users
apiRouter.post('/authenticate',function(req,res){
    
    //find the user
    //select the name username and password explicitly
    User.findOne({
        username:req.body.username
    }).select('name username password').exec(function(err,user){
        
        if(err) throw err;
        
        // no user with that username was found
        if(!user){
            res.json({
                success:false,
                message: 'Authentication failed. User not found.'
            });
        } else if(user){
            
            // check if password mathces
            var validPassword = user.comparePassword(req.body.password);
            if(!validPassword){
                
                res.json({
                    
                    success:false,
                    message:'Authentication failed. Wrong password'
                });
            } else {
                
                // if the user is found and the password is right
                // create a token
               /* var token = jwt.sign({
                    name:user.name,
                    username:user.username
                },superSectret,{
                    expiresInMinutes:1440 //expires in 24 hours
                });*/
                
                res.json({
                    success:true,
                    message:'Enjoy your token!',
                    token: 'This is still work in progress'
                });
            }
        }
    });
});
    
// Routes that end with /events    
apiRouter.route('/events')
    
    //Adding a event to DB
    //accessed at POST http://localhost:8080/api/events
    .post(function(req,res){
        
        var event = new Event();
        
        event.name = req.body.name;
        event.description = req.body.description;
        event.createdBy = req.body.createdBy;
        event.publishedOn = req.body.publishedOn;
        
        event.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Event already with that event exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Event Created!'});
        });
    })

    //get the events...
    //accessed at GET http://localhost:8080/api/events
    .get(function(req,res){
        
        Event.find(function(err,events){
            
            if(err) return res.send(err);
            
            return res.json(events);
        });
    });
    
// on the routes that end with /events/:event_id
apiRouter.route('/events/:event_id')

    // get the event..
    // accessed at GET http://localhost:8080/api/events/event_id
    .get(function(req,res) {
        // body...
        
        Event.findById(req.params.event_id,function(err,event){
            
            
            if (err) return res.send(err);
            
            // return the user
            res.json(event);
        });
    })
    
    //update the event..
    // accessed at PUT http://localhost:8080/api/events/event_id
    .put(function(req,res){
        
        Event.findById(req.params.event_id,function(err,event){
            
            if(err) return res.send(err);
            
            // update the event only if its new
            if(req.body.name) event.name = req.body.name;
            if(req.body.description) event.description = req.body.description;
            if(req.body.publishedOn) event.publishedOn = req.body.publishedOn;
            
            // save the user
            event.save(function(err) {
                
                if(err) return res.send(err);
                
                // return a message
                return res.json({message:'Event updated!'});
            });
            
            
        });
        
    })
    
    
    //delete an event..
    //accessed at DELETE http://localhost:8080/api/events/event_id
    .delete(function(req,res){
        
         Event.remove({
            
            _id: req.params.event_id
        },
        function(err,event){
            
            if(err) return res.send(err);
            
            res.json({message:'Successfully deleted!!',
                        event : event
            });
            
        });
        
    });

//On the routes that end with polls    
apiRouter.route('/polls')

    //Add a poll...
    // Accessed at POST http://localhost:8080/api/polls
    .post(function(req,res){
        
        var poll = new Poll();
        
        poll.name = req.body.name;
        poll.description = req.body.description;
        poll.eventID = req.body.eventID;
        poll.pollEndTime = req.body.pollEndTime;
        poll.createdOn = req.body.createdOn;
        poll.minParticipants = req.body.minParticipants;
        poll.isSinglePage = req.body.isSinglePage;
        poll.active = req.body.active;
        
        poll.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Poll already with that name exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Poll Created!'});
        });
        
    })
    
    //getting the polls
    //accssed at GET http://localhost:8080/api/polls
    .get(function(req,res){
        
         Poll.find(function(err,polls){
            
            if(err) return res.send(err);
            
            return res.json(polls);
        });
        
    });
    
// on the routes that end with polls/:poll_id
apiRouter.route('/polls/:poll_id')

    //To get the poll
    // accessed at GET http://localhost:8080/api/polls/poll_id
    .get(function(req,res){
        
        Event.findById(req.params.poll_id,function(err,poll){
            
            
            if (err) return res.send(err);
            
            // return the user
            res.json(poll);
        });
    })
    
    //To update the existing poll
    // accessed at PUT http://localhost:8080/api/polls/:poll_id
    .put(function(req,res){
        
         Poll.findById(req.params.poll_id,function(err,poll){
            
            if(err) return res.send(err);
            
            // update the event only if its new
             if(req.body.name)   poll.name = req.body.name;
             if(req.body.description) poll.description = req.body.description;
             if(req.body.eventID) poll.eventID = req.body.eventID;
             if(req.body.pollEndTime) poll.pollEndTime = req.body.pollEndTime;
             if(req.body.createdOn) poll.createdOn = req.body.createdOn;
             if(req.body.minParticipants) poll.minParticipants = req.body.minParticipants;
             if(req.body.isSinglePage) poll.isSinglePage = req.body.isSinglePage;
             if(req.body.active) poll.active = req.body.active;
                
            // save the user
            poll.save(function(err) {
                
                if(err) return res.send(err);
                
                // return a message
                return res.json({message:'Poll updated!'});
            });
            
         });    
    })
    
    //delete a poll
    //accessed at http://localhost:8080/api/poll/:poll_id
    .delete(function(req,res){
        
        
         Poll.remove({
            
            _id: req.params.poll_id
        },
        function(err,poll){
            
            if(err) return res.send(err);
            
            res.json({message:'Successfully deleted!!',
                        poll : poll
            });
            
        });
    });

//On the routes that end with /roles
apiRouter.route('/roles')

    //add a role
    //accessed at http://localhost:8080/api/roles
    .post(function(req, res) {
        
         var role = new Role();
        
        role.name = req.body.name;
        role.active = req.body.active;
        
        role.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Role already with that name exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Role Created!'});
        });
        
        
    })
    
    
    //Get the roles
    //accessed at GET http://localhost:8080/api/polls
    .get(function(req,res){
        
         Role.find(function(err,roles){
            
            if(err) return res.send(err);
            
            return res.json(roles);
        });
    });
    
//on the routes that end with /poll_options
apiRouter.route('/pollOptions')

    //Add the poll option
    //accessed at POST http://localhost:8080/api/poll_options
    .post(function(req, res) {
        
          var pollOption = new PollOption();
        
        pollOption.questionId = req.body.questionId;
        pollOption.options = req.body.options;
        pollOption.active = req.body.active;
        
        pollOption.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Poll Option already exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Poll Option Created!'});
        });
    })
    
    //get the poll options
    //accessed at GET http://localhost:8080/api/poll_options
    .get(function(req, res) {
        
         PollOption.find(function(err,pollOptions){
            
            if(err) return res.send(err);
            
            return res.json(pollOptions);
        });
    });
    
// On the routes that end with /poll_joiners
apiRouter.route('/poll_joiners')

    //Add a poll join
    //accessed at POST http://localhost:8080/api/poll_joiners
    .post(function(req, res) {
        
        var pollJoiner = new PollJoiner();
        
        pollJoiner.pollId = req.body.pollId;
        pollJoiner.joinedBy = req.body.joinedBy;
        pollJoiner.eventId = req.body.eventId;
        pollJoiner.active = req.body.active;
        
        pollJoiner.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Poll Joiner already exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Poll Joiner Created!'});
        });
        
    })
    
    //Get the poll joiners list
    // accessed at GET http://localhost:8080/api/poll_joiners
    .get(function(req, res) {
        
        
         PollJoiner.find(function(err,pollJoiners){
            
            if(err) return res.send(err);
            
            return res.json(pollJoiners);
        });
    });
    

// Route that ends with /poll_joiners/:poll_join_id
apiRouter.route('/poll_joiners/poll_join_id')

    .put(function(req,res){
        
         Poll.findById(req.params.poll_join_id,function(err,pollJoiner){
            
            if(err) return res.send(err);
            
            // update the event only if its new
             if(req.body.active)   pollJoiner.active = req.body.active;
            /* if(req.body.description) poll.description = req.body.description;
             if(req.body.eventID) poll.eventID = req.body.eventID;
             if(req.body.pollEndTime) poll.pollEndTime = req.body.pollEndTime;
             if(req.body.createdOn) poll.createdOn = req.body.createdOn;
             if(req.body.minParticipants) poll.minParticipants = req.body.minParticipants;
             if(req.body.isSinglePage) poll.isSinglePage = req.body.isSinglePage;
             if(req.body.active) poll.active = req.body.active;*/
                
            // save the user
            pollJoiner.save(function(err) {
                
                if(err) return res.send(err);
                
                // return a message
                return res.json({message:'Poll Joiner updated!'});
            });
            
         });    
    })
    
    //delete a pollJoiner
    //accessed at http://localhost:8080/api/poll_joiners/:poll_join_id
    .delete(function(req,res){
        
        
         PollJoiner.remove({
            
            _id: req.params.poll_join_id
        },
        function(err,pollJoiner){
            
            if(err) return res.send(err);
            
            res.json({message:'Successfully deleted!!',
                        pollJoiner : pollJoiner
            });
            
        });
    });
    

    
//on the routes that end with /poll_options
apiRouter.route('/poll_options')

     //Add the poll option
    //accessed at POST http://localhost:8080/api/poll_options
    .post(function(req, res) {
        
          var pollOption = new PollOption();
        
        pollOption.questionId = req.body.questionId;
        pollOption.options = req.body.options;
        pollOption.active = req.body.active;
        
        pollOption.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Poll Option already exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Poll Option Created!'});
        });
    })
    
    //get the poll options
    //accessed at GET http://localhost:8080/api/poll_options
    .get(function(req, res) {
        
         PollOption.find(function(err,pollOptions){
            
            if(err) return res.send(err);
            
            return res.json(pollOptions);
        });
    });
    
// On the routes that end with /poll_results
apiRouter.route('/poll_results')

    //Add a poll result
    //accessed at POST http://localhost:8080/api/poll_results
    .post(function(req, res) {
        
        var pollResult = new PollResult();
        
        pollResult.questionId = req.body.questionId;
        pollResult.optionId = req.body.optionId;
        pollResult.eventId = req.body.eventId;
        pollResult.pollId = req.body.pollId;
        pollResult.votedTime = req.body.votedTime;
        
        pollResult.save(function(err) {
            // body...
              if(err){
                
                if(err.code == 11000){
                    return res.json({message:'Poll Result already exists'});
                }else{
                    
                    return res.send(err);
                }
            }
            
            return res.json({message:'Poll Result Created!'});
        });
        
    })
    
    //Get the poll Results list
    // accessed at GET http://localhost:8080/api/poll_results
    .get(function(req, res) {
        
        
         PollResult.find(function(err,pollResults){
            
            if(err) return res.send(err);
            
            return res.json(pollResults);
        });
    });
    
    
//REGISTERING THE ROUTES------------
//----------------------------------
app.use('/api',apiRouter);

//Starting the server...
app.listen(port);
console.log('Magic happens at Port ' + port);
    