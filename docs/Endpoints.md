# $\color[RGB]{215,0,0} ིྀ྇$ $\color[RGB]{66, 215, 245}⁂̊⁑̥$ $\color[RGB]{0, 215, 0}⍋$ Endpoints in $\color[RGB]{212,175,55}Wishlist$ $\color[RGB]{212,175,55}To$ $\color[RGB]{212,175,55}Santa$ $\color[RGB]{0, 215, 0}⍋$ $\color[RGB]{66, 215, 245}⁑̥⁂̊$ $\color[RGB]{215,0,0} ིྀ྇$
## ➟ 𓉞 Introduction to Endpoints.md  
This is a list of all the API endpoints when navigating our localhost site. All endpoints enter information into the interactions database log when they recieve input from a given user. All specified user input along with site output that resulted from the given user interaction. The information is put into the interactions database log and is catagorized by interaction types such as an attempted login, stale login, successful login, and also records a users password and user name. All of these records are time stamped, have a description message based on category, and shows the username of the user who produced the given site interaction.
## List of Endpoints
### *app.get('/app', function(req, res))*
If the given person utilizing our site has an account set up already and is logged in (classified as "user"), they will be redirected to the 'settings' view. If the given person utilizing our site is not classified as a "user", they will be redirected to the 'login' view where they can log in.
### *app.get('/login', function(req, res))*
If the given person utilizing our site has an account set up already and is logged in (classified as "user"), they will be redirected to the 'settings' view. If the given person utilizing our site is not classified as a "user", they will be redirected to the 'login' view where they can log in.
### *app.get('/register', function(req, res))*
If the given person utilizing our site has an account set up already and is logged in (classified as "user"), they will be redirected to the 'settings' view. If the given person utilizing our site is not classified as a "user", they will be redirected to the 'register' view where they can sign up for a new account.
### *app.post('/login', function(req, res))*
Decides if a given users login attempt is successful or not and reacts accordingly.
### *app.get('/stalelogin', function(req, res))*
Renders the 'stalelogin' view when a login request has gone stale.
### *app.post('/register', function(req, res))*
Records and creates a user account in the database when a given user signs up for our site with their desired username and password.
### *app.get('/settings', function(req, res))*
Renders the 'settings' view.
### *app.get('/logout', function(req, res))*
Allows a user to log out of their account and sets 'user', 'pass', 'email' credentials all to the value of null.
### *app.get('/delete', function(req, res))*
Allows a user to delete their account from the data base.
### *app.get('/deletelogs', function(req, res))*
Allows the host of the site to delete logs pertaining to past user interaction from the data base.
### Hidden: *app.get('/view_all_logs', function(req, res))*
Allows the host of the site to view all logs pertaining to past user interaction from the data base.
### *app.get('/wishlist', function(req, res))*
Renders the 'wishlist' view.
### *app.post('/additem', function(req, res))*
Allows the user to input the name of a gift and on submit, the entry is saved to the user's wishlist.
### *app.get('/clearwishlist', function(req, res))*
Allows a user to delete all prior recorded entries on their wishlist.
### *app.get('/sendwishlistform', function(req, res))*
Renders the 'sendwishlistform' view.
### *app.post('/sendwishlist', function(req, res))*
Function of the kid's wishlist being sent to the parent's entered email address.
