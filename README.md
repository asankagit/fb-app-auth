# fb-app-auth
Read page contents

##Generate openssl
# Generate pvt key
`openssl genrsa -out server.key 2048`

#Generate self-signed certificate
`
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

`
reference:https://github.com/passport/todos-express-facebook/blob/master/views/login.ejs