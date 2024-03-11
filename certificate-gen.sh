#!/bin/bash
# Generate pvt key
openssl genrsa -out server.key 2048

echo "Private key generated"

#Generate self-signed certificate
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -subj "/CN=localhost"


