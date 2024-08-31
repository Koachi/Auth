Routes

🔖1) Sign-up
Endpoint: {{URL}}/api/v1/signup
Method: POST
Request Body:

The body contains the following schema

 {
  "fullname":"",
  "username":"",
  "email": "",
  "password": "",
  "confirmPassword": "",
  "role": "",
  "licenseNumber": "", //Required only if role is 'doctor'
  "hospitalName" : "", // Required only if role is 'doctor'
  "agreedToTerms": ""
}

(src/models/userModel.js)

Response
On Successsful Registration
status_code: 201
message: Confirmation message (e.g., "User account created successfully")
data: user

On Error
status_code: 400
error message (e.g., "Username already exists", "Invalid email").

Security
Implement email verification to confirm user identity and prevent spam.
Store passwords securely by hashing it into tokens using crypto modules.

🔖2) Login
Endpoint: {{URL}}/api/v1/login
Method: POST
Request Body:

The body contains the following schema
{
"email": "",
"password": ""
}

Response
On Successsful Login
status_code: 200
access_token (string): JWT token for authentication..
message: Confirmation message (e.g., "User has successfully logged in" )
data: user

On Error
status_code: 400 with appropriate error message (e.g., "Username already exists", "Invalid email").

Security
Use HTTPS for secure communicationHash passwords with a strong algorithm like bcrypt before storing them

Authentication
We are using the following for authentication
After Signup, ((JWT)) will be issued to the user and stored in the database.
For Login, if email and password is correct, return the jwt in the database and log the user in.
Authentication success response
status_code: 200, 201

Authentication error response
status_code: 400

🔖3) Forgot Password
Endpoint: {{URL}}/api/v1/forgotPassword
Method: POST
Request Body:

The body contains the following schema
{
  "email": ""
}

Response
On Success
On Error

🔖4) Reset Password
Endpoint: {{URL}}/api/v1/resetPassword/:token
Method: PATCH
Request Body:

The body contains the following schema
{
    "email": ""
    "password": ""
    "confirmPassword": ""
}

Response
On Success
On Error


