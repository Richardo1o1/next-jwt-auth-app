curl -i -X POST -H "Content-Type: application/json" \
-d '{"username": "user", "password": "user123"}' \
-c cookies.txt http://localhost:3000/api/auth/login 

curl -b cookies.txt http://localhost:3000/api/data